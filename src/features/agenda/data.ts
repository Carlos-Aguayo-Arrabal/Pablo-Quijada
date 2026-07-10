import type { SesionEstado, SesionModalidad, SesionOrigen } from '@/types/database'

export type SessionRecord = {
  id: string
  clienteId: string
  clienteNombre: string
  tipoSesionId: string | null
  tipoSesionNombre: string | null
  tipoSesionColor: string
  titulo: string
  modalidad: SesionModalidad
  fechaHora: string
  duracionMinutos: number
  estado: SesionEstado
  origen: SesionOrigen
  notas: string | null
}

export type SessionType = {
  id: string
  nombre: string
  color: string
}

export type AvailabilitySlot = {
  id: string
  diaSemana: number
  horaInicio: string
  horaFin: string
  duracionSesionMinutos: number
  activo: boolean
}

export type SessionsStats = {
  total: number
  presenciales: number
  online: number
  asistenciaPct: number
  reservas: number
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

// getDay() de JS: 0=domingo...6=sábado. Nuestro dia_semana: 0=lunes...6=domingo.
export function jsDayToDiaSemana(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1
}

export function diaSemanaToJsDay(diaSemana: number) {
  return diaSemana === 6 ? 0 : diaSemana + 1
}

export const ESTADO_LABEL: Record<SesionEstado, string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
}

export const ESTADO_TONE: Record<SesionEstado, string> = {
  programada: 'text-[#FFB000]',
  completada: 'text-[#4ADE80]',
  cancelada: 'text-[#475569]',
  no_asistio: 'text-[#F87171]',
}

export const MODALIDAD_LABEL: Record<SesionModalidad, string> = {
  presencial: 'Presencial',
  online: 'Online',
}
