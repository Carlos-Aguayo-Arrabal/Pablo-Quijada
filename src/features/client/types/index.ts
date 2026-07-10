export type ClientPlanExercise = {
  id: string
  name: string
  sets: number
  repsLabel: string
  rpeRir: string | null
  restSeconds: number
  workSeconds: number
}

export type ClientPlan = {
  programaNombre: string
  sessionNombre: string
  exercises: ClientPlanExercise[]
} | null

export type MyProfile = {
  nombre: string
  email: string
  adherencia: number
  pesoActual: string | null
}

export type MyMessage = {
  id: string
  remitente: 'entrenador' | 'cliente'
  contenido: string
  creadoEn: string
}

export type AvailableSlot = {
  fechaHora: string
  duracionMinutos: number
}

export type MySession = {
  id: string
  titulo: string
  fechaHora: string
  duracionMinutos: number
  modalidad: 'presencial' | 'online'
  estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio'
}
