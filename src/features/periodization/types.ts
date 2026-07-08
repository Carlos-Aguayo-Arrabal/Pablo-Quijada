import type {
  BloqueEjercicio,
  BloqueEntrenamiento,
  Ejercicio,
  EntrenamientoPrograma,
  FasePrograma,
  Programa,
  SemanaPrograma,
} from '@/types/database'

export type ProgramStatus = Programa['estado']
export type ProgramType = Programa['tipo']
export type ProgramVisibility = Programa['visibilidad']
export type BlockType = BloqueEntrenamiento['tipo']
export type ExerciseLaterality = Ejercicio['lateralidad']

export interface Program {
  id: string
  coachId: string
  name: string
  totalDurationWeeks: number
  status: ProgramStatus
  type: ProgramType
  visibility: ProgramVisibility
  permissions: Programa['permisos']
  createdAt: string
  updatedAt: string
}

export interface Phase {
  id: string
  programId: string
  name: string
  order: number
  durationWeeks: number
  createdAt: string
  updatedAt: string
}

export interface Week {
  id: string
  phaseId: string
  weekNumber: number
  createdAt: string
  updatedAt: string
}

export interface Workout {
  id: string
  weekId: string
  dayOfWeek: number
  name: string
  timeSlot: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Block {
  id: string
  workoutId: string
  name: string
  type: BlockType
  order: number
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  id: string
  coachId: string
  name: string
  category: string
  movementPattern: string | null
  bodyRegion: string | null
  equipment: string[]
  laterality: ExerciseLaterality
  createdAt: string
  updatedAt: string
}

export interface BlockExercise {
  id: string
  blockId: string
  exerciseId: string
  supersetLabel: string | null
  sets: number
  reps: string
  rpeRir: string | null
  restSeconds: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface PeriodizedProgram extends Program {
  phases: Array<Phase & {
    weeks: Array<Week & {
      workouts: Array<Workout & {
        blocks: Array<Block & {
          exercises: Array<BlockExercise & {
            exercise: Exercise
          }>
        }>
      }>
    }>
  }>
}

export function mapProgram(row: Programa): Program {
  return {
    id: row.id,
    coachId: row.entrenador_id,
    name: row.nombre,
    totalDurationWeeks: row.duracion_total_semanas,
    status: row.estado,
    type: row.tipo,
    visibility: row.visibilidad,
    permissions: row.permisos,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapPhase(row: FasePrograma): Phase {
  return {
    id: row.id,
    programId: row.programa_id,
    name: row.nombre,
    order: row.orden,
    durationWeeks: row.duracion_semanas,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapWeek(row: SemanaPrograma): Week {
  return {
    id: row.id,
    phaseId: row.fase_id,
    weekNumber: row.numero_semana,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapWorkout(row: EntrenamientoPrograma): Workout {
  return {
    id: row.id,
    weekId: row.semana_id,
    dayOfWeek: row.dia_semana,
    name: row.nombre,
    timeSlot: row.franja_horaria,
    notes: row.notas,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapBlock(row: BloqueEntrenamiento): Block {
  return {
    id: row.id,
    workoutId: row.entrenamiento_id,
    name: row.nombre,
    type: row.tipo,
    order: row.orden,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapExercise(row: Ejercicio): Exercise {
  return {
    id: row.id,
    coachId: row.entrenador_id,
    name: row.nombre,
    category: row.categoria,
    movementPattern: row.patron_movimiento,
    bodyRegion: row.region_corporal,
    equipment: row.equipamiento,
    laterality: row.lateralidad,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}

export function mapBlockExercise(row: BloqueEjercicio): BlockExercise {
  return {
    id: row.id,
    blockId: row.bloque_id,
    exerciseId: row.ejercicio_id,
    supersetLabel: row.etiqueta_superserie,
    sets: row.series,
    reps: row.repeticiones,
    rpeRir: row.rpe_rir,
    restSeconds: row.descanso_segundos,
    order: row.orden,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  }
}
