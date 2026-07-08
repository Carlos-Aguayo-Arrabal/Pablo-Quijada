import type { Metadata } from 'next'
import { ClientPortal } from '@/features/client/components/client-portal'

export const metadata: Metadata = {
  title: 'Portal cliente',
  description: 'Vista funcional del portal que usaría un cliente de entrenamiento.',
}

export default function ClientPage() {
  return <ClientPortal />
}
