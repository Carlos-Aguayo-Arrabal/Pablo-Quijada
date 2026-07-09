'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoSession } from '@/features/demo/server'
import type { PerformanceTest, TestCategoria } from '@/features/performance-tests/data'

const testSchema = z.object({
  clienteId: z.string().uuid(),
  categoria: z.enum(['fuerza', 'resistencia', 'flexibilidad', 'medidas', 'otro']),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  valor: z.number(),
  unidad: z.string().min(1, 'Indica la unidad'),
  fechaTest: z.string().optional(),
  notas: z.string().optional(),
})

export async function listPerformanceTests(clienteId: string): Promise<PerformanceTest[]> {
  if (await isDemoSession()) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from('tests_fisicos')
    .select('id, categoria, nombre, valor, unidad, fecha_test, notas')
    .eq('cliente_id', clienteId)
    .order('fecha_test', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    categoria: row.categoria as TestCategoria,
    nombre: row.nombre,
    valor: Number(row.valor),
    unidad: row.unidad,
    fechaTest: row.fecha_test,
    notas: row.notas,
  }))
}

export async function createPerformanceTest(input: {
  clienteId: string
  categoria: TestCategoria
  nombre: string
  valor: number
  unidad: string
  fechaTest?: string
  notas?: string
}) {
  const parsed = testSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoSession()) {
    revalidatePath(`/dashboard/clients/${input.clienteId}`)
    return { success: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('tests_fisicos').insert({
    entrenador_id: user.id,
    cliente_id: parsed.data.clienteId,
    categoria: parsed.data.categoria,
    nombre: parsed.data.nombre,
    valor: parsed.data.valor,
    unidad: parsed.data.unidad,
    ...(parsed.data.fechaTest ? { fecha_test: parsed.data.fechaTest } : {}),
    notas: parsed.data.notas || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${parsed.data.clienteId}`)
  return { success: true }
}

export async function deletePerformanceTest(id: string, clienteId: string) {
  if (await isDemoSession()) {
    revalidatePath(`/dashboard/clients/${clienteId}`)
    return { success: true }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('tests_fisicos').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/clients/${clienteId}`)
  return { success: true }
}
