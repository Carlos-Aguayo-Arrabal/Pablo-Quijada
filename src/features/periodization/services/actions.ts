'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { isDemoSession } from '@/features/demo/server'
import type { WorkoutCategory, WorkoutExercise } from '@/features/workouts/data'
import type { ProgramPhaseView } from '@/features/periodization/data'

export interface ProgramWeekView {
  id: string
  numeroSemana: number
}

export interface ProgramPhaseWithWeeks extends ProgramPhaseView {
  weeks: ProgramWeekView[]
}

export interface CalendarWorkoutView {
  id: string
  nombre: string
  diaSemana: number
}

export interface ProgramWorkspace {
  programId: string
  isReadOnlyDemo: boolean
  phases: ProgramPhaseWithWeeks[]
  workoutsByWeek: Record<string, CalendarWorkoutView[]>
}

const phaseNamesByCategory: Record<WorkoutCategory, string[]> = {
  Fuerza: ['General Strength', 'Intensificación', 'Realización'],
  Hipertrofia: ['Volumen base', 'Sobrecarga', 'Especialización'],
  'Pérdida de grasa': ['Base metabólica', 'Densidad', 'Consolidación'],
  Readaptación: ['Control motor', 'Fuerza progresiva', 'Retorno'],
  Nutrición: ['Adherencia', 'Ajuste', 'Consolidación'],
}

function demoWorkspace(category: WorkoutCategory, totalWeeks: number): ProgramWorkspace {
  const names = phaseNamesByCategory[category] ?? phaseNamesByCategory.Fuerza
  const phaseCount = Math.min(3, Math.max(1, totalWeeks))
  const baseWeeks = Math.floor(totalWeeks / phaseCount)
  const extraWeeks = totalWeeks % phaseCount

  const phases: ProgramPhaseWithWeeks[] = Array.from({ length: phaseCount }, (_, index) => {
    const durationWeeks = baseWeeks + (index < extraWeeks ? 1 : 0)
    return {
      id: `demo-phase-${index + 1}`,
      name: names[index] ?? `Fase ${index + 1}`,
      durationWeeks,
      weeks: Array.from({ length: durationWeeks }, (_, weekIndex) => ({
        id: `demo-phase-${index + 1}-week-${weekIndex + 1}`,
        numeroSemana: weekIndex + 1,
      })),
    }
  })

  const workoutsByWeek: Record<string, CalendarWorkoutView[]> = {}
  const seed: Array<{ phaseIndex: number; weekNumber: number; diaSemana: number; nombre: string }> = [
    { phaseIndex: 0, weekNumber: 1, diaSemana: 1, nombre: 'Full Body' },
    { phaseIndex: 0, weekNumber: 1, diaSemana: 3, nombre: 'Lower' },
    { phaseIndex: 0, weekNumber: 1, diaSemana: 5, nombre: 'Upper' },
    { phaseIndex: 1, weekNumber: 1, diaSemana: 1, nombre: 'Power' },
    { phaseIndex: 1, weekNumber: 1, diaSemana: 4, nombre: 'Circuit' },
  ]
  for (const item of seed) {
    const phase = phases[item.phaseIndex]
    const week = phase?.weeks[item.weekNumber - 1]
    if (!week) continue
    workoutsByWeek[week.id] ??= []
    workoutsByWeek[week.id].push({ id: `demo-workout-${item.phaseIndex}-${item.diaSemana}`, nombre: item.nombre, diaSemana: item.diaSemana })
  }

  return { programId: 'demo-program', isReadOnlyDemo: true, phases, workoutsByWeek }
}

async function createInitialPhasesForProgram(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  programId: string,
  category: WorkoutCategory,
  totalWeeks: number
) {
  const names = phaseNamesByCategory[category] ?? phaseNamesByCategory.Fuerza
  const phaseCount = Math.min(3, Math.max(1, totalWeeks))
  const baseWeeks = Math.floor(totalWeeks / phaseCount)
  const extraWeeks = totalWeeks % phaseCount

  for (let index = 0; index < phaseCount; index += 1) {
    const durationWeeks = baseWeeks + (index < extraWeeks ? 1 : 0)
    const { data: phase, error: phaseError } = await supabase
      .from('fases_programa')
      .insert({
        programa_id: programId,
        nombre: names[index] ?? `Fase ${index + 1}`,
        orden: index + 1,
        duracion_semanas: Math.max(1, durationWeeks),
      })
      .select('id')
      .single()

    if (phaseError) console.error('[periodization] insert fase error', phaseError)
    if (phaseError || !phase) continue

    const weekRows = Array.from({ length: Math.max(1, durationWeeks) }, (_, weekIndex) => ({
      fase_id: phase.id,
      numero_semana: weekIndex + 1,
    }))
    const { error: weekError } = await supabase.from('semanas_programa').insert(weekRows)
    if (weekError) console.error('[periodization] insert semana error', weekError)
  }
}

export async function getProgramWorkspace(planId: string, category: WorkoutCategory, totalWeeks: number): Promise<ProgramWorkspace> {
  if (await isDemoSession()) return demoWorkspace(category, totalWeeks)

  const supabase = await createSupabaseClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) console.error('[periodization] auth.getUser error', userError)
  if (!user) return demoWorkspace(category, totalWeeks)

  let { data: program, error: selectProgramError } = await supabase
    .from('programas')
    .select('id')
    .eq('plan_id', planId)
    .is('cliente_id', null)
    .maybeSingle()

  if (selectProgramError) console.error('[periodization] select programa error', selectProgramError)

  if (!program) {
    const { data: created, error: insertProgramError } = await supabase
      .from('programas')
      .insert({
        entrenador_id: user.id,
        plan_id: planId,
        nombre: `Periodización · ${category}`,
        duracion_total_semanas: Math.max(1, totalWeeks),
        tipo: 'plantilla',
      })
      .select('id')
      .single()

    if (insertProgramError) console.error('[periodization] insert programa error', insertProgramError)
    if (!created) return demoWorkspace(category, totalWeeks)
    program = created
    await createInitialPhasesForProgram(supabase, program.id, category, totalWeeks)
  }

  const { data: phaseRows } = await supabase
    .from('fases_programa')
    .select('id, nombre, orden, duracion_semanas')
    .eq('programa_id', program.id)
    .order('orden', { ascending: true })

  const phases = phaseRows ?? []
  if (phases.length === 0) {
    await createInitialPhasesForProgram(supabase, program.id, category, totalWeeks)
    return getProgramWorkspace(planId, category, totalWeeks)
  }

  const { data: weekRows } = await supabase
    .from('semanas_programa')
    .select('id, fase_id, numero_semana')
    .in('fase_id', phases.map((phase) => phase.id))
    .order('numero_semana', { ascending: true })

  const weeksByPhase = new Map<string, ProgramWeekView[]>()
  for (const week of weekRows ?? []) {
    const list = weeksByPhase.get(week.fase_id) ?? []
    list.push({ id: week.id, numeroSemana: week.numero_semana })
    weeksByPhase.set(week.fase_id, list)
  }

  const allWeekIds = (weekRows ?? []).map((week) => week.id)
  const workoutsByWeek: Record<string, CalendarWorkoutView[]> = {}
  if (allWeekIds.length > 0) {
    const { data: workoutRows } = await supabase
      .from('entrenamientos_programa')
      .select('id, semana_id, dia_semana, nombre')
      .in('semana_id', allWeekIds)

    for (const workout of workoutRows ?? []) {
      const list = workoutsByWeek[workout.semana_id] ?? []
      list.push({ id: workout.id, nombre: workout.nombre, diaSemana: workout.dia_semana })
      workoutsByWeek[workout.semana_id] = list
    }
  }

  return {
    programId: program.id,
    isReadOnlyDemo: false,
    phases: phases.map((phase) => ({
      id: phase.id,
      name: phase.nombre,
      durationWeeks: phase.duracion_semanas,
      weeks: weeksByPhase.get(phase.id) ?? [],
    })),
    workoutsByWeek,
  }
}

export async function createPhaseAction(planId: string, programId: string) {
  if (await isDemoSession() || programId.startsWith('demo-')) {
    return { error: 'No disponible en la sesión de demostración.' }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: existingPhases } = await supabase
    .from('fases_programa')
    .select('orden')
    .eq('programa_id', programId)
    .order('orden', { ascending: false })
    .limit(1)

  const nextOrder = (existingPhases?.[0]?.orden ?? 0) + 1

  const { data: phase, error } = await supabase
    .from('fases_programa')
    .insert({ programa_id: programId, nombre: `Fase ${nextOrder}`, orden: nextOrder, duracion_semanas: 1 })
    .select('id')
    .single()

  if (error || !phase) return { error: error?.message ?? 'No se pudo crear la fase' }

  await supabase.from('semanas_programa').insert({ fase_id: phase.id, numero_semana: 1 })

  revalidatePath(`/dashboard/workouts/${planId}`)
  return { success: true }
}

export async function updatePhaseAction(
  planId: string,
  phaseId: string,
  patch: { nombre?: string; duracionSemanas?: number }
) {
  if (phaseId.startsWith('demo-')) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createSupabaseClient()

  const updates: { nombre?: string; duracion_semanas?: number } = {}
  if (patch.nombre !== undefined) updates.nombre = patch.nombre
  if (patch.duracionSemanas !== undefined) updates.duracion_semanas = Math.max(1, patch.duracionSemanas)

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('fases_programa').update(updates).eq('id', phaseId)
    if (error) return { error: error.message }
  }

  if (patch.duracionSemanas !== undefined) {
    const { data: weeks } = await supabase
      .from('semanas_programa')
      .select('id, numero_semana')
      .eq('fase_id', phaseId)
      .order('numero_semana', { ascending: true })

    const currentCount = weeks?.length ?? 0
    const targetCount = Math.max(1, patch.duracionSemanas)

    if (targetCount > currentCount) {
      const newWeeks = Array.from({ length: targetCount - currentCount }, (_, index) => ({
        fase_id: phaseId,
        numero_semana: currentCount + index + 1,
      }))
      await supabase.from('semanas_programa').insert(newWeeks)
    } else if (targetCount < currentCount && weeks) {
      const idsToRemove = weeks.filter((week) => week.numero_semana > targetCount).map((week) => week.id)
      if (idsToRemove.length > 0) {
        await supabase.from('semanas_programa').delete().in('id', idsToRemove)
      }
    }
  }

  revalidatePath(`/dashboard/workouts/${planId}`)
  return { success: true }
}

export async function createWorkoutAction(planId: string, semanaId: string, diaSemana: number, nombre: string) {
  if (semanaId.startsWith('demo-')) return { error: 'No disponible en la sesión de demostración.' }
  if (!nombre.trim()) return { error: 'Ponle un nombre al workout' }

  const supabase = await createSupabaseClient()
  const { error } = await supabase.from('entrenamientos_programa').insert({
    semana_id: semanaId,
    dia_semana: diaSemana,
    nombre: nombre.trim(),
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/workouts/${planId}`)
  return { success: true }
}

interface WorkoutDetail {
  nombre: string
  franjaHoraria: string | null
  notas: string | null
  blocks: Array<{
    id: string
    nombre: string
    tipo: string
    exercises: Array<{
      nombre: string
      series: number
      repeticiones: string
      rpeRir: string | null
      descansoSegundos: number | null
      etiquetaSuperserie: string | null
    }>
  }>
}

export async function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
  if (workoutId.startsWith('demo-')) {
    return { nombre: 'Sesión de ejemplo', franjaHoraria: null, notas: 'Vista de demostración, sin datos reales.', blocks: [] }
  }

  const supabase = await createSupabaseClient()
  const { data: workout } = await supabase
    .from('entrenamientos_programa')
    .select('nombre, franja_horaria, notas')
    .eq('id', workoutId)
    .single()

  if (!workout) return null

  const { data: blocks } = await supabase
    .from('bloques_entrenamiento')
    .select('id, nombre, tipo, orden')
    .eq('entrenamiento_id', workoutId)
    .order('orden', { ascending: true })

  const blockList = blocks ?? []
  const blockIds = blockList.map((block) => block.id)

  const exercisesByBlock = new Map<string, WorkoutDetail['blocks'][number]['exercises']>()
  if (blockIds.length > 0) {
    const { data: blockExercises } = await supabase
      .from('bloque_ejercicios')
      .select('bloque_id, series, repeticiones, rpe_rir, descanso_segundos, etiqueta_superserie, orden, ejercicios(nombre)')
      .in('bloque_id', blockIds)
      .order('orden', { ascending: true })

    for (const row of blockExercises ?? []) {
      const list = exercisesByBlock.get(row.bloque_id) ?? []
      const exerciseRelation = row.ejercicios as unknown as { nombre: string } | { nombre: string }[] | null
      const exerciseName = Array.isArray(exerciseRelation) ? exerciseRelation[0]?.nombre : exerciseRelation?.nombre
      list.push({
        nombre: exerciseName ?? 'Ejercicio',
        series: row.series,
        repeticiones: row.repeticiones,
        rpeRir: row.rpe_rir,
        descansoSegundos: row.descanso_segundos,
        etiquetaSuperserie: row.etiqueta_superserie,
      })
      exercisesByBlock.set(row.bloque_id, list)
    }
  }

  return {
    nombre: workout.nombre,
    franjaHoraria: workout.franja_horaria,
    notas: workout.notas,
    blocks: blockList.map((block) => ({
      id: block.id,
      nombre: block.nombre,
      tipo: block.tipo,
      exercises: exercisesByBlock.get(block.id) ?? [],
    })),
  }
}

export async function duplicateWorkoutAsPlanAction(workoutId: string) {
  if (workoutId.startsWith('demo-')) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const detail = await getWorkoutDetail(workoutId)
  if (!detail) return { error: 'No se encontró el workout' }

  const exercises: WorkoutExercise[] = detail.blocks.flatMap((block) =>
    block.exercises.map((exercise) => ({
      name: exercise.nombre,
      sets: exercise.series,
      reps: exercise.repeticiones,
      rest: exercise.descansoSegundos ?? 0,
      rpe: exercise.rpeRir ?? '',
      tempo: '',
      notes: exercise.etiquetaSuperserie ? `Superserie ${exercise.etiquetaSuperserie} · ${block.nombre}` : block.nombre,
    }))
  )

  if (exercises.length === 0) {
    return { error: 'Este workout todavía no tiene ejercicios que duplicar.' }
  }

  const { data: newPlan, error } = await supabase
    .from('planes_entrenamiento')
    .insert({
      entrenador_id: user.id,
      titulo: `${detail.nombre} (plantilla)`,
      categoria: 'Fuerza',
      dias: [{ day: 'Día 1', title: detail.nombre, focus: detail.nombre, duration: 0, exercises }],
    })
    .select('id')
    .single()

  if (error || !newPlan) return { error: error?.message ?? 'No se pudo duplicar' }

  revalidatePath('/dashboard/workouts')
  return { success: true, newPlanId: newPlan.id }
}

export async function updateProgramSettingsAction(
  planId: string,
  programId: string,
  patch: { visibilidad?: 'privado' | 'publico'; modoVisibilidad?: 'siempre' | 'programada'; marcarPlantilla?: boolean }
) {
  if (programId.startsWith('demo-')) return { error: 'No disponible en la sesión de demostración.' }

  const supabase = await createSupabaseClient()
  const updates: { visibilidad?: 'privado' | 'publico'; permisos?: { modo_visibilidad: 'siempre' | 'programada' }; tipo?: 'plantilla'; estado?: 'activo' } = {}

  if (patch.visibilidad) updates.visibilidad = patch.visibilidad
  if (patch.modoVisibilidad) updates.permisos = { modo_visibilidad: patch.modoVisibilidad }
  if (patch.marcarPlantilla) {
    updates.tipo = 'plantilla'
    updates.estado = 'activo'
  }

  if (Object.keys(updates).length === 0) return { success: true }

  const { error } = await supabase.from('programas').update(updates).eq('id', programId)
  if (error) return { error: error.message }

  revalidatePath(`/dashboard/workouts/${planId}`)
  return { success: true }
}

export async function assignProgramToClientsAction(planId: string, programId: string, clientIds: string[]) {
  if (programId.startsWith('demo-')) return { error: 'No disponible en la sesión de demostración.' }
  if (clientIds.length === 0) return { error: 'Selecciona al menos un cliente' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: sourceProgram } = await supabase
    .from('programas')
    .select('nombre, duracion_total_semanas, tipo, visibilidad, permisos')
    .eq('id', programId)
    .single()

  if (!sourceProgram) return { error: 'No se encontró el programa' }

  const { data: phases } = await supabase
    .from('fases_programa')
    .select('id, nombre, orden, duracion_semanas')
    .eq('programa_id', programId)
    .order('orden', { ascending: true })

  const phaseList = phases ?? []
  const { data: weeks } = phaseList.length
    ? await supabase
        .from('semanas_programa')
        .select('id, fase_id, numero_semana')
        .in('fase_id', phaseList.map((phase) => phase.id))
        .order('numero_semana', { ascending: true })
    : { data: [] }

  const weekList = weeks ?? []
  const { data: workouts } = weekList.length
    ? await supabase
        .from('entrenamientos_programa')
        .select('id, semana_id, dia_semana, nombre, franja_horaria, notas')
        .in('semana_id', weekList.map((week) => week.id))
    : { data: [] }

  const workoutList = workouts ?? []
  let assignedCount = 0

  for (const clientId of clientIds) {
    const { data: existing } = await supabase
      .from('programas')
      .select('id')
      .eq('plan_id', planId)
      .eq('cliente_id', clientId)
      .maybeSingle()
    if (existing) continue

    const { data: clonedProgram } = await supabase
      .from('programas')
      .insert({
        entrenador_id: user.id,
        plan_id: planId,
        cliente_id: clientId,
        nombre: sourceProgram.nombre,
        duracion_total_semanas: sourceProgram.duracion_total_semanas,
        tipo: sourceProgram.tipo,
        visibilidad: sourceProgram.visibilidad,
        permisos: sourceProgram.permisos,
        estado: 'activo',
      })
      .select('id')
      .single()

    if (!clonedProgram) continue

    const phaseIdMap = new Map<string, string>()
    for (const phase of phaseList) {
      const { data: clonedPhase } = await supabase
        .from('fases_programa')
        .insert({ programa_id: clonedProgram.id, nombre: phase.nombre, orden: phase.orden, duracion_semanas: phase.duracion_semanas })
        .select('id')
        .single()
      if (clonedPhase) phaseIdMap.set(phase.id, clonedPhase.id)
    }

    const weekIdMap = new Map<string, string>()
    for (const week of weekList) {
      const clonedPhaseId = phaseIdMap.get(week.fase_id)
      if (!clonedPhaseId) continue
      const { data: clonedWeek } = await supabase
        .from('semanas_programa')
        .insert({ fase_id: clonedPhaseId, numero_semana: week.numero_semana })
        .select('id')
        .single()
      if (clonedWeek) weekIdMap.set(week.id, clonedWeek.id)
    }

    for (const workout of workoutList) {
      const clonedWeekId = weekIdMap.get(workout.semana_id)
      if (!clonedWeekId) continue
      await supabase.from('entrenamientos_programa').insert({
        semana_id: clonedWeekId,
        dia_semana: workout.dia_semana,
        nombre: workout.nombre,
        franja_horaria: workout.franja_horaria,
        notas: workout.notas,
      })
    }

    assignedCount += 1
  }

  if (assignedCount > 0) {
    const { data: currentPlan } = await supabase
      .from('planes_entrenamiento')
      .select('clientes_asignados')
      .eq('id', planId)
      .single()

    await supabase
      .from('planes_entrenamiento')
      .update({ clientes_asignados: (currentPlan?.clientes_asignados ?? 0) + assignedCount })
      .eq('id', planId)
  }

  revalidatePath(`/dashboard/workouts/${planId}`)
  return { success: true, assignedCount }
}
