'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getDemoWorkoutPlanById, getDemoWorkoutPlans, getDemoWorkoutStats } from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'
import type { WorkoutCategory, WorkoutDay, WorkoutLevel, WorkoutPlan } from '@/features/workouts/data'

type PlanRow = {
  id: string
  titulo: string
  categoria: string
  nivel: string
  duracion_semanas: number
  sesiones_por_semana: number
  clientes_asignados: number
  adherencia: number
  precio: string | null
  descripcion: string | null
  etiquetas: string[]
  dias: unknown
}

const workoutCategories: WorkoutCategory[] = ['Fuerza', 'Pérdida de grasa', 'Hipertrofia', 'Readaptación', 'Nutrición']
const workoutLevels: WorkoutLevel[] = ['Principiante', 'Intermedio', 'Avanzado']

function normalizeCategory(category: string): WorkoutCategory {
  return workoutCategories.includes(category as WorkoutCategory) ? category as WorkoutCategory : 'Fuerza'
}

function normalizeLevel(level: string): WorkoutLevel {
  return workoutLevels.includes(level as WorkoutLevel) ? level as WorkoutLevel : 'Intermedio'
}

function normalizeDays(days: unknown): WorkoutDay[] {
  return Array.isArray(days) ? days as WorkoutDay[] : []
}

function mapPlan(row: PlanRow): WorkoutPlan {
  return {
    id: row.id,
    title: row.titulo,
    category: normalizeCategory(row.categoria),
    level: normalizeLevel(row.nivel),
    durationWeeks: row.duracion_semanas,
    sessionsPerWeek: row.sesiones_por_semana,
    assignedClients: row.clientes_asignados,
    adherence: row.adherencia,
    price: row.precio ?? '—',
    description: row.descripcion ?? '',
    tags: row.etiquetas ?? [],
    days: normalizeDays(row.dias),
  }
}

export async function listWorkoutPlans(): Promise<WorkoutPlan[]> {
  if (await isDemoSession()) return getDemoWorkoutPlans()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('planes_entrenamiento')
    .select('*')
    .order('creado_en', { ascending: false })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoWorkoutPlans()

  return rows.map(mapPlan)
}

export async function getWorkoutPlanById(id: string): Promise<WorkoutPlan | null> {
  if (await isDemoSession()) return getDemoWorkoutPlanById(id)

  const supabase = await createSupabaseClient()
  const { data } = await supabase.from('planes_entrenamiento').select('*').eq('id', id).single()
  return data ? mapPlan(data) : getDemoWorkoutPlanById(id)
}

export async function getWorkoutStats() {
  if (await isDemoSession()) return getDemoWorkoutStats()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase.from('planes_entrenamiento').select('adherencia, clientes_asignados, precio')
  const rows = data ?? []
  if (error || rows.length === 0) return getDemoWorkoutStats()

  const avgAdherence = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.adherencia, 0) / rows.length)
    : 0
  const activeAssignments = rows.reduce((sum, r) => sum + r.clientes_asignados, 0)
  const paidPlans = rows.filter((r) => (r.precio ?? '').trim().length > 0).length

  return {
    templates: rows.length,
    activeAssignments,
    avgAdherence,
    paidPlans,
  }
}

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1),
  reps: z.string().min(1),
  rest: z.number().int().min(0),
  rpe: z.string(),
  tempo: z.string(),
  notes: z.string(),
})

const createWorkoutSchema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres'),
  category: z.enum(workoutCategories),
  exercises: z.array(exerciseSchema).min(1, 'Añade al menos un ejercicio'),
})

export async function createWorkoutPlan(input: {
  title: string
  category: string
  exercises: z.infer<typeof exerciseSchema>[]
}) {
  const parsed = createWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/workouts')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const days: WorkoutDay[] = [
    {
      day: 'Día 1',
      title: parsed.data.title,
      focus: parsed.data.category,
      duration: 0,
      exercises: parsed.data.exercises,
    },
  ]

  const { error } = await supabase.from('planes_entrenamiento').insert({
    entrenador_id: user.id,
    titulo: parsed.data.title,
    categoria: parsed.data.category,
    dias: days,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/workouts')
  return { success: true }
}
