export type AdherenceTone = 'red' | 'yellow' | 'green'

export interface ProgramPhaseView {
  id: string
  name: string
  durationWeeks: number
}

export interface ProgramClientOption {
  id: string
  name: string
}

export interface PrescriptionTemplate {
  id: string
  name: string
  objective: 'Fuerza' | 'Hipertrofia' | 'Descarga' | 'Potencia' | 'Acondicionamiento'
  sets: number
  reps: string
  rpeRir: string
  restSeconds: number
}

export interface BuilderExercise {
  id: string
  name: string
  supersetLabel: string
  sets: number
  reps: string
  rpeRir: string
  restSeconds: number
  linked?: boolean
}

export interface BuilderBlock {
  id: string
  name: string
  type: 'movilidad' | 'fuerza' | 'circuito'
  collapsed: boolean
  exercises: BuilderExercise[]
}

export interface BuilderWorkout {
  id: string
  day: string
  name: string
  timeSlot: string
  clients: number
  adherence: number
  blocks: BuilderBlock[]
}

export interface ExerciseLibraryItem {
  id: string
  name: string
  ownership: 'mine' | 'institutional'
  category: string
  member: string
  laterality: string
  movementPattern: string
  region: string
  posture: string
  instability: string
  contractionType: string
  resistance: string
  equipment: string
  folder: string
}

export const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const prescriptionTemplates: PrescriptionTemplate[] = [
  { id: 'strength-5x5', name: '5x5 Fuerza base', objective: 'Fuerza', sets: 5, reps: '5', rpeRir: 'RPE 8', restSeconds: 180 },
  { id: 'hypertrophy-4x10', name: '4x10 Volumen', objective: 'Hipertrofia', sets: 4, reps: '10', rpeRir: 'RIR 2', restSeconds: 90 },
  { id: 'deload-2x8', name: '2x8 Descarga', objective: 'Descarga', sets: 2, reps: '8', rpeRir: 'RPE 6', restSeconds: 90 },
  { id: 'power-6x3', name: '6x3 Potencia', objective: 'Potencia', sets: 6, reps: '3', rpeRir: 'RPE 7', restSeconds: 150 },
  { id: 'conditioning-3x45', name: '3x45s Densidad', objective: 'Acondicionamiento', sets: 3, reps: '45s', rpeRir: 'RPE 8', restSeconds: 45 },
]

export const initialBuilderWorkouts: BuilderWorkout[] = weekDays.map((day, index) => ({
  id: `workout-${index + 1}`,
  day,
  name: index % 2 === 0 ? 'Full Body' : 'Recovery',
  timeSlot: index % 2 === 0 ? '08:00' : '18:30',
  clients: index % 2 === 0 ? 12 : 6,
  adherence: [92, 64, 78, 48, 85, 55, 0][index],
  blocks: index === 6 ? [] : [
    {
      id: `block-${index + 1}-warmup`,
      name: 'Activación',
      type: 'movilidad',
      collapsed: index > 1,
      exercises: [
        { id: `ex-${index}-1`, name: 'Movilidad cadera', supersetLabel: 'A1', sets: 2, reps: '8/lado', rpeRir: 'RPE 5', restSeconds: 30 },
      ],
    },
    {
      id: `block-${index + 1}-strength`,
      name: 'Fuerza principal',
      type: 'fuerza',
      collapsed: false,
      exercises: [
        { id: `ex-${index}-2`, name: index % 2 === 0 ? 'Sentadilla frontal' : 'Press inclinado', supersetLabel: 'A1', sets: 4, reps: '6', rpeRir: 'RPE 8', restSeconds: 150 },
        { id: `ex-${index}-3`, name: 'Remo con mancuerna', supersetLabel: 'A2', sets: 4, reps: '8', rpeRir: 'RIR 2', restSeconds: 90, linked: index === 2 },
      ],
    },
  ],
}))

export const exerciseLibraryItems: ExerciseLibraryItem[] = [
  { id: 'front-squat', name: 'Sentadilla frontal', ownership: 'mine', category: 'Fuerza', member: 'Inferior', laterality: 'Bilateral', movementPattern: 'Squat', region: 'Rodilla dominante', posture: 'De pie', instability: 'Estable', contractionType: 'Dinámica', resistance: 'Carga externa', equipment: 'Barra', folder: 'Pierna' },
  { id: 'db-row', name: 'Remo con mancuerna', ownership: 'mine', category: 'Fuerza', member: 'Superior', laterality: 'Unilateral', movementPattern: 'Pull', region: 'Espalda', posture: 'Apoyado', instability: 'Estable', contractionType: 'Dinámica', resistance: 'Carga externa', equipment: 'Mancuernas', folder: 'Torso' },
  { id: 'split-squat', name: 'Split squat', ownership: 'institutional', category: 'Hipertrofia', member: 'Inferior', laterality: 'Unilateral', movementPattern: 'Lunge', region: 'Glúteo', posture: 'De pie', instability: 'Media', contractionType: 'Dinámica', resistance: 'Peso corporal', equipment: 'Banco', folder: 'Pierna' },
  { id: 'dead-bug', name: 'Dead bug', ownership: 'institutional', category: 'Core', member: 'Tronco', laterality: 'Alterno', movementPattern: 'Anti-extensión', region: 'Core anterior', posture: 'Supino', instability: 'Baja', contractionType: 'Isométrica', resistance: 'Peso corporal', equipment: 'Suelo', folder: 'Core' },
]

export const exerciseFilterOptions = {
  category: ['Fuerza', 'Hipertrofia', 'Core', 'Movilidad'],
  member: ['Superior', 'Inferior', 'Tronco'],
  laterality: ['Bilateral', 'Unilateral', 'Alterno'],
  movementPattern: ['Squat', 'Hinge', 'Push', 'Pull', 'Lunge', 'Anti-extensión'],
  region: ['Rodilla dominante', 'Cadera dominante', 'Espalda', 'Core anterior', 'Glúteo'],
  posture: ['De pie', 'Supino', 'Prono', 'Apoyado', 'Sentado'],
  instability: ['Baja', 'Media', 'Alta', 'Estable'],
  contractionType: ['Dinámica', 'Isométrica', 'Excéntrica'],
  resistance: ['Peso corporal', 'Carga externa', 'Banda', 'Cable'],
  equipment: ['Barra', 'Mancuernas', 'Banco', 'Suelo', 'Banda'],
}

export function adherenceTone(adherence: number): AdherenceTone {
  if (adherence < 50) return 'red'
  if (adherence <= 80) return 'yellow'
  return 'green'
}
