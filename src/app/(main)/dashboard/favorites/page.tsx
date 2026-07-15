import type { Metadata } from 'next'
import { ClientDirectory } from '@/features/clients/components/client-directory'
import { listClients, getClientsSummary } from '@/features/clients/services/actions'

export const metadata: Metadata = {
  title: 'Favoritos',
}

export default async function FavoritesPage() {
  const [clients, summary] = await Promise.all([listClients(), getClientsSummary()])
  const favorites = clients.filter((client) => client.favorite)

  return (
    <ClientDirectory
      clients={favorites}
      summary={summary}
      eyebrow="Acceso rápido"
      title="Favoritos"
      subtitle="Los clientes que marcaste con la estrella para tenerlos siempre a mano."
      showInviteButton={false}
    />
  )
}
