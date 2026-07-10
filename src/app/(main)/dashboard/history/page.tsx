import type { Metadata } from 'next'
import { AgendaTabs } from '@/features/agenda/components/agenda-tabs'
import {
  getSessionsStats,
  listAvailability,
  listSessions,
  listSessionTypes,
} from '@/features/agenda/services/actions'
import { listClients } from '@/features/clients/services/actions'

export const metadata: Metadata = {
  title: 'Agenda',
}

function startOfCalendarGrid(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const jsDay = firstOfMonth.getDay()
  const offset = jsDay === 0 ? 6 : jsDay - 1
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - offset)
  start.setHours(0, 0, 0, 0)
  return start
}

export default async function HistoryPage() {
  const now = new Date()
  const from = startOfCalendarGrid(now)
  const to = new Date(from)
  to.setDate(to.getDate() + 42)

  const in90days = new Date(now)
  in90days.setDate(in90days.getDate() + 90)

  const [initialSessions, upcomingSessionsRaw, stats, sessionTypes, availability, clients] = await Promise.all([
    listSessions({ from: from.toISOString(), to: to.toISOString() }),
    listSessions({ from: now.toISOString(), to: in90days.toISOString() }),
    getSessionsStats(),
    listSessionTypes(),
    listAvailability(),
    listClients(),
  ])

  const upcomingSessions = upcomingSessionsRaw.filter((s) => s.estado === 'programada')

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Calendario, sesiones, tipos y horario de citas de tu negocio.</p>
      </div>

      <AgendaTabs
        initialSessions={initialSessions}
        initialMonth={now.toISOString()}
        upcomingSessions={upcomingSessions}
        stats={stats}
        sessionTypes={sessionTypes}
        availability={availability}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
