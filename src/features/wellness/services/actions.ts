'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoClientSession, isDemoSession } from '@/features/demo/server'
import type { WellnessCheck } from '@/features/wellness/data'

const wellnessSchema = z.object({
  sueno: z.number().min(1).max(10),
  estres: z.number().min(1).max(10),
  dolor: z.number().min(1).max(10),
  energia: z.number().min(1).max(10),
  notas: z.string().optional(),
})

export async function submitWellnessCheck(input: {
  sueno: number
  estres: number
  dolor: number
  energia: number
  notas?: string
}) {
  const parsed = wellnessSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoClientSession()) return { success: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id, entrenador_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!clienteRow) return { error: 'No se encontró tu ficha de cliente' }

  const { error } = await supabase.from('cuestionarios_bienestar').insert({
    entrenador_id: clienteRow.entrenador_id,
    cliente_id: clienteRow.id,
    sueno: parsed.data.sueno,
    estres: parsed.data.estres,
    dolor: parsed.data.dolor,
    energia: parsed.data.energia,
    notas: parsed.data.notas || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/client')
  return { success: true }
}

export async function listWellnessHistory(clienteId: string): Promise<WellnessCheck[]> {
  if (await isDemoSession()) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('cuestionarios_bienestar')
    .select('id, sueno, estres, dolor, energia, notas, creado_en')
    .eq('cliente_id', clienteId)
    .order('creado_en', { ascending: false })
    .limit(20)

  return (data ?? []).map((row) => ({
    id: row.id,
    sueno: row.sueno,
    estres: row.estres,
    dolor: row.dolor,
    energia: row.energia,
    notas: row.notas,
    creadoEn: row.creado_en,
  }))
}
