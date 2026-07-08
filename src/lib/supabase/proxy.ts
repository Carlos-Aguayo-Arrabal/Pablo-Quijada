import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE } from '@/features/demo/auth'

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

  const { pathname } = request.nextUrl

  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/client')

  const isAuthEntryRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth/login')

  if (isProtectedRoute && !user && !hasDemoSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthEntryRoute && (user || hasDemoSession)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
