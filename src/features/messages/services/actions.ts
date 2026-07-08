'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getDemoMessages, getDemoMessageThreads, isDemoClientId } from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'
import type { MessageItem, MessageThread } from '@/features/messages/types'

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  return 'Ayer'
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

type MensajeRow = {
  id: string
  cliente_id: string
  remitente: 'entrenador' | 'cliente'
  contenido: string
  leido_en: string | null
  creado_en: string
  clientes: { nombre: string } | null
}

const clientIdSchema = z.string().uuid('Cliente inválido')
const messageBodySchema = z.string().trim().min(1, 'El mensaje está vacío').max(2000, 'Máximo 2000 caracteres')

export async function listThreads(): Promise<MessageThread[]> {
  if (await isDemoSession()) return getDemoMessageThreads()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('mensajes')
    .select('*, clientes(nombre)')
    .order('creado_en', { ascending: false })

  const rows = (data ?? []) as MensajeRow[]
  if (error || rows.length === 0) return getDemoMessageThreads()

  const byClient = new Map<string, MessageThread>()

  for (const row of rows) {
    if (byClient.has(row.cliente_id)) continue
    byClient.set(row.cliente_id, {
      clientId: row.cliente_id,
      clientName: row.clientes?.nombre ?? 'Cliente',
      preview: row.contenido,
      time: formatRelative(row.creado_en),
      unread: row.remitente === 'cliente' && !row.leido_en,
    })
  }

  return Array.from(byClient.values())
}

export async function listMessages(clientId: string): Promise<MessageItem[]> {
  const parsedClientId = clientIdSchema.safeParse(clientId)
  if (!parsedClientId.success) return []

  if (await isDemoSession()) return getDemoMessages(parsedClientId.data)

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('cliente_id', parsedClientId.data)
    .order('creado_en', { ascending: true })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoMessages(parsedClientId.data)

  return rows.map((row) => ({
    id: row.id,
    sender: row.remitente === 'entrenador' ? 'coach' : 'client',
    body: row.contenido,
    time: formatTime(row.creado_en),
  }))
}

export async function sendMessage(clientId: string, body: string) {
  const parsedClientId = clientIdSchema.safeParse(clientId)
  if (!parsedClientId.success) return { error: parsedClientId.error.issues[0]?.message ?? 'Cliente inválido' }

  const parsedBody = messageBodySchema.safeParse(body)
  if (!parsedBody.success) return { error: parsedBody.error.issues[0]?.message ?? 'Mensaje inválido' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/messages')
    return { success: true }
  }

  if (isDemoClientId(parsedClientId.data)) {
    revalidatePath('/dashboard/messages')
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('mensajes').insert({
    entrenador_id: user.id,
    cliente_id: parsedClientId.data,
    remitente: 'entrenador',
    contenido: parsedBody.data,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/messages')
  return { success: true }
}
