import type { Metadata } from 'next'
import { ClientDirectory } from '@/features/clients/components/client-directory'
import { listClients, getClientsSummary } from '@/features/clients/services/actions'

export const metadata: Metadata = {
  title: 'Clientes',
}

export default async function ClientsPage() {
  const [clients, summary] = await Promise.all([listClients(), getClientsSummary()])

  return <ClientDirectory clients={clients} summary={summary} />
}
