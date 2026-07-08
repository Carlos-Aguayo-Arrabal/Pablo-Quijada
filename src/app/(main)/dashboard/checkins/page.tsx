import type { Metadata } from 'next'
import { CheckInsBoard } from '@/features/checkins/components/checkins-board'
import { listCheckIns, getCheckInStats } from '@/features/checkins/services/actions'

export const metadata: Metadata = {
  title: 'Check-ins',
}

export default async function CheckInsPage() {
  const [checkIns, stats] = await Promise.all([listCheckIns(), getCheckInStats()])

  return <CheckInsBoard checkIns={checkIns} stats={stats} />
}
