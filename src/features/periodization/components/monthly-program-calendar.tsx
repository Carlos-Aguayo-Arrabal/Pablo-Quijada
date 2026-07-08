'use client'

import { useMemo, useState } from 'react'
import { Copy, Eye, Plus, Sparkles } from 'lucide-react'
import type { ProgramPhaseView } from '@/features/periodization/data'
import { cn } from '@/shared/lib/utils'

interface CalendarWorkout {
  id: string
  shortName: string
}

interface CalendarDay {
  key: string
  date: Date
  phase: ProgramPhaseView | null
  phaseWeek: number | null
  workout: CalendarWorkout | null
}

interface MonthlyProgramCalendarProps {
  phases: ProgramPhaseView[]
}

const seedWorkouts: Record<number, CalendarWorkout> = {
  0: { id: 'w-1', shortName: 'Full Body' },
  2: { id: 'w-2', shortName: 'Lower' },
  4: { id: 'w-3', shortName: 'Upper' },
  7: { id: 'w-4', shortName: 'Power' },
  10: { id: 'w-5', shortName: 'Circuit' },
}

function startOfWeek(date: Date) {
  const next = new Date(date)
  const day = next.getDay() || 7
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - day + 1)
  return next
}

function buildDays(phases: ProgramPhaseView[]) {
  const start = startOfWeek(new Date())
  const totalWeeks = Math.max(8, phases.reduce((sum, phase) => sum + phase.durationWeeks, 0))

  return Array.from({ length: totalWeeks * 7 }, (_, index): CalendarDay => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    const weekIndex = Math.floor(index / 7)
    let cursor = 0
    let phase: ProgramPhaseView | null = null
    let phaseWeek: number | null = null

    for (const item of phases) {
      if (weekIndex >= cursor && weekIndex < cursor + item.durationWeeks) {
        phase = item
        phaseWeek = weekIndex - cursor + 1
        break
      }
      cursor += item.durationWeeks
    }

    return {
      key: date.toISOString().slice(0, 10),
      date,
      phase,
      phaseWeek,
      workout: seedWorkouts[index] ?? null,
    }
  })
}

export function MonthlyProgramCalendar({ phases }: MonthlyProgramCalendarProps) {
  const days = useMemo(() => buildDays(phases), [phases])
  const weeks = useMemo(() => Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, index * 7 + 7)), [days])
  const [menuDay, setMenuDay] = useState<string | null>(null)

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Calendario del programa</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">Vista mensual continua por fases y semanas.</p>
        </div>
        <span className="rounded-full bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold text-[#FF6A00]">
          {weeks.length} semanas
        </span>
      </div>

      <div className="max-h-[560px] overflow-auto pr-1">
        <div className="grid min-w-[900px] grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-[#475569]">{day}</div>
          ))}

          {weeks.map((week, weekIndex) => (
            <div key={week[0]?.key ?? weekIndex} className="contents">
              {week.map((day, dayIndex) => {
                const showWeekLabel = dayIndex === 0
                const isMenuOpen = menuDay === day.key

                return (
                  <div key={day.key} className="relative min-h-32 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white">{day.date.getDate()}</span>
                      {showWeekLabel && day.phase && (
                        <span className="rounded-full bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6A00]">
                          S{day.phaseWeek}
                        </span>
                      )}
                    </div>

                    {showWeekLabel && (
                      <p className="mb-2 min-h-8 text-[11px] font-semibold leading-tight text-[#94A3B8]">
                        {day.phase ? `${day.phase.name} · semana ${day.phaseWeek}` : 'Sin fase'}
                      </p>
                    )}

                    {day.workout ? (
                      <button
                        type="button"
                        onClick={() => setMenuDay(isMenuOpen ? null : day.key)}
                        className="w-full rounded-lg border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-2 py-1.5 text-left text-xs font-bold text-[#FFB000] transition hover:bg-[#FF6A00]/15"
                      >
                        {day.workout.shortName}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="mt-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#64748B] transition hover:bg-white/[0.05] hover:text-[#FF6A00]"
                      >
                        <Plus className="h-3 w-3" />
                        {day.phase ? 'Agregar workout' : 'Agregar fase'}
                      </button>
                    )}

                    {isMenuOpen && day.workout && (
                      <div className="absolute left-2 right-2 top-20 z-20 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111B26] shadow-2xl">
                        <MenuAction icon={Eye} label="Visualizar" />
                        <MenuAction icon={Plus} label="Nuevo" />
                        <MenuAction icon={Copy} label="Duplicar como plantilla" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MenuAction({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <button type="button" className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#C8D2E3] transition hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]')}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
