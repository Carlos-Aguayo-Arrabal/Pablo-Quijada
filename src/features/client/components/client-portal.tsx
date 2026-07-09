import { isDemoClientSession } from '@/features/demo/server'
import { getMyPlan, getMyProfile, listMyMessages } from '@/features/client/services/actions'
import { ClientPortalView } from '@/features/client/components/client-portal-view'

export async function ClientPortal() {
  const [profile, plan, messages, isDemo] = await Promise.all([
    getMyProfile(),
    getMyPlan(),
    listMyMessages(),
    isDemoClientSession(),
  ])

  return <ClientPortalView profile={profile} plan={plan} initialMessages={messages} isDemo={isDemo} />
}
