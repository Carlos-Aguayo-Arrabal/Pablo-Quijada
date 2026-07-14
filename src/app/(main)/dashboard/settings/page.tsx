import type { Metadata } from 'next'
import { SettingsPanel } from '@/features/settings/components/settings-panel'
import { getHelpResources } from '@/features/settings/services/actions'

export const metadata: Metadata = {
  title: 'Configuración',
}

export default async function SettingsPage() {
  const helpResources = await getHelpResources()
  return <SettingsPanel initialHelpResources={helpResources} />
}
