import {
  MessageSquare,
  Moon,
  Scale,
  Zap,
} from 'lucide-react'

export type CheckInStatus = 'Pendiente' | 'Aprobado' | 'Requiere respuesta'
export type CheckInRisk = 'Bajo' | 'Medio' | 'Alto'

export interface CheckInRecord {
  id: string
  client: string
  clientId: string
  date: string
  status: CheckInStatus
  risk: CheckInRisk
  weight: string
  weightChange: string
  energy: number
  sleep: number
  hunger: number
  steps: string
  adherence: number
  workouts: string
  nutrition: string
  comment: string
  alert: string
  suggestedReply: string
}

export const checkInQuestions = [
  { icon: Scale, label: 'Peso de hoy', key: 'weight' },
  { icon: Zap, label: 'Energía', key: 'energy' },
  { icon: Moon, label: 'Sueño', key: 'sleep' },
  { icon: MessageSquare, label: 'Comentario', key: 'comment' },
] as const

export function getStatusTone(status: CheckInStatus) {
  if (status === 'Aprobado') return 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]'
  if (status === 'Requiere respuesta') return 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]'
  return 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]'
}

export function getRiskTone(risk: CheckInRisk) {
  if (risk === 'Alto') return 'text-[#F87171]'
  if (risk === 'Medio') return 'text-[#FFB000]'
  return 'text-[#FF6A00]'
}
