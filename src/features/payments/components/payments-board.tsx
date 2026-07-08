'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeEuro, Check, Clock, CreditCard, ExternalLink, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { createPayment, markAsPaid } from '@/features/payments/services/actions'
import type { PaymentRecord } from '@/features/payments/types'

interface PaymentsBoardProps {
  payments: PaymentRecord[]
  summary: { collected: number; pending: number; renewals: number }
  clients: { id: string; name: string }[]
}

const statusTone: Record<PaymentRecord['status'], string> = {
  Pagado: 'text-[#FF6A00]',
  Pendiente: 'text-[#FB923C]',
  Vencido: 'text-[#F87171]',
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
}

function pendingStatusLabel(dueDate: string | null) {
  if (!dueDate) return 'Pendiente'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'Vencido'
  if (days === 0) return 'Vence hoy'
  return `Renueva en ${days} día${days === 1 ? '' : 's'}`
}

export function PaymentsBoard({ payments, summary, clients }: PaymentsBoardProps) {
  const [paymentRows, setPaymentRows] = useState(payments)
  const [showForm, setShowForm] = useState(false)
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentLink, setPaymentLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)

  async function submitPayment() {
    setError(null)
    setIsSubmitting(true)

    const result = await createPayment({
      clientId,
      concept,
      amount: Number.parseFloat(amount),
      dueDate: dueDate || undefined,
      paymentLink: paymentLink || undefined,
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    const selectedClient = clients.find((client) => client.id === clientId)
    const localDueDate = dueDate || null
    setPaymentRows((current) => [
      {
        id: globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`,
        clientId,
        clientName: selectedClient?.name ?? 'Cliente',
        concept,
        amount: Number.parseFloat(amount),
        currency: 'EUR',
        status: 'Pendiente',
        paymentLink: paymentLink || null,
        dueDate: localDueDate,
        statusLabel: pendingStatusLabel(localDueDate),
      },
      ...current,
    ])
    setConcept('')
    setAmount('')
    setDueDate('')
    setPaymentLink('')
    setShowForm(false)
    setIsSubmitting(false)
  }

  async function approvePayment(id: string, paymentClientId: string) {
    setMarkingId(id)
    setPaymentRows((current) =>
      current.map((payment) =>
        payment.id === id ? { ...payment, status: 'Pagado', statusLabel: 'Pagado' } : payment
      )
    )
    await markAsPaid(id, paymentClientId)
    setMarkingId(null)
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagos</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Controla cobros, renovaciones y servicios activos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowForm((v) => !v)} className="btn-primary w-fit text-sm" disabled={clients.length === 0}>
            <Plus className="h-4 w-4" />
            Registrar pago
          </button>
          <Link href="/dashboard/upgrade" className="btn-secondary w-fit text-sm">
            Configurar plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {clients.length === 0 && (
        <div className="mb-6 rounded-xl border border-[#FFB000]/25 bg-[#FFB000]/10 px-4 py-3 text-sm text-[#FFB000]">
          Invita al menos un cliente antes de registrar pagos.
        </div>
      )}

      {showForm && (
        <div className="glass-card mb-6 rounded-2xl p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Cliente</span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="input-field">
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-[#0D1117]">{client.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Concepto</span>
              <input value={concept} onChange={(e) => setConcept(e.target.value)} className="input-field" placeholder="Fuerza 12 semanas" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Importe (€)</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="0" step="0.01" className="input-field" placeholder="129" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Vence (opcional)</span>
              <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="input-field" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Enlace de pago (opcional)</span>
              <input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} className="input-field" placeholder="https://buy.stripe.com/..." />
            </label>
          </div>
          <button
            type="button"
            onClick={submitPayment}
            disabled={isSubmitting || !clientId || !concept || !amount}
            className="btn-primary mt-4 px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar pago'}
          </button>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: BadgeEuro, label: 'Cobrado', value: formatAmount(summary.collected, 'EUR'), color: '#FF6A00' },
          { icon: Clock, label: 'Pendiente', value: formatAmount(summary.pending, 'EUR'), color: '#FB923C' },
          { icon: Check, label: 'Renovaciones', value: String(summary.renewals), color: '#FFB000' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5">
            <stat.icon className="mb-3 h-5 w-5" style={{ color: stat.color }} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-[#94A3B8]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#FF6A00]" />
          <h2 className="text-sm font-semibold text-white">Últimos cobros</h2>
        </div>
        <div className="space-y-3">
          {paymentRows.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/dashboard/clients/${payment.clientId}`} className="min-w-0 flex-1 hover:opacity-80">
                <p className="font-semibold text-white">{payment.clientName}</p>
                <p className="text-sm text-[#94A3B8]">{payment.concept}</p>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-white">{formatAmount(payment.amount, payment.currency)}</span>
                <span className={cn('text-sm font-medium', statusTone[payment.status])}>{payment.statusLabel}</span>
                {payment.paymentLink && (
                  <a href={payment.paymentLink} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-white" aria-label="Abrir enlace de pago">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {payment.status !== 'Pagado' && (
                  <button
                    type="button"
                    onClick={() => approvePayment(payment.id, payment.clientId)}
                    disabled={markingId === payment.id}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    {markingId === payment.id ? 'Marcando...' : 'Marcar pagado'}
                  </button>
                )}
              </div>
            </div>
          ))}
          {paymentRows.length === 0 && (
            <p className="text-sm text-[#94A3B8]">Todavía no hay pagos registrados.</p>
          )}
        </div>
      </div>
    </div>
  )
}
