import webpush from 'web-push'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

let vapidConfigured = false
function ensureVapid() {
  if (vapidConfigured) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:noreply@traintools.es',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  vapidConfigured = true
}

interface SendPushInput {
  userId: string
  title: string
  body?: string
  url?: string
  type?: string
}

export async function sendPushNotification({ userId, title, body, url, type = 'general' }: SendPushInput) {
  ensureVapid()
  const supabaseAdmin = getSupabaseAdmin()

  await supabaseAdmin.from('notificaciones').insert({
    usuario_id: userId,
    tipo: type,
    titulo: title,
    cuerpo: body ?? null,
    datos: url ? { url } : {},
  })

  const { data: subscriptions } = await supabaseAdmin
    .from('suscripciones_push')
    .select('*')
    .eq('usuario_id', userId)

  if (!subscriptions?.length) return { sent: 0, failed: 0 }

  let sent = 0
  let failed = 0

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        JSON.stringify({ title, body, data: { url: url ?? '/dashboard' } })
      )

      await supabaseAdmin
        .from('suscripciones_push')
        .update({ usado_en: new Date().toISOString() })
        .eq('id', sub.id)

      sent++
    } catch (err: unknown) {
      // 4xx = suscripción inválida, eliminar (excepto 429 rate limit). Apple a veces no manda statusCode.
      const statusCode = (err as { statusCode?: number }).statusCode
      if ((statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) || !statusCode) {
        await supabaseAdmin.from('suscripciones_push').delete().eq('id', sub.id)
      }
      failed++
    }
  }

  return { sent, failed }
}
