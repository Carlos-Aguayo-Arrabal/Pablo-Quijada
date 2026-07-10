'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { AgendaCalendarView } from '@/features/agenda/components/agenda-calendar-view'
import { SessionsList } from '@/features/agenda/components/sessions-list'
import { SessionTypesManager } from '@/features/agenda/components/session-types-manager'
import { AvailabilityManager } from '@/features/agenda/components/availability-manager'
import type { AvailabilitySlot, SessionRecord, SessionsStats, SessionType } from '@/features/agenda/data'

type AgendaTab = 'Calendario' | 'Sesiones agendadas' | 'Tipos de sesión' | 'Horario de citas'

const tabs: AgendaTab[] = ['Calendario', 'Sesiones agendadas', 'Tipos de sesión', 'Horario de citas']

interface AgendaTabsProps {
  initialSessions: SessionRecord[]
  initialMonth: string
  upcomingSessions: SessionRecord[]
  stats: SessionsStats
  sessionTypes: SessionType[]
  availability: AvailabilitySlot[]
  clients: { id: string; name: string }[]
}

export function AgendaTabs({
  initialSessions,
  initialMonth,
  upcomingSessions,
  stats,
  sessionTypes,
  availability,
  clients,
}: AgendaTabsProps) {
  const [activeTab, setActiveTab] = useState<AgendaTab>('Calendario')

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                activeTab === tab
                  ? 'bg-[#FF6A00] text-[#0D1117]'
                  : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Calendario' && (
        <AgendaCalendarView initialSessions={initialSessions} initialMonth={initialMonth} />
      )}

      {activeTab === 'Sesiones agendadas' && (
        <SessionsList
          initialSessions={upcomingSessions}
          initialStats={stats}
          clients={clients}
          sessionTypes={sessionTypes}
        />
      )}

      {activeTab === 'Tipos de sesión' && <SessionTypesManager initialTypes={sessionTypes} />}

      {activeTab === 'Horario de citas' && <AvailabilityManager initialSlots={availability} />}
    </div>
  )
}
