import type { Metadata } from 'next'
import { ProfileSettings } from '@/features/profile/components/profile-settings'

export const metadata: Metadata = {
  title: 'Perfil',
}

export default function ProfilePage() {
  return <ProfileSettings />
}
