'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoClientSession, isDemoSession } from '@/features/demo/server'

export interface NutritionMealView {
  id: string
  nombre: string
  orden: number
  descripcion: string | null
  calorias: number | null
  proteinaG: number | null
  imagenUrl: string | null
}

export interface NutritionPlanView {
  id: string
  nombre: string
  caloriasObjetivo: number | null
  proteinaObjetivoG: number | null
  notas: string | null
  meals: NutritionMealView[]
}

const demoMeals: NutritionMealView[] = [
  { id: 'demo-1', nombre: 'Desayuno', orden: 0, descripcion: 'Yogur griego, avena, frutos rojos y nueces', calorias: 520, proteinaG: 38, imagenUrl: null },
  { id: 'demo-2', nombre: 'Comida', orden: 1, descripcion: 'Arroz, pollo, verduras y aceite de oliva', calorias: 710, proteinaG: 52, imagenUrl: null },
]

function demoPlan(): NutritionPlanView {
  return {
    id: 'demo-plan',
    nombre: 'Plan nutricional',
    caloriasObjetivo: 2150,
    proteinaObjetivoG: 150,
    notas: 'Prioridad: mantener proteína alta y simplificar cenas los días de entrenamiento.',
    meals: demoMeals,
  }
}

function mapPlan(plan: { id: string; nombre: string; calorias_objetivo: number | null; proteina_objetivo_g: number | null; notas: string | null }, meals: NutritionMealView[]): NutritionPlanView {
  return {
    id: plan.id,
    nombre: plan.nombre,
    caloriasObjetivo: plan.calorias_objetivo,
    proteinaObjetivoG: plan.proteina_objetivo_g,
    notas: plan.notas,
    meals,
  }
}

function mapMeal(row: { id: string; nombre: string; orden: number; descripcion: string | null; calorias: number | null; proteina_g: number | null; imagen_url: string | null }): NutritionMealView {
  return {
    id: row.id,
    nombre: row.nombre,
    orden: row.orden,
    descripcion: row.descripcion,
    calorias: row.calorias,
    proteinaG: row.proteina_g,
    imagenUrl: row.imagen_url,
  }
}

async function fetchMeals(supabase: Awaited<ReturnType<typeof createClient>>, planId: string) {
  const { data, error } = await supabase
    .from('comidas_nutricionales')
    .select('id, nombre, orden, descripcion, calorias, proteina_g, imagen_url')
    .eq('plan_id', planId)
    .order('orden', { ascending: true })
  if (error) {
    console.error('[nutrition] fetchMeals error', error)
    return []
  }
  return data.map(mapMeal)
}

// Vista del portal cliente: el plan asignado a quien está logueado, o null si
// su coach todavía no le ha creado uno.
export async function getMyNutritionPlan(): Promise<NutritionPlanView | null> {
  if (await isDemoClientSession()) return demoPlan()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: plan, error } = await supabase
    .from('planes_nutricionales')
    .select('id, nombre, calorias_objetivo, proteina_objetivo_g, notas')
    .maybeSingle()
  if (error) {
    console.error('[nutrition] getMyNutritionPlan error', error)
    return null
  }
  if (!plan) return null

  const meals = await fetchMeals(supabase, plan.id)
  return mapPlan(plan, meals)
}

// Vista de la ficha del coach: el plan de un cliente concreto, o null si
// todavía no existe (el coach lo crea explícitamente desde la pestaña).
export async function getClientNutritionPlan(clienteId: string): Promise<NutritionPlanView | null> {
  if (await isDemoSession()) return demoPlan()

  const supabase = await createClient()
  const { data: plan, error } = await supabase
    .from('planes_nutricionales')
    .select('id, nombre, calorias_objetivo, proteina_objetivo_g, notas')
    .eq('cliente_id', clienteId)
    .maybeSingle()
  if (error) {
    console.error('[nutrition] getClientNutritionPlan error', error)
    return null
  }
  if (!plan) return null

  const meals = await fetchMeals(supabase, plan.id)
  return mapPlan(plan, meals)
}

export async function createNutritionPlan(clienteId: string) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'No autenticado.' }

  const { error } = await supabase
    .from('planes_nutricionales')
    .insert({ entrenador_id: user.id, cliente_id: clienteId })

  if (error) {
    console.error('[nutrition] createNutritionPlan error', error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}

const planSettingsSchema = z.object({
  nombre: z.string().min(1).max(80).optional(),
  caloriasObjetivo: z.number().int().min(0).max(20000).nullable().optional(),
  proteinaObjetivoG: z.number().int().min(0).max(2000).nullable().optional(),
  notas: z.string().max(1000).nullable().optional(),
})

export async function updateNutritionPlanSettings(clienteId: string, planId: string, input: z.infer<typeof planSettingsSchema>) {
  const parsed = planSettingsSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  if (await isDemoSession()) return { success: true }

  const supabase = await createClient()
  const patch: Partial<{
    nombre: string
    calorias_objetivo: number | null
    proteina_objetivo_g: number | null
    notas: string | null
  }> = {}
  if (parsed.data.nombre !== undefined) patch.nombre = parsed.data.nombre
  if (parsed.data.caloriasObjetivo !== undefined) patch.calorias_objetivo = parsed.data.caloriasObjetivo
  if (parsed.data.proteinaObjetivoG !== undefined) patch.proteina_objetivo_g = parsed.data.proteinaObjetivoG
  if (parsed.data.notas !== undefined) patch.notas = parsed.data.notas

  const { error } = await supabase.from('planes_nutricionales').update(patch).eq('id', planId)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}

export async function createMeal(clienteId: string, planId: string, nombre: string) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }
  if (!nombre.trim()) return { error: 'El nombre de la comida es obligatorio.' }

  const supabase = await createClient()
  const { count } = await supabase
    .from('comidas_nutricionales')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', planId)

  const { error } = await supabase
    .from('comidas_nutricionales')
    .insert({ plan_id: planId, nombre: nombre.trim(), orden: count ?? 0 })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}

const mealPatchSchema = z.object({
  descripcion: z.string().max(500).nullable().optional(),
  calorias: z.number().int().min(0).max(10000).nullable().optional(),
  proteinaG: z.number().int().min(0).max(1000).nullable().optional(),
})

export async function updateMeal(clienteId: string, mealId: string, input: z.infer<typeof mealPatchSchema>) {
  const parsed = mealPatchSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  if (await isDemoSession()) return { success: true }

  const supabase = await createClient()
  const patch: Partial<{
    descripcion: string | null
    calorias: number | null
    proteina_g: number | null
  }> = {}
  if (parsed.data.descripcion !== undefined) patch.descripcion = parsed.data.descripcion
  if (parsed.data.calorias !== undefined) patch.calorias = parsed.data.calorias
  if (parsed.data.proteinaG !== undefined) patch.proteina_g = parsed.data.proteinaG

  const { error } = await supabase.from('comidas_nutricionales').update(patch).eq('id', mealId)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}

export async function deleteMeal(clienteId: string, mealId: string) {
  if (await isDemoSession()) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase.from('comidas_nutricionales').delete().eq('id', mealId)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function uploadMealImage(clienteId: string, mealId: string, formData: FormData) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }

  const file = formData.get('imagen')
  if (!(file instanceof File) || file.size === 0) return { error: 'Selecciona una imagen.' }
  if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen.' }
  if (file.size > MAX_IMAGE_BYTES) return { error: 'La imagen no puede superar 5 MB.' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'No autenticado.' }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${user.id}/${mealId}-${Date.now()}.${extension}`

  const { error: uploadError } = await supabase.storage.from('nutrition-images').upload(path, file, { upsert: true })
  if (uploadError) return { error: uploadError.message }

  const { data: publicUrlData } = supabase.storage.from('nutrition-images').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('comidas_nutricionales')
    .update({ imagen_url: publicUrlData.publicUrl })
    .eq('id', mealId)
  if (updateError) return { error: updateError.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true, url: publicUrlData.publicUrl }
}
