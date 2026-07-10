'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoSession } from '@/features/demo/server'
import {
  getDemoAvailabilitySlots,
  getDemoSessions,
  getDemoSessionsStats,
  getDemoSessionTypes,
} from '@/features/demo/data'
import type { AvailabilitySlot, SessionRecord, SessionsStats, SessionType } from '@/features/agenda/data'
import type { Sesion } from '@/types/database'

// ---------- Tipos de sesión ----------

const sessionTypeSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  color: z.string().min(4).max(9).optional(),
})

export async function listSessionTypes(): Promise<SessionType[]> {
  if (await isDemoSession()) return getDemoSessionTypes()

  const supabase = await createClient()
  const { data } = await supabase
    .from('tipos_sesion')
    .select('id, nombre, color')
    .order('nombre', { ascending: true })

  return data ?? []
}

export async function createSessionType(input: { nombre: string; color?: string }) {
  const parsed = sessionTypeSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('tipos_sesion').insert({
    entrenador_id: user.id,
    nombre: parsed.data.nombre,
    ...(parsed.data.color ? { color: parsed.data.color } : {}),
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function updateSessionType(id: string, input: { nombre?: string; color?: string }) {
  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('tipos_sesion').update(input).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function deleteSessionType(id: string) {
  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('tipos_sesion').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

// ---------- Horario de citas ----------

const availabilitySchema = z.object({
  id: z.string().uuid().optional(),
  diaSemana: z.number().min(0).max(6),
  horaInicio: z.string().min(4),
  horaFin: z.string().min(4),
  duracionSesionMinutos: z.number().min(5).default(60),
  activo: z.boolean().default(true),
})

export async function listAvailability(): Promise<AvailabilitySlot[]> {
  if (await isDemoSession()) return getDemoAvailabilitySlots()

  const supabase = await createClient()
  const { data } = await supabase
    .from('franjas_horario')
    .select('id, dia_semana, hora_inicio, hora_fin, duracion_sesion_minutos, activo')
    .order('dia_semana', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id,
    diaSemana: row.dia_semana,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    duracionSesionMinutos: row.duracion_sesion_minutos,
    activo: row.activo,
  }))
}

export async function upsertAvailabilitySlot(input: {
  id?: string
  diaSemana: number
  horaInicio: string
  horaFin: string
  duracionSesionMinutos?: number
  activo?: boolean
}) {
  const parsed = availabilitySchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const row = {
    entrenador_id: user.id,
    dia_semana: parsed.data.diaSemana,
    hora_inicio: parsed.data.horaInicio,
    hora_fin: parsed.data.horaFin,
    duracion_sesion_minutos: parsed.data.duracionSesionMinutos,
    activo: parsed.data.activo,
  }

  const { error } = parsed.data.id
    ? await supabase.from('franjas_horario').update(row).eq('id', parsed.data.id)
    : await supabase.from('franjas_horario').insert(row)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function deleteAvailabilitySlot(id: string) {
  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('franjas_horario').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

// ---------- Sesiones ----------

async function mapSessions(rows: Sesion[]): Promise<SessionRecord[]> {
  if (rows.length === 0) return []

  const supabase = await createClient()
  const clienteIds = [...new Set(rows.map((r) => r.cliente_id))]
  const tipoIds = [...new Set(rows.map((r) => r.tipo_sesion_id).filter((id): id is string => Boolean(id)))]

  const [{ data: clientes }, { data: tipos }] = await Promise.all([
    supabase.from('clientes').select('id, nombre').in('id', clienteIds),
    tipoIds.length
      ? supabase.from('tipos_sesion').select('id, nombre, color').in('id', tipoIds)
      : Promise.resolve({ data: [] as { id: string; nombre: string; color: string }[] }),
  ])

  const clienteNombreById = new Map((clientes ?? []).map((c) => [c.id, c.nombre]))
  const tipoById = new Map((tipos ?? []).map((t) => [t.id, t]))

  return rows.map((row) => {
    const tipo = row.tipo_sesion_id ? tipoById.get(row.tipo_sesion_id) : undefined
    return {
      id: row.id,
      clienteId: row.cliente_id,
      clienteNombre: clienteNombreById.get(row.cliente_id) ?? 'Cliente',
      tipoSesionId: row.tipo_sesion_id,
      tipoSesionNombre: tipo?.nombre ?? null,
      tipoSesionColor: tipo?.color ?? '#475569',
      titulo: row.titulo,
      modalidad: row.modalidad,
      fechaHora: row.fecha_hora,
      duracionMinutos: row.duracion_minutos,
      estado: row.estado,
      origen: row.origen,
      notas: row.notas,
    }
  })
}

export async function listSessions(range?: { from: string; to: string }): Promise<SessionRecord[]> {
  if (await isDemoSession()) return getDemoSessions()

  const supabase = await createClient()
  let query = supabase.from('sesiones').select('*').order('fecha_hora', { ascending: true })

  if (range) {
    query = query.gte('fecha_hora', range.from).lte('fecha_hora', range.to)
  }

  const { data } = await query
  return mapSessions(data ?? [])
}

export async function getSessionsStats(): Promise<SessionsStats> {
  if (await isDemoSession()) return getDemoSessionsStats()

  const supabase = await createClient()
  const { data } = await supabase
    .from('sesiones')
    .select('modalidad, estado, origen')

  const rows = (data ?? []).filter((r) => r.estado !== 'cancelada')
  const finished = rows.filter((r) => r.estado === 'completada' || r.estado === 'no_asistio')
  const attended = rows.filter((r) => r.estado === 'completada')

  return {
    total: rows.length,
    presenciales: rows.filter((r) => r.modalidad === 'presencial').length,
    online: rows.filter((r) => r.modalidad === 'online').length,
    asistenciaPct: finished.length ? Math.round((attended.length / finished.length) * 100) : 0,
    reservas: rows.filter((r) => r.origen === 'cliente').length,
  }
}

const createSessionSchema = z.object({
  clienteId: z.string().uuid(),
  tipoSesionId: z.string().uuid().optional(),
  titulo: z.string().min(2, 'Mínimo 2 caracteres'),
  modalidad: z.enum(['presencial', 'online']),
  fechaHora: z.string().min(10),
  duracionMinutos: z.number().min(5).default(60),
  notas: z.string().optional(),
})

export async function createSession(input: {
  clienteId: string
  tipoSesionId?: string
  titulo: string
  modalidad: 'presencial' | 'online'
  fechaHora: string
  duracionMinutos?: number
  notas?: string
}) {
  const parsed = createSessionSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('sesiones').insert({
    entrenador_id: user.id,
    cliente_id: parsed.data.clienteId,
    tipo_sesion_id: parsed.data.tipoSesionId ?? null,
    titulo: parsed.data.titulo,
    modalidad: parsed.data.modalidad,
    fecha_hora: parsed.data.fechaHora,
    duracion_minutos: parsed.data.duracionMinutos,
    origen: 'entrenador',
    notas: parsed.data.notas || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function updateSessionStatus(id: string, estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio') {
  if (await isDemoSession()) {
    revalidatePath('/dashboard/history')
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('sesiones').update({ estado }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function cancelSession(id: string) {
  return updateSessionStatus(id, 'cancelada')
}
