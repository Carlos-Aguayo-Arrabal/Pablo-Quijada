import type { Metadata } from 'next'
import { PaymentsBoard } from '@/features/payments/components/payments-board'
import { listPayments, getPaymentsSummary } from '@/features/payments/services/actions'
import { listClients } from '@/features/clients/services/actions'

export const metadata: Metadata = {
  title: 'Pagos',
}

export default async function PaymentsPage() {
  const [payments, summary, clients] = await Promise.all([
    listPayments(),
    getPaymentsSummary(),
    listClients(),
  ])

  return (
    <PaymentsBoard
      payments={payments}
      summary={summary}
      clients={clients.map((c) => ({ id: c.id, name: c.name }))}
    />
  )
}
