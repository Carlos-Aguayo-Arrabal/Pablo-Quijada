import { cookies } from 'next/headers'
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_VALUE,
  DEMO_CLIENT_SESSION_COOKIE,
  DEMO_CLIENT_SESSION_VALUE,
} from '@/features/demo/auth'

export async function isDemoSession() {
  const cookieStore = await cookies()
  return cookieStore.get(DEMO_SESSION_COOKIE)?.value === DEMO_SESSION_VALUE
}

export async function setDemoSession() {
  const cookieStore = await cookies()
  cookieStore.set(DEMO_SESSION_COOKIE, DEMO_SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearDemoSession() {
  const cookieStore = await cookies()
  cookieStore.delete(DEMO_SESSION_COOKIE)
}

export async function isDemoClientSession() {
  const cookieStore = await cookies()
  return cookieStore.get(DEMO_CLIENT_SESSION_COOKIE)?.value === DEMO_CLIENT_SESSION_VALUE
}

export async function setDemoClientSession() {
  const cookieStore = await cookies()
  cookieStore.set(DEMO_CLIENT_SESSION_COOKIE, DEMO_CLIENT_SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearDemoClientSession() {
  const cookieStore = await cookies()
  cookieStore.delete(DEMO_CLIENT_SESSION_COOKIE)
}
