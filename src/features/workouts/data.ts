export type WorkoutCategory = 'Fuerza' | 'Pérdida de grasa' | 'Hipertrofia' | 'Readaptación' | 'Nutrición'
export type WorkoutLevel = 'Principiante' | 'Intermedio' | 'Avanzado'

export interface WorkoutExercise {
  name: string
  sets: number
  reps: string
  rest: number
  rpe: string
  tempo: string
  notes: string
}

export interface WorkoutDay {
  day: string
  title: string
  focus: string
  duration: number
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  id: string
  title: string
  category: WorkoutCategory
  level: WorkoutLevel
  durationWeeks: number
  sessionsPerWeek: number
  assignedClients: number
  adherence: number
  price: string
  description: string
  tags: string[]
  days: WorkoutDay[]
}

export function estimateExerciseSeconds(exercise: WorkoutExercise) {
  const workSeconds = exercise.reps.includes('s')
    ? Number.parseInt(exercise.reps) || 40
    : Math.max(30, (Number.parseInt(exercise.reps) || 10) * 4)
  return exercise.sets * workSeconds + Math.max(0, exercise.sets - 1) * exercise.rest
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getCategoryTone(category: WorkoutCategory) {
  if (category === 'Fuerza') return 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]'
  if (category === 'Hipertrofia') return 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]'
  if (category === 'Pérdida de grasa') return 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]'
  return 'border-white/15 bg-white/[0.05] text-[#C8D2E3]'
}
