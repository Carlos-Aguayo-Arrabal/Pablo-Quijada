'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isDemoCredentials } from '@/features/demo/auth'
import { clearDemoSession, setDemoSession, clearDemoClientSession } from '@/features/demo/server'
import type { FitnessGoal } from '@/types/database'

export async function login(email: string, password: string) {
  if (isDemoCredentials(email, password)) {
    await clearDemoClientSession()
    await setDemoSession()
    return { success: true, redirectTo: '/dashboard' }
  }

  // Un login real siempre debe salir de cualquier modo demo. Si no se limpian
  // estas cookies, una sesión demo previa (entrenador o cliente) sigue activa
  // en paralelo y las server actions que comprueban isDemoSession()/
  // isDemoClientSession() siguen comportándose como demo (no escriben en la
  // BD) aunque el usuario ya esté autenticado de verdad.
  await clearDemoSession()
  await clearDemoClientSession()

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email o contraseña incorrectos' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' }
    }
    return { error: error.message }
  }

  // El rol (entrenador vs cliente) no vive en la sesión: se resuelve comprobando
  // si el usuario tiene una fila en `clientes.user_id`. Un cliente SIEMPRE va a
  // /client, sin importar el `redirectTo` solicitado (el middleware lo forzaría
  // igualmente, pero así evitamos el salto extra).
  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', data.user.id)
    .maybeSingle()

  return { success: true, redirectTo: clienteRow ? '/client' : '/dashboard' }
}

export async function signup(input: {
  name: string
  email: string
  password: string
  goal: FitnessGoal
}) {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traintools.es'

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.name,
        goal: input.goal,
      },
      emailRedirectTo: `${siteUrl}/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Ya existe una cuenta con este email' }
    }
    return { error: error.message }
  }

  return { success: true, needsConfirmation: !data.session }
}

export async function signout() {
  await clearDemoSession()
  await clearDemoClientSession()
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://traintools.es'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
