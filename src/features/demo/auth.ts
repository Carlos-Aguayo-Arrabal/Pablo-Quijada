export const DEMO_CREDENTIALS = {
  email: 'demo@traintools.es',
  password: 'Demo2026!',
} as const

export const DEMO_USER = {
  name: 'Coach Demo',
  email: DEMO_CREDENTIALS.email,
} as const

export const DEMO_SESSION_COOKIE = 'vq_demo_session'
export const DEMO_SESSION_VALUE = 'admin'

export function isDemoCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  )
}
