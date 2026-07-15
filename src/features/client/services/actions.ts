'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoClientSession, setDemoClientSession } from '@/features/demo/server'
import {
  getDemoAvailableSlots,
  getDemoMessages,
  getDemoMySessions,
  getDemoPlan,
  getDemoProfile,
} from '@/features/client/demo-data'
import { jsDayToDiaSemana } from '@/features/agenda/data'
import type { AvailableSlot, ClientPlan, ClientPlanExercise, MyMessage, MyProfile, MySession } from '@/features/client/types'

const signupClientSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Al menos una mayúscula')
    .regex(/[0-9]/, 'Al menos un número'),
  code: z.string().optional(),
})

export async function signupClient(input: { name?: string; email: string; password: string; code?: string }) {
  const parsed = signupClientSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traintools.es'

  const inviteCodeParam = parsed.data.code ? `&invite_code=${encodeURIComponent(parsed.data.code)}` : ''

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: parsed.data.name ? { full_name: parsed.data.name } : undefined,
      emailRedirectTo: `${siteUrl}/callback?next=${encodeURIComponent('/client')}${inviteCodeParam}`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Ya existe una cuenta con este email' }
    }
    return { error: error.message }
  }

  return { success: true, needsConfirmation: !data.session }
}

export async function startClientDemo() {
  await setDemoClientSession()
  return { success: true }
}

export async function retryClaimClientInvite() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No has iniciado sesión' }

  const { error } = await supabase.rpc('claim_client_invite')
  if (error) return { error: 'No encontramos una invitación pendiente para tu email' }

  return { success: true }
}

function parseWorkSeconds(repeticiones: string) {
  const match = repeticiones.match(/\d+/)
  const reps = match ? Number(match[0]) : 10
  return reps * 4
}

export async function getMyProfile(): Promise<MyProfile> {
  if (await isDemoClientSession()) return getDemoProfile()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { nombre: 'Cliente', email: '', adherencia: 0, pesoActual: null }

  void supabase.rpc('touch_client_last_seen')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('nombre, email, adherencia, peso')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!clienteRow) {
    return { nombre: user.email?.split('@')[0] ?? 'Cliente', email: user.email ?? '', adherencia: 0, pesoActual: null }
  }

  return {
    nombre: clienteRow.nombre,
    email: clienteRow.email,
    adherencia: clienteRow.adherencia,
    pesoActual: clienteRow.peso,
  }
}

export async function getMyPlan(): Promise<ClientPlan> {
  if (await isDemoClientSession()) return getDemoPlan()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: programa } = await supabase
    .from('programas')
    .select('id, nombre')
    .eq('estado', 'activo')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!programa) return null

  const { data: fase } = await supabase
    .from('fases_programa')
    .select('id')
    .eq('programa_id', programa.id)
    .order('orden', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!fase) return { programaNombre: programa.nombre, sessionNombre: 'Sin sesiones asignadas', exercises: [] }

  const { data: semana } = await supabase
    .from('semanas_programa')
    .select('id')
    .eq('fase_id', fase.id)
    .order('numero_semana', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!semana) return { programaNombre: programa.nombre, sessionNombre: 'Sin sesiones asignadas', exercises: [] }

  const { data: entrenamiento } = await supabase
    .from('entrenamientos_programa')
    .select('id, nombre')
    .eq('semana_id', semana.id)
    .order('dia_semana', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!entrenamiento) return { programaNombre: programa.nombre, sessionNombre: 'Sin sesiones asignadas', exercises: [] }

  const { data: bloques } = await supabase
    .from('bloques_entrenamiento')
    .select('id')
    .eq('entrenamiento_id', entrenamiento.id)
    .order('orden', { ascending: true })

  const bloqueIds = (bloques ?? []).map((b) => b.id)
  if (bloqueIds.length === 0) {
    return { programaNombre: programa.nombre, sessionNombre: entrenamiento.nombre, exercises: [] }
  }

  const { data: bloqueEjercicios } = await supabase
    .from('bloque_ejercicios')
    .select('id, ejercicio_id, series, repeticiones, rpe_rir, descanso_segundos, orden')
    .in('bloque_id', bloqueIds)
    .order('orden', { ascending: true })

  const ejercicioIds = [...new Set((bloqueEjercicios ?? []).map((be) => be.ejercicio_id))]
  const { data: ejercicios } = ejercicioIds.length
    ? await supabase.from('ejercicios').select('id, nombre').in('id', ejercicioIds)
    : { data: [] as { id: string; nombre: string }[] }

  const ejercicioNameById = new Map((ejercicios ?? []).map((e) => [e.id, e.nombre]))

  const exercises: ClientPlanExercise[] = (bloqueEjercicios ?? []).map((be) => ({
    id: be.id,
    name: ejercicioNameById.get(be.ejercicio_id) ?? 'Ejercicio',
    sets: be.series,
    repsLabel: be.repeticiones,
    rpeRir: be.rpe_rir,
    restSeconds: be.descanso_segundos ?? 60,
    workSeconds: parseWorkSeconds(be.repeticiones),
  }))

  return { programaNombre: programa.nombre, sessionNombre: entrenamiento.nombre, exercises }
}

const checkinSchema = z.object({
  peso: z.string().optional(),
  energia: z.number().min(1).max(10),
  comentario: z.string().optional(),
})

export async function submitMyCheckin(input: { peso?: string; energia: number; comentario?: string }) {
  const parsed = checkinSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoClientSession()) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id, entrenador_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clienteRow) return { error: 'No se encontró tu ficha de cliente' }

  const { error } = await supabase.from('checkins').insert({
    entrenador_id: clienteRow.entrenador_id,
    cliente_id: clienteRow.id,
    peso: parsed.data.peso || null,
    energia: parsed.data.energia,
    comentario: parsed.data.comentario || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/client')
  return { success: true }
}

export async function listMyMessages(): Promise<MyMessage[]> {
  if (await isDemoClientSession()) return getDemoMessages()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: clienteRow } = await supabase.from('clientes').select('id').eq('user_id', user.id).maybeSingle()
  if (!clienteRow) return []

  const { data } = await supabase
    .from('mensajes')
    .select('id, remitente, contenido, creado_en')
    .eq('cliente_id', clienteRow.id)
    .order('creado_en', { ascending: true })

  return (data ?? []).map((m) => ({
    id: m.id,
    remitente: m.remitente,
    contenido: m.contenido,
    creadoEn: m.creado_en,
  }))
}

export async function sendMyMessage(contenido: string) {
  const trimmed = contenido.trim()
  if (!trimmed) return { error: 'Escribe un mensaje' }

  if (await isDemoClientSession()) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id, entrenador_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clienteRow) return { error: 'No se encontró tu ficha de cliente' }

  const { error } = await supabase.from('mensajes').insert({
    entrenador_id: clienteRow.entrenador_id,
    cliente_id: clienteRow.id,
    remitente: 'cliente',
    contenido: trimmed,
  })

  if (error) return { error: error.message }

  revalidatePath('/client')
  return { success: true }
}

// ---------- Reserva de citas ----------

export async function listAvailableSlots(): Promise<AvailableSlot[]> {
  if (await isDemoClientSession()) return getDemoAvailableSlots()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id, entrenador_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clienteRow) return []

  const { data: franjas } = await supabase
    .from('franjas_horario')
    .select('dia_semana, hora_inicio, hora_fin, duracion_sesion_minutos')
    .eq('entrenador_id', clienteRow.entrenador_id)
    .eq('activo', true)
  if (!franjas || franjas.length === 0) return []

  const now = new Date()
  const horizonEnd = new Date(now)
  horizonEnd.setDate(horizonEnd.getDate() + 21)

  const { data: existingSessions } = await supabase
    .from('sesiones')
    .select('fecha_hora')
    .eq('entrenador_id', clienteRow.entrenador_id)
    .eq('estado', 'programada')
    .gte('fecha_hora', now.toISOString())
    .lte('fecha_hora', horizonEnd.toISOString())

  // Comparar por timestamp, no por string: Postgres y JS no siempre serializan
  // el mismo instante con el mismo formato ISO (offset vs. "Z", milisegundos...).
  const occupied = new Set((existingSessions ?? []).map((s) => new Date(s.fecha_hora).getTime()))

  const slots: AvailableSlot[] = []

  for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const diaSemana = jsDayToDiaSemana(date.getDay())
    const dayFranjas = franjas.filter((f) => f.dia_semana === diaSemana)

    for (const franja of dayFranjas) {
      const [startH, startM] = franja.hora_inicio.split(':').map(Number)
      const [endH, endM] = franja.hora_fin.split(':').map(Number)
      const duracion = franja.duracion_sesion_minutos

      const cursor = new Date(date)
      cursor.setHours(startH, startM, 0, 0)
      const franjaEnd = new Date(date)
      franjaEnd.setHours(endH, endM, 0, 0)

      while (cursor.getTime() + duracion * 60_000 <= franjaEnd.getTime()) {
        if (cursor.getTime() > now.getTime() && !occupied.has(cursor.getTime())) {
          slots.push({ fechaHora: cursor.toISOString(), duracionMinutos: duracion })
        }
        cursor.setMinutes(cursor.getMinutes() + duracion)
      }
    }
  }

  return slots.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
}

const bookSessionSchema = z.object({
  fechaHora: z.string().min(10),
  duracionMinutos: z.number().min(5),
  modalidad: z.enum(['presencial', 'online']),
})

export async function bookSession(input: { fechaHora: string; duracionMinutos: number; modalidad: 'presencial' | 'online' }) {
  const parsed = bookSessionSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  if (await isDemoClientSession()) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id, entrenador_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clienteRow) return { error: 'No se encontró tu ficha de cliente' }

  // check-then-act: evita reservar un hueco que se acaba de ocupar
  const { data: clash } = await supabase
    .from('sesiones')
    .select('id')
    .eq('entrenador_id', clienteRow.entrenador_id)
    .eq('fecha_hora', parsed.data.fechaHora)
    .eq('estado', 'programada')
    .maybeSingle()
  if (clash) return { error: 'Ese hueco ya no está disponible, elige otro' }

  const { error: insertError } = await supabase.from('sesiones').insert({
    entrenador_id: clienteRow.entrenador_id,
    cliente_id: clienteRow.id,
    titulo: 'Cita reservada',
    modalidad: parsed.data.modalidad,
    fecha_hora: parsed.data.fechaHora,
    duracion_minutos: parsed.data.duracionMinutos,
    origen: 'cliente',
  })

  if (insertError) return { error: insertError.message }

  revalidatePath('/client')
  return { success: true }
}

export async function listMySessions(): Promise<MySession[]> {
  if (await isDemoClientSession()) return getDemoMySessions()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: clienteRow } = await supabase.from('clientes').select('id').eq('user_id', user.id).maybeSingle()
  if (!clienteRow) return []

  const { data } = await supabase
    .from('sesiones')
    .select('id, titulo, fecha_hora, duracion_minutos, modalidad, estado')
    .eq('cliente_id', clienteRow.id)
    .neq('estado', 'cancelada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id,
    titulo: row.titulo,
    fechaHora: row.fecha_hora,
    duracionMinutos: row.duracion_minutos,
    modalidad: row.modalidad,
    estado: row.estado,
  }))
}

export async function cancelMySession(id: string) {
  if (await isDemoClientSession()) return { success: true }

  const supabase = await createClient()
  const { error } = await supabase.from('sesiones').update({ estado: 'cancelada' }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/client')
  return { success: true }
}
