import type { AvailableSlot, ClientPlan, MyMessage, MyProfile, MySession } from '@/features/client/types'

export function getDemoProfile(): MyProfile {
  return { nombre: 'Laura', email: 'laura@cliente.demo', adherencia: 91, pesoActual: '78.4' }
}

export function getDemoPlan(): ClientPlan {
  return {
    programaNombre: 'Fuerza 12 semanas',
    sessionNombre: 'Fuerza torso + core',
    exercises: [
      {
        id: 'sentadilla-goblet',
        name: 'Sentadilla goblet',
        sets: 4,
        repsLabel: '10',
        rpeRir: 'RPE 7',
        restSeconds: 90,
        workSeconds: 40,
      },
      {
        id: 'press-banca',
        name: 'Press banca con mancuernas',
        sets: 4,
        repsLabel: '8',
        rpeRir: 'RPE 8',
        restSeconds: 120,
        workSeconds: 32,
      },
      {
        id: 'remo-polea',
        name: 'Remo en polea',
        sets: 3,
        repsLabel: '12',
        rpeRir: 'RPE 7',
        restSeconds: 75,
        workSeconds: 48,
      },
      {
        id: 'plancha',
        name: 'Plancha frontal',
        sets: 3,
        repsLabel: '40s',
        rpeRir: null,
        restSeconds: 60,
        workSeconds: 40,
      },
    ],
  }
}

export function getDemoMessages(): MyMessage[] {
  return [
    {
      id: 'demo-1',
      remitente: 'entrenador',
      contenido: 'Perfecto, hoy toca fuerza. Si notas molestia en hombro, baja carga en press.',
      creadoEn: new Date().toISOString(),
    },
  ]
}

export const DEMO_HABITS = [
  { id: 'protein', label: 'Llegar a 150 g de proteína', detail: 'Objetivo nutricional diario' },
  { id: 'steps', label: '8.000 pasos', detail: 'Actividad fuera del entrenamiento' },
  { id: 'water', label: '2,5 L de agua', detail: 'Hidratación' },
] as const

export function getDemoAvailableSlots(): AvailableSlot[] {
  const now = new Date()
  const slots: AvailableSlot[] = []

  for (const [dayOffset, hour] of [[1, 9], [1, 10], [2, 16], [3, 9], [4, 17]] as const) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    date.setHours(hour, 0, 0, 0)
    slots.push({ fechaHora: date.toISOString(), duracionMinutos: 60 })
  }

  return slots
}

export function getDemoMySessions(): MySession[] {
  const now = new Date()
  const next = new Date(now)
  next.setDate(next.getDate() + 5)
  next.setHours(10, 0, 0, 0)

  return [
    {
      id: 'demo-session-1',
      titulo: 'Fuerza torso + core',
      fechaHora: next.toISOString(),
      duracionMinutos: 60,
      modalidad: 'presencial',
      estado: 'programada',
    },
  ]
}
