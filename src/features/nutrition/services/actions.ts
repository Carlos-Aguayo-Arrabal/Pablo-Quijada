'use server'

import { z } from 'zod'
import { generateObject, generateImage } from 'ai'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoClientSession, isDemoSession } from '@/features/demo/server'
import { getOpenAI, MODELS } from '@/lib/ai/openai'

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

// Sube unos bytes ya obtenidos (banco de imágenes o IA) al mismo bucket y con
// la misma convención de ruta que uploadMealImage, evitando enlazar directo a
// una URL externa que puede caducar o desaparecer.
async function storeMealImageBytes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entrenadorId: string,
  clienteId: string,
  mealId: string,
  bytes: Uint8Array,
  contentType: string,
  extension: string
) {
  const path = `${entrenadorId}/${mealId}-${Date.now()}.${extension}`
  const { error: uploadError } = await supabase.storage
    .from('nutrition-images')
    .upload(path, bytes, { upsert: true, contentType })
  if (uploadError) return { error: uploadError.message }

  const { data: publicUrlData } = supabase.storage.from('nutrition-images').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('comidas_nutricionales')
    .update({ imagen_url: publicUrlData.publicUrl })
    .eq('id', mealId)
  if (updateError) return { error: updateError.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true as const, url: publicUrlData.publicUrl }
}

// Opción gratuita y por defecto: busca una foto de dominio público (CC0) en
// Openverse (openverse.org, API pública sin necesidad de clave) a partir del
// nombre de la comida. Sin coste, sin claves nuevas que configurar.
// Openverse indexa sobre todo contenido en inglés: "Desayuno" no encuentra
// nada aunque exista de sobra para "breakfast". Traducimos los tipos de
// comida habituales y, si no reconocemos el nombre, caemos a una búsqueda
// genérica de comida apetitosa en vez de fallar — la vía gratuita nunca debe
// quedarse sin resultado.
const MEAL_TYPE_TRANSLATIONS: Record<string, string> = {
  desayuno: 'breakfast',
  comida: 'lunch',
  almuerzo: 'lunch',
  cena: 'dinner',
  merienda: 'snack',
  snack: 'snack',
  postre: 'dessert',
  batido: 'smoothie',
  ensalada: 'salad',
}

function stockSearchQueryFor(mealName: string) {
  const normalized = mealName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
  return MEAL_TYPE_TRANSLATIONS[normalized] ?? 'healthy food plate'
}

export async function searchMealStockImage(clienteId: string, mealId: string, query: string) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }
  if (!query.trim()) return { error: 'Escribe primero el nombre de la comida.' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'No autenticado.' }

  const searchUrl = `https://api.openverse.org/v1/images/?${new URLSearchParams({
    q: stockSearchQueryFor(query),
    license: 'cc0,pdm',
    category: 'photograph',
    page_size: '1',
  })}`

  let candidateUrl: string
  try {
    const searchResponse = await fetch(searchUrl, { headers: { 'User-Agent': 'TrainTools/1.0' } })
    if (!searchResponse.ok) return { error: 'No se pudo buscar la imagen. Inténtalo de nuevo.' }
    const searchData = await searchResponse.json() as { results?: { url?: string }[] }
    const first = searchData.results?.[0]?.url
    if (!first) return { error: 'No se encontró ninguna foto libre para esta comida.' }
    candidateUrl = first
  } catch {
    return { error: 'No se pudo buscar la imagen. Inténtalo de nuevo.' }
  }

  try {
    const imageResponse = await fetch(candidateUrl)
    if (!imageResponse.ok) return { error: 'No se pudo descargar la imagen encontrada.' }
    const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg'
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const bytes = new Uint8Array(await imageResponse.arrayBuffer())
    return await storeMealImageBytes(supabase, user.id, clienteId, mealId, bytes, contentType, extension)
  } catch {
    return { error: 'No se pudo descargar la imagen encontrada.' }
  }
}

// Genera una foto realista con IA (gpt-image-1, usa la OPENAI_API_KEY ya
// configurada en el proyecto). Tiene coste por imagen y tarda unos segundos.
export async function generateMealImageAI(clienteId: string, mealId: string, mealName: string, mealDescription: string | null) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'No autenticado.' }

  const prompt = `Fotografía de comida profesional y realista de "${mealName}"${mealDescription ? `: ${mealDescription}` : ''}. Vista cenital, luz natural, plato apetitoso, fondo neutro de cocina. Sin texto ni marcas de agua.`

  try {
    const { image } = await generateImage({
      model: getOpenAI().image('gpt-image-1'),
      prompt,
      size: '1024x1024',
    })
    return await storeMealImageBytes(supabase, user.id, clienteId, mealId, image.uint8Array, image.mediaType ?? 'image/png', 'png')
  } catch {
    return { error: 'No se pudo generar la imagen con IA. Inténtalo de nuevo en unos minutos.' }
  }
}

const aiPlanSchema = z.object({
  nombre: z.string().describe('Nombre corto del plan, ej. "Plan nutricional — déficit moderado"'),
  caloriasObjetivo: z.number().int().describe('Calorías diarias objetivo, coherentes con el objetivo del cliente'),
  proteinaObjetivoG: z.number().int().describe('Gramos de proteína diarios objetivo'),
  notas: z.string().describe('Una frase con la prioridad nutricional principal para este cliente'),
  meals: z.array(z.object({
    nombre: z.string().describe('Ej: Desayuno, Comida, Cena, Snack'),
    descripcion: z.string().describe('Ingredientes principales, breve'),
    calorias: z.number().int(),
    proteinaG: z.number().int(),
  })).describe('Entre 3 y 5 comidas que sumen aproximadamente las calorías objetivo'),
})

// Genera un plan completo (objetivos + comidas) con IA a partir del objetivo,
// nivel y datos biométricos ya registrados del cliente. Crea el plan si no
// existía todavía.
export async function generateNutritionPlanAI(clienteId: string) {
  if (await isDemoSession()) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'No autenticado.' }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('nombre, objetivo, nivel, peso, altura, edad, lesiones')
    .eq('id', clienteId)
    .single()
  if (!cliente) return { error: 'Cliente no encontrado.' }

  const prompt = `Eres un nutricionista deportivo. Diseña un plan nutricional diario para este cliente.

Cliente: ${cliente.nombre}
Objetivo: ${cliente.objetivo ?? 'sin especificar'}
Nivel de entrenamiento: ${cliente.nivel ?? 'sin especificar'}
Peso: ${cliente.peso ?? 'sin especificar'}
Altura: ${cliente.altura ? `${cliente.altura} cm` : 'sin especificar'}
Edad: ${cliente.edad ?? 'sin especificar'}
Lesiones o patologías a tener en cuenta: ${cliente.lesiones || 'ninguna registrada'}

Si faltan datos, usa valores razonables para un adulto activo. Genera entre 3 y 5 comidas (Desayuno, Comida, Cena y opcionalmente Snacks) cuyas calorías sumen aproximadamente el objetivo diario. Responde siempre en español.`

  let plan: z.infer<typeof aiPlanSchema>
  try {
    const result = await generateObject({
      model: getOpenAI()(MODELS.balanced),
      schema: aiPlanSchema,
      prompt,
      maxOutputTokens: 1500,
    })
    plan = result.object
  } catch {
    return { error: 'No se pudo generar el plan con IA. Inténtalo de nuevo en unos minutos.' }
  }

  const { data: existingPlan } = await supabase
    .from('planes_nutricionales')
    .select('id')
    .eq('cliente_id', clienteId)
    .maybeSingle()

  let planId = existingPlan?.id
  if (planId) {
    const { error } = await supabase
      .from('planes_nutricionales')
      .update({
        nombre: plan.nombre,
        calorias_objetivo: plan.caloriasObjetivo,
        proteina_objetivo_g: plan.proteinaObjetivoG,
        notas: plan.notas,
      })
      .eq('id', planId)
    if (error) return { error: error.message }
  } else {
    const { data: inserted, error } = await supabase
      .from('planes_nutricionales')
      .insert({
        entrenador_id: user.id,
        cliente_id: clienteId,
        nombre: plan.nombre,
        calorias_objetivo: plan.caloriasObjetivo,
        proteina_objetivo_g: plan.proteinaObjetivoG,
        notas: plan.notas,
      })
      .select('id')
      .single()
    if (error || !inserted) return { error: error?.message ?? 'No se pudo crear el plan.' }
    planId = inserted.id
  }

  const { error: mealsError } = await supabase
    .from('comidas_nutricionales')
    .insert(
      plan.meals.map((meal, index) => ({
        plan_id: planId,
        nombre: meal.nombre,
        orden: index,
        descripcion: meal.descripcion,
        calorias: meal.calorias,
        proteina_g: meal.proteinaG,
      }))
    )
  if (mealsError) return { error: mealsError.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}
