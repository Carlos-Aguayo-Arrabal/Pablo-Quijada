'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { formatRelative } from '@/shared/lib/format'
import type { ClientRecord } from '@/features/clients/data'
import { getDemoClientById, getDemoClients, getDemoClientsSummary } from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'
import type { Cliente } from '@/types/database'

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatDate(date: string | null) {
  if (!date) return 'Sin fecha'
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const nextActionTypeToEs: Record<ClientRecord['nextActionType'], NonNullable<Cliente['tipo_proxima_accion']>> = {
  checkin: 'seguimiento',
  message: 'mensaje',
  payment: 'pago',
  plan: 'plan',
}

const nextActionTypeFromEs = Object.fromEntries(
  Object.entries(nextActionTypeToEs).map(([en, es]) => [es, en])
) as Record<NonNullable<Cliente['tipo_proxima_accion']>, ClientRecord['nextActionType']>

function mapClient(row: Cliente): ClientRecord {
  return {
    id: row.id,
    name: row.nombre,
    initials: initialsFor(row.nombre),
    email: row.email,
    phone: row.telefono ?? '',
    service: row.servicio ?? '',
    goal: row.objetivo ?? '',
    status: row.estado,
    adherence: row.adherencia,
    workouts: '—',
    checkIns: '—',
    nextAction: row.proxima_accion ?? 'Sin acción pendiente',
    nextActionType: row.tipo_proxima_accion ? nextActionTypeFromEs[row.tipo_proxima_accion] : 'message',
    revenue: row.ingresos ?? '—',
    startedAt: formatDate(row.fecha_inicio),
    lastSeen: formatRelative(row.ultima_conexion),
    weight: row.peso ?? '—',
    bodyFat: row.grasa_corporal ?? '—',
    energy: row.energia ?? '—',
    notes: row.notas ?? '',
    risks: row.riesgos ?? [],
    tags: row.etiquetas ?? [],
    group: row.grupo,
    favorite: row.favorito,
  }
}

export async function listClients(): Promise<ClientRecord[]> {
  if (await isDemoSession()) return getDemoClients()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('creado_en', { ascending: false })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoClients()

  return rows.map(mapClient)
}

export async function getClientById(id: string): Promise<ClientRecord | null> {
  if (await isDemoSession()) return getDemoClientById(id)

  const supabase = await createSupabaseClient()
  const { data } = await supabase.from('clientes').select('*').eq('id', id).single()
  return data ? mapClient(data) : getDemoClientById(id)
}

export async function getClientsSummary() {
  if (await isDemoSession()) return getDemoClientsSummary()

  const supabase = await createSupabaseClient()
  const [{ data, error }, { count: pendingCheckins }] = await Promise.all([
    supabase.from('clientes').select('estado, ingresos'),
    supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('estado', 'Pendiente'),
  ])
  const rows = data ?? []
  if (error || rows.length === 0) return getDemoClientsSummary()

  const activeCount = rows.filter((r) => r.estado === 'Activo').length
  const riskCount = rows.filter((r) => r.estado === 'Riesgo').length
  const mrr = rows.reduce((sum, r) => sum + (Number.parseFloat(r.ingresos ?? '0') || 0), 0)

  return {
    total: rows.length,
    activeCount,
    riskCount,
    pendingCheckins: pendingCheckins ?? 0,
    mrr,
  }
}

const createClientSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  service: z.string().min(1, 'Selecciona un servicio'),
  group: z.string().max(60, 'Máximo 60 caracteres').optional(),
})

export async function createClient(input: { name: string; email: string; service: string; group?: string }) {
  const parsed = createClientSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/clients')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('clientes').insert({
    entrenador_id: user.id,
    nombre: parsed.data.name,
    email: parsed.data.email,
    servicio: parsed.data.service,
    estado: 'Pendiente',
    tipo_proxima_accion: nextActionTypeToEs.message,
    proxima_accion: 'Enviar mensaje de bienvenida',
    grupo: parsed.data.group || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  return { success: true }
}

export async function toggleClientFavorite(id: string, favorite: boolean) {
  if (await isDemoSession()) {
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard/favorites')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase.from('clientes').update({ favorito: favorite }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/favorites')
  return { success: true }
}

const updateClientGroupSchema = z.object({
  group: z.string().max(60, 'Máximo 60 caracteres'),
})

export async function updateClientGroup(id: string, input: { group: string }) {
  const parsed = updateClientGroupSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard/groups')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from('clientes')
    .update({ grupo: parsed.data.group || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/clients')
  revalidatePath('/dashboard/groups')
  return { success: true }
}

const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // sin 0/O/1/I/L, para que no se confundan al copiarlo a mano

function generateInviteCode() {
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
  }
  return code
}

export async function getOrCreateInviteCode(): Promise<{ code: string } | { error: string }> {
  if (await isDemoSession()) return { code: 'DEMO2026' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('codigo_invitacion')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.codigo_invitacion) return { code: profile.codigo_invitacion }

  const code = generateInviteCode()
  const { error } = await supabase.from('profiles').update({ codigo_invitacion: code }).eq('id', user.id)
  if (error) return { error: error.message }

  return { code }
}

export async function regenerateInviteCode(): Promise<{ code: string } | { error: string }> {
  if (await isDemoSession()) return { code: 'DEMO2026' }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const code = generateInviteCode()
  const { error } = await supabase.from('profiles').update({ codigo_invitacion: code }).eq('id', user.id)
  if (error) return { error: error.message }

  return { code }
}
