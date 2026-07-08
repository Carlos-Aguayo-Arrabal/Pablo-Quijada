export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Vencido'

export interface PaymentRecord {
  id: string
  clientId: string
  clientName: string
  concept: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentLink: string | null
  dueDate: string | null
  statusLabel: string
}
