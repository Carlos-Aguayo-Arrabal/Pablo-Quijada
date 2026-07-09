import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))
  // No usar el origin de request.url: detrás del proxy de Easypanel puede
  // resolver a la dirección interna del contenedor (p.ej. 0.0.0.0) en vez del
  // dominio público, rompiendo todos los redirects de este handler.
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traintools.es'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (next.startsWith('/client')) {
        const { error: claimError } = await supabase.rpc('claim_client_invite')
        if (claimError) {
          return NextResponse.redirect(`${origin}/client/signup?error=no_invite`)
        }
        return NextResponse.redirect(`${origin}/client`)
      }

      // Defensa en profundidad: aunque `next` no apunte a /client, si la cuenta
      // ya es de un cliente (p.ej. login con Google reutilizando ese email),
      // nunca debe aterrizar en /dashboard — el middleware lo bloquearía de
      // todas formas, pero evitamos el salto extra.
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: clienteRow } = await supabase
          .from('clientes')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (clienteRow) {
          return NextResponse.redirect(`${origin}/client`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
