'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getDemoCheckInStats, getDemoCheckIns, isDemoCheckInId } from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'
import type { CheckInRecord, CheckInRisk, CheckInStatus } from '@/features/checkins/data'

function formatCheckinDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Hoy, ${time}`
  if (isYesterday) return `Ayer, ${time}`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + `, ${time}`
}

type CheckinRow = {
  id: string
  cliente_id: string
  estado: CheckInStatus
  riesgo: CheckInRisk
  peso: string | null
  cambio_peso: string | null
  energia: number | null
  sueno: number | null
  hambre: number | null
  pasos: string | null
  adherencia: number | null
  entrenamientos: string | null
  nutricion: string | null
  comentario: string | null
  alerta: string | null
  respuesta_sugerida: string | null
  creado_en: string
  clientes: { nombre: string } | null
}

function mapCheckin(row: CheckinRow): CheckInRecord {
  return {
    id: row.id,
    client: row.clientes?.nombre ?? 'Cliente',
    clientId: row.cliente_id,
    date: formatCheckinDate(row.creado_en),
    status: row.estado,
    risk: row.riesgo,
    weight: row.peso ?? '—',
    weightChange: row.cambio_peso ?? '—',
    energy: row.energia ?? 0,
    sleep: row.sueno ?? 0,
    hunger: row.hambre ?? 0,
    steps: row.pasos ?? '—',
    adherence: row.adherencia ?? 0,
    workouts: row.entrenamientos ?? '—',
    nutrition: row.nutricion ?? '—',
    comment: row.comentario ?? '',
    alert: row.alerta ?? '',
    suggestedReply: row.respuesta_sugerida ?? '',
  }
}

const idSchema = z.string().uuid('Check-in inválido')
const replySchema = z.string().trim().min(1, 'La respuesta está vacía').max(1000, 'Máximo 1000 caracteres')

export async function listCheckIns(): Promise<CheckInRecord[]> {
  if (await isDemoSession()) return getDemoCheckIns()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('checkins')
    .select('*, clientes(nombre)')
    .order('creado_en', { ascending: false })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoCheckIns()

  return rows.map(mapCheckin as (row: unknown) => CheckInRecord)
}

export async function getCheckInStats() {
  if (await isDemoSession()) return getDemoCheckInStats()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase.from('checkins').select('estado, adherencia')
  const rows = data ?? []
  if (error || rows.length === 0) return getDemoCheckInStats()

  const pending = rows.filter((r) => r.estado === 'Pendiente').length
  const needsReply = rows.filter((r) => r.estado === 'Requiere respuesta').length
  const approved = rows.filter((r) => r.estado === 'Aprobado').length
  const avgAdherence = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + (r.adherencia ?? 0), 0) / rows.length)
    : 0

  return { pending, needsReply, approved, avgAdherence }
}

export async function approveCheckIn(id: string) {
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? 'Check-in inválido' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/checkins')
    return { success: true }
  }

  if (isDemoCheckInId(parsedId.data)) {
    revalidatePath('/dashboard/checkins')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from('checkins')
    .update({ estado: 'Aprobado', aprobado_en: new Date().toISOString() })
    .eq('id', parsedId.data)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/checkins')
  return { success: true }
}

export async function sendCheckInReply(id: string, reply: string) {
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? 'Check-in inválido' }

  const parsedReply = replySchema.safeParse(reply)
  if (!parsedReply.success) return { error: parsedReply.error.issues[0]?.message ?? 'Respuesta inválida' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/checkins')
    return { success: true }
  }

  if (isDemoCheckInId(parsedId.data)) {
    revalidatePath('/dashboard/checkins')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from('checkins')
    .update({
      estado: 'Aprobado',
      respuesta_sugerida: parsedReply.data,
      respondido_en: new Date().toISOString(),
    })
    .eq('id', parsedId.data)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/checkins')
  return { success: true }
}
