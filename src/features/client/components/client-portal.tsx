import { isDemoClientSession } from '@/features/demo/server'
import {
  getMyPlan,
  getMyProfile,
  listAvailableSlots,
  listMyMessages,
  listMySessions,
} from '@/features/client/services/actions'
import { ClientPortalView } from '@/features/client/components/client-portal-view'

export async function ClientPortal() {
  const [profile, plan, messages, availableSlots, mySessions, isDemo] = await Promise.all([
    getMyProfile(),
    getMyPlan(),
    listMyMessages(),
    listAvailableSlots(),
    listMySessions(),
    isDemoClientSession(),
  ])

  return (
    <ClientPortalView
      profile={profile}
      plan={plan}
      initialMessages={messages}
      availableSlots={availableSlots}
      mySessions={mySessions}
      isDemo={isDemo}
    />
  )
}
