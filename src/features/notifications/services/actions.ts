'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/features/notifications/services/send'

export interface NotificationItem {
  id: string
  title: string
  detail: string
  read: boolean
  createdAt: string
}

export async function listNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notificaciones')
    .select('id, titulo, cuerpo, leido, creado_en')
    .order('creado_en', { ascending: false })
    .limit(20)

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.titulo,
    detail: row.cuerpo ?? '',
    read: row.leido,
    createdAt: row.creado_en,
  }))
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase.from('notificaciones').update({ leido: true }).eq('id', id).eq('usuario_id', user.id)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase.from('notificaciones').update({ leido: true }).eq('usuario_id', user.id).eq('leido', false)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function sendTestNotification() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const result = await sendPushNotification({
    userId: user.id,
    title: 'TrainTools',
    body: 'Notificaciones activadas correctamente. Así se verá un aviso nuevo.',
    type: 'test',
  })

  revalidatePath('/dashboard')

  if (result.sent === 0) {
    return { error: 'No se encontró ninguna suscripción activa en este dispositivo.' }
  }

  return { success: true, sent: result.sent }
}
