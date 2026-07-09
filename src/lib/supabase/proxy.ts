import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_VALUE,
  DEMO_CLIENT_SESSION_COOKIE,
  DEMO_CLIENT_SESSION_VALUE,
} from '@/features/demo/auth'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const hasDemoSession = request.cookies.get(DEMO_SESSION_COOKIE)?.value === DEMO_SESSION_VALUE
  const hasClientDemoSession =
    request.cookies.get(DEMO_CLIENT_SESSION_COOKIE)?.value === DEMO_CLIENT_SESSION_VALUE

  const { pathname } = request.nextUrl

  // /client es público: sin sesión muestra un landing con login/"ver demo" (la
  // propia página decide real vs demo vs landing). /dashboard sigue totalmente
  // protegido — solo se resuelve el rol para redirigir cuando SÍ hay sesión.
  const isClientRoute = pathname.startsWith('/client') && pathname !== '/client/signup'
  const isCoachRoute = pathname.startsWith('/dashboard')

  const isAuthEntryRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth/login')

  if (isCoachRoute && !user && !hasDemoSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // La demo del entrenador es un rol distinto: no debe "colarse" en el portal
  // cliente (evita confundir demos). Se resuelve por cookie, sin tocar la DB.
  if (!user && isClientRoute && hasDemoSession && !hasClientDemoSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // El rol real (entrenador vs cliente) no está en la sesión/JWT: se resuelve
  // comprobando si el usuario tiene una fila en `clientes.user_id`. Solo se
  // consulta cuando hace falta (rutas de rol o entrada de auth), no en cada
  // request, para no penalizar el resto de la app con una query extra.
  let isClient = false
  if (user && (isCoachRoute || isClientRoute || isAuthEntryRoute)) {
    const { data: clienteRow } = await supabase
      .from('clientes')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
    isClient = Boolean(clienteRow)
  }

  if (user) {
    // Un entrenador real no ve el portal cliente (ni siquiera en su landing/demo).
    if (isClientRoute && !isClient) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (isCoachRoute && isClient) {
      return NextResponse.redirect(new URL('/client', request.url))
    }
  }

  if (isAuthEntryRoute) {
    if (hasDemoSession || (user && !isClient)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (hasClientDemoSession || (user && isClient)) {
      return NextResponse.redirect(new URL('/client', request.url))
    }
  }

  return supabaseResponse
}
