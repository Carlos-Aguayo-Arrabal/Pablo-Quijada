import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
  deviceInfo: z
    .object({
      platform: z.string().optional(),
      language: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
  oldEndpoint: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const parsed = subscribeSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 })
  }

  const { subscription, deviceInfo, oldEndpoint } = parsed.data

  if (oldEndpoint) {
    await supabase.from('suscripciones_push').delete().eq('endpoint', oldEndpoint)
  }

  const { error } = await supabase.from('suscripciones_push').upsert(
    {
      usuario_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      navegador: deviceInfo?.platform ?? null,
      user_agent: deviceInfo?.userAgent ?? null,
      usado_en: new Date().toISOString(),
    },
    { onConflict: 'usuario_id,endpoint' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const parsed = z.object({ endpoint: z.string().url() }).safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Endpoint inválido' }, { status: 400 })

  await supabase
    .from('suscripciones_push')
    .delete()
    .eq('endpoint', parsed.data.endpoint)
    .eq('usuario_id', user.id)

  return NextResponse.json({ success: true })
}
