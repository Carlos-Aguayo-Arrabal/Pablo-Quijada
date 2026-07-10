'use server'

import { createClient } from '@/lib/supabase/server'
import { isDemoSession } from '@/features/demo/server'
import { ONBOARDING_TASK_META, ONBOARDING_TASK_ORDER } from '@/features/onboarding/data'
import type { OnboardingStatus, OnboardingTaskId } from '@/features/onboarding/data'

export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  if (await isDemoSession()) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: estado } = await supabase
    .from('onboarding_estado')
    .select('descartado')
    .eq('entrenador_id', user.id)
    .maybeSingle()

  if (estado?.descartado) return null

  const [{ count: clientesCount }, { count: planesCount }, { count: franjasCount }, { count: resumenesCount }] = await Promise.all([
    supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('entrenador_id', user.id),
    supabase.from('planes_entrenamiento').select('id', { count: 'exact', head: true }).eq('entrenador_id', user.id),
    supabase.from('franjas_horario').select('id', { count: 'exact', head: true }).eq('entrenador_id', user.id),
    supabase.from('resumenes_ia').select('id', { count: 'exact', head: true }).eq('entrenador_id', user.id),
  ])

  const completion: Record<OnboardingTaskId, boolean> = {
    crearCuenta: true,
    invitarCliente: (clientesCount ?? 0) > 0,
    crearPlan: (planesCount ?? 0) > 0,
    configurarHorario: (franjasCount ?? 0) > 0,
    generarResumenIA: (resumenesCount ?? 0) > 0,
  }

  const tasks = ONBOARDING_TASK_ORDER.map((id) => ({
    id,
    ...ONBOARDING_TASK_META[id],
    completada: completion[id],
  }))

  const completedCount = tasks.filter((t) => t.completada).length
  const totalCount = tasks.length

  // Al llegar a 5/5 se auto-descarta para que deje de aparecer en la próxima
  // carga, sin necesitar un botón adicional de "cerrar para siempre".
  if (completedCount === totalCount) {
    await supabase.from('onboarding_estado').upsert({
      entrenador_id: user.id,
      descartado: true,
      descartado_en: new Date().toISOString(),
    })
  }

  return { tasks, completedCount, totalCount }
}

export async function dismissOnboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('onboarding_estado').upsert({
    entrenador_id: user.id,
    descartado: true,
    descartado_en: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  return { success: true }
}
