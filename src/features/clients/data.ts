import {
  BadgeEuro,
  CheckCircle2,
  Clock,
  Dumbbell,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'

export type ClientStatus = 'Activo' | 'Riesgo' | 'Pendiente' | 'Pausado'

export interface ClientRecord {
  id: string
  name: string
  initials: string
  email: string
  phone: string
  service: string
  goal: string
  status: ClientStatus
  adherence: number
  workouts: string
  checkIns: string
  nextAction: string
  nextActionType: 'checkin' | 'message' | 'payment' | 'plan'
  revenue: string
  startedAt: string
  lastSeen: string
  weight: string
  bodyFat: string
  energy: string
  notes: string
  risks: string[]
  tags: string[]
}

export const clientTimeline = [
  { icon: CheckCircle2, title: 'Check-in recibido', detail: 'Energía 7/10, peso estable y buena adherencia.', time: 'Hoy, 09:12' },
  { icon: Dumbbell, title: 'Entrenamiento completado', detail: 'Fuerza torso + core con 4 registros de carga.', time: 'Ayer, 18:44' },
  { icon: TrendingUp, title: 'Progreso actualizado', detail: 'Subida de 2.5 kg en sentadilla goblet.', time: 'Lunes, 20:10' },
  { icon: MessageSquare, title: 'Mensaje pendiente', detail: 'Pregunta si puede subir peso en press banca.', time: 'Lunes, 13:25' },
]

export const clientMetrics = [
  { icon: TrendingUp, label: 'Adherencia', key: 'adherence' },
  { icon: Dumbbell, label: 'Entrenos', key: 'workouts' },
  { icon: BadgeEuro, label: 'Pago', key: 'revenue' },
  { icon: Clock, label: 'Último acceso', key: 'lastSeen' },
] as const

export function getAdherenceTone(adherence: number) {
  if (adherence >= 90) return 'text-[#FF6A00]'
  if (adherence >= 75) return 'text-[#FFB000]'
  return 'text-[#F87171]'
}

export function getStatusTone(status: ClientStatus) {
  if (status === 'Activo') return 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]'
  if (status === 'Riesgo') return 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]'
  if (status === 'Pendiente') return 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]'
  return 'border-white/15 bg-white/[0.05] text-[#94A3B8]'
}
