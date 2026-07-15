import type { Metadata } from 'next'
import { GroupsBoard } from '@/features/clients/components/groups-board'
import { listClients } from '@/features/clients/services/actions'

export const metadata: Metadata = {
  title: 'Grupos',
}

export default async function GroupsPage() {
  const clients = await listClients()
  return <GroupsBoard clients={clients} />
}
