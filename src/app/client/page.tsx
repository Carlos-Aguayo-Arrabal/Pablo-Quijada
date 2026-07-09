import type { Metadata } from 'next'
import { ClientPortal } from '@/features/client/components/client-portal'
import { ClientDemoGate } from '@/features/client/components/client-demo-gate'
import { createClient } from '@/lib/supabase/server'
import { isDemoClientSession } from '@/features/demo/server'

export const metadata: Metadata = {
  title: 'Portal cliente',
  description: 'Vista funcional del portal que usaría un cliente de entrenamiento.',
}

export default async function ClientPage() {
  const demoClientSession = await isDemoClientSession()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !demoClientSession) {
    return <ClientDemoGate />
  }

  return <ClientPortal />
}
