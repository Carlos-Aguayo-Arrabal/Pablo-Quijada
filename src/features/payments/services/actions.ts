'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import {
  getDemoPayments,
  getDemoPaymentsByClient,
  getDemoPaymentsSummary,
  isDemoClientId,
  isDemoPaymentId,
} from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'
import type { PaymentRecord, PaymentStatus } from '@/features/payments/types'

function statusLabel(status: PaymentStatus, dueDate: string | null) {
  if (status !== 'Pendiente' || !dueDate) return status

  const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return 'Vencido'
  if (days === 0) return 'Vence hoy'
  return `Renueva en ${days} día${days === 1 ? '' : 's'}`
}

type PagoRow = {
  id: string
  cliente_id: string
  concepto: string
  monto: number
  moneda: string
  estado: PaymentStatus
  enlace_pago: string | null
  vence_en: string | null
  clientes: { nombre: string } | null
}

function mapPayment(row: PagoRow): PaymentRecord {
  return {
    id: row.id,
    clientId: row.cliente_id,
    clientName: row.clientes?.nombre ?? 'Cliente',
    concept: row.concepto,
    amount: row.monto,
    currency: row.moneda,
    status: row.estado,
    paymentLink: row.enlace_pago,
    dueDate: row.vence_en,
    statusLabel: statusLabel(row.estado, row.vence_en),
  }
}

export async function listPayments(): Promise<PaymentRecord[]> {
  if (await isDemoSession()) return getDemoPayments()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*, clientes(nombre)')
    .order('creado_en', { ascending: false })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoPayments()

  return rows.map(mapPayment as (row: unknown) => PaymentRecord)
}

export async function listPaymentsByClient(clientId: string): Promise<PaymentRecord[]> {
  if (await isDemoSession()) return getDemoPaymentsByClient(clientId)

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*, clientes(nombre)')
    .eq('cliente_id', clientId)
    .order('creado_en', { ascending: false })

  const rows = data ?? []
  if (error || rows.length === 0) return getDemoPaymentsByClient(clientId)

  return rows.map(mapPayment as (row: unknown) => PaymentRecord)
}

export async function getPaymentsSummary() {
  if (await isDemoSession()) return getDemoPaymentsSummary()

  const supabase = await createSupabaseClient()
  const { data, error } = await supabase.from('pagos').select('monto, estado, vence_en')
  const rows = data ?? []
  if (error || rows.length === 0) return getDemoPaymentsSummary()

  const collected = rows.filter((r) => r.estado === 'Pagado').reduce((sum, r) => sum + r.monto, 0)
  const pending = rows.filter((r) => r.estado === 'Pendiente').reduce((sum, r) => sum + r.monto, 0)
  const renewals = rows.filter((r) => r.estado === 'Pendiente' && r.vence_en).length

  return { collected, pending, renewals }
}

const createPaymentSchema = z.object({
  clientId: z.string().uuid(),
  concept: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  dueDate: z.string().optional(),
  paymentLink: z.string().url('Enlace inválido').optional().or(z.literal('')),
})

const idSchema = z.string().uuid('Pago inválido')

export async function createPayment(input: {
  clientId: string
  concept: string
  amount: number
  dueDate?: string
  paymentLink?: string
}) {
  const parsed = createPaymentSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/payments')
    revalidatePath(`/dashboard/clients/${parsed.data.clientId}`)
    return { success: true }
  }

  if (isDemoClientId(parsed.data.clientId)) {
    revalidatePath('/dashboard/payments')
    revalidatePath(`/dashboard/clients/${parsed.data.clientId}`)
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase.from('pagos').insert({
    entrenador_id: user.id,
    cliente_id: parsed.data.clientId,
    concepto: parsed.data.concept,
    monto: parsed.data.amount,
    vence_en: parsed.data.dueDate || null,
    enlace_pago: parsed.data.paymentLink || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/payments')
  revalidatePath(`/dashboard/clients/${parsed.data.clientId}`)
  return { success: true }
}

export async function markAsPaid(id: string, clientId: string) {
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { error: parsedId.error.issues[0]?.message ?? 'Pago inválido' }

  const parsedClientId = createPaymentSchema.shape.clientId.safeParse(clientId)
  if (!parsedClientId.success) return { error: parsedClientId.error.issues[0]?.message ?? 'Cliente inválido' }

  if (await isDemoSession()) {
    revalidatePath('/dashboard/payments')
    revalidatePath(`/dashboard/clients/${parsedClientId.data}`)
    return { success: true }
  }

  if (isDemoPaymentId(parsedId.data) || isDemoClientId(parsedClientId.data)) {
    revalidatePath('/dashboard/payments')
    revalidatePath(`/dashboard/clients/${parsedClientId.data}`)
    return { success: true }
  }

  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from('pagos')
    .update({ estado: 'Pagado', pagado_en: new Date().toISOString() })
    .eq('id', parsedId.data)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/payments')
  revalidatePath(`/dashboard/clients/${parsedClientId.data}`)
  return { success: true }
}
