import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendPushNotification } from '@/features/notifications/services/send'

const sendSchema = z.object({
  userId: z.string().uuid(),
  notification: z.object({
    title: z.string().min(1),
    body: z.string().optional(),
    url: z.string().optional(),
  }),
  type: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Solo código propio del servidor puede disparar envíos (nunca el navegador)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = sendSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { userId, notification, type } = parsed.data
  const result = await sendPushNotification({
    userId,
    title: notification.title,
    body: notification.body,
    url: notification.url,
    type,
  })

  return NextResponse.json({ success: true, ...result })
}
