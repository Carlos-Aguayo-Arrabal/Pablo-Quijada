'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { listSessions } from '@/features/agenda/services/actions'
import type { SessionRecord } from '@/features/agenda/data'

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function startOfCalendarGrid(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const jsDay = firstOfMonth.getDay()
  const offset = jsDay === 0 ? 6 : jsDay - 1
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - offset)
  start.setHours(0, 0, 0, 0)
  return start
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

interface AgendaCalendarViewProps {
  initialSessions: SessionRecord[]
  initialMonth: string
}

export function AgendaCalendarView({ initialSessions, initialMonth }: AgendaCalendarViewProps) {
  const [month, setMonth] = useState(() => new Date(initialMonth))
  const [sessions, setSessions] = useState(initialSessions)
  const [isPending, startTransition] = useTransition()

  const days = useMemo(() => {
    const start = startOfCalendarGrid(month)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [month])

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SessionRecord[]>()
    for (const session of sessions) {
      const key = dateKey(new Date(session.fechaHora))
      const list = map.get(key) ?? []
      list.push(session)
      map.set(key, list)
    }
    return map
  }, [sessions])

  function changeMonth(delta: number) {
    const next = new Date(month.getFullYear(), month.getMonth() + delta, 1)
    setMonth(next)

    const from = startOfCalendarGrid(next)
    const to = new Date(from)
    to.setDate(to.getDate() + 42)

    startTransition(async () => {
      const result = await listSessions({ from: from.toISOString(), to: to.toISOString() })
      setSessions(result)
    })
  }

  const today = dateKey(new Date())
  const monthLabel = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold capitalize text-white">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-[#94A3B8]" />}
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#94A3B8] hover:text-white"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#94A3B8] hover:text-white"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-auto pr-1">
        <div className="grid min-w-[700px] grid-cols-7 gap-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-[#475569]">
              {label}
            </div>
          ))}

          {days.map((date) => {
            const key = dateKey(date)
            const daySessions = sessionsByDay.get(key) ?? []
            const isCurrentMonth = date.getMonth() === month.getMonth()
            const isToday = key === today

            return (
              <div
                key={key}
                className={cn(
                  'min-h-24 rounded-xl border p-2',
                  isToday ? 'border-[#FF6A00]/40 bg-[#FF6A00]/5' : 'border-white/[0.07] bg-white/[0.025]',
                  !isCurrentMonth && 'opacity-40'
                )}
              >
                <span className={cn('text-xs font-bold', isToday ? 'text-[#FF6A00]' : 'text-white')}>
                  {date.getDate()}
                </span>
                <div className="mt-1.5 space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: `${session.tipoSesionColor}22`, color: session.tipoSesionColor }}
                      title={`${session.titulo} · ${session.clienteNombre}`}
                    >
                      {session.titulo}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <p className="text-[10px] text-[#475569]">+{daySessions.length - 3} más</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
