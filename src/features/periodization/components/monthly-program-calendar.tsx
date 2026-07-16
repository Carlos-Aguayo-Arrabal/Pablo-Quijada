'use client'

import { useMemo, useState, useTransition } from 'react'
import { Copy, Eye, Loader2, Plus, X } from 'lucide-react'
import type { ProgramWeekView, CalendarWorkoutView } from '@/features/periodization/services/actions'
import {
  createPhaseAction,
  createWorkoutAction,
  duplicateWorkoutAsPlanAction,
  getWorkoutDetail,
} from '@/features/periodization/services/actions'
import { cn } from '@/shared/lib/utils'

interface CalendarPhase {
  id: string
  name: string
  durationWeeks: number
  weeks: ProgramWeekView[]
}

interface CalendarDay {
  key: string
  date: Date
  phase: CalendarPhase | null
  phaseWeek: number | null
  semanaId: string | null
  diaSemana: number
  workouts: CalendarWorkoutView[]
}

interface MonthlyProgramCalendarProps {
  planId: string
  programId?: string
  phases: CalendarPhase[]
  workoutsByWeek: Record<string, CalendarWorkoutView[]>
}

function startOfWeek(date: Date) {
  const next = new Date(date)
  const day = next.getDay() || 7
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - day + 1)
  return next
}

function buildDays(phases: CalendarPhase[], workoutsByWeek: Record<string, CalendarWorkoutView[]>) {
  const start = startOfWeek(new Date())
  const totalWeeks = Math.max(8, phases.reduce((sum, phase) => sum + phase.durationWeeks, 0))

  return Array.from({ length: totalWeeks * 7 }, (_, index): CalendarDay => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const diaSemana = date.getDay() || 7

    const weekIndex = Math.floor(index / 7)
    let cursor = 0
    let phase: CalendarPhase | null = null
    let phaseWeek: number | null = null

    for (const item of phases) {
      if (weekIndex >= cursor && weekIndex < cursor + item.durationWeeks) {
        phase = item
        phaseWeek = weekIndex - cursor + 1
        break
      }
      cursor += item.durationWeeks
    }

    const semanaId = phase && phaseWeek ? phase.weeks[phaseWeek - 1]?.id ?? null : null
    const workouts = semanaId
      ? (workoutsByWeek[semanaId] ?? []).filter((workout) => workout.diaSemana === diaSemana)
      : []

    return {
      key: date.toISOString().slice(0, 10),
      date,
      phase,
      phaseWeek,
      semanaId,
      diaSemana,
      workouts,
    }
  })
}

interface WorkoutDetailState {
  id: string
  nombre: string
  franjaHoraria: string | null
  notas: string | null
  blocks: Array<{
    id: string
    nombre: string
    tipo: string
    exercises: Array<{ nombre: string; series: number; repeticiones: string; rpeRir: string | null; descansoSegundos: number | null }>
  }>
}

export function MonthlyProgramCalendar({ planId, programId, phases, workoutsByWeek }: MonthlyProgramCalendarProps) {
  const days = useMemo(() => buildDays(phases, workoutsByWeek), [phases, workoutsByWeek])
  const weeks = useMemo(() => Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => days.slice(index * 7, index * 7 + 7)), [days])
  const [menuWorkoutId, setMenuWorkoutId] = useState<string | null>(null)
  const [addingDay, setAddingDay] = useState<string | null>(null)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [viewingWorkout, setViewingWorkout] = useState<WorkoutDetailState | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const canPersist = Boolean(programId && !programId.startsWith('demo-'))

  function flashStatus(message: string) {
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  function submitNewWorkout(day: CalendarDay) {
    if (!day.semanaId || !newWorkoutName.trim()) return
    const name = newWorkoutName.trim()
    setAddingDay(null)
    setNewWorkoutName('')

    if (!canPersist) {
      flashStatus('No disponible en la sesión de demostración.')
      return
    }

    startTransition(async () => {
      const result = await createWorkoutAction(planId, day.semanaId as string, day.diaSemana, name)
      flashStatus(result.error ? result.error : `"${name}" añadido al calendario.`)
    })
  }

  function handleAddPhase() {
    if (!canPersist || !programId) {
      flashStatus('No disponible en la sesión de demostración.')
      return
    }
    startTransition(async () => {
      const result = await createPhaseAction(planId, programId)
      flashStatus(result.error ? result.error : 'Fase añadida.')
    })
  }

  async function handleVisualizar(workout: CalendarWorkoutView) {
    setMenuWorkoutId(null)
    setIsLoadingDetail(true)
    setViewingWorkout({ id: workout.id, nombre: workout.nombre, franjaHoraria: null, notas: null, blocks: [] })
    const detail = await getWorkoutDetail(workout.id)
    setIsLoadingDetail(false)
    if (!detail) {
      setViewingWorkout(null)
      flashStatus('No se pudo cargar el workout.')
      return
    }
    setViewingWorkout({ id: workout.id, ...detail })
  }

  function handleDuplicate(workout: CalendarWorkoutView) {
    setMenuWorkoutId(null)
    if (!canPersist) {
      flashStatus('No disponible en la sesión de demostración.')
      return
    }
    startTransition(async () => {
      const result = await duplicateWorkoutAsPlanAction(workout.id)
      flashStatus(result.error ? result.error : `"${workout.nombre}" guardado como nueva plantilla en Biblioteca.`)
    })
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Calendario del programa</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">Vista mensual continua por fases y semanas.</p>
        </div>
        <div className="flex items-center gap-2">
          {(isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF6A00]" />}
          <span className="rounded-full bg-[#FF6A00]/10 px-3 py-1 text-xs font-bold text-[#FF6A00]">
            {weeks.length} semanas
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-2 text-xs font-semibold text-[#FFB000]">
          {statusMessage}
        </div>
      )}

      <div className="max-h-[560px] overflow-auto pr-1">
        <div className="grid min-w-[900px] grid-cols-7 gap-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
            <div key={day} className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-[#475569]">{day}</div>
          ))}

          {weeks.map((week, weekIndex) => (
            <div key={week[0]?.key ?? weekIndex} className="contents">
              {week.map((day) => {
                const showWeekLabel = day.date.getDay() === 1 || day.key === days[0]?.key

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

                    <div className="space-y-1">
                      {day.workouts.map((workout) => (
                        <div key={workout.id} className="relative">
                          <button
                            type="button"
                            onClick={() => setMenuWorkoutId(menuWorkoutId === workout.id ? null : workout.id)}
                            className="w-full rounded-lg border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-2 py-1.5 text-left text-xs font-bold text-[#FFB000] transition hover:bg-[#FF6A00]/15"
                          >
                            {workout.nombre}
                          </button>

                          {menuWorkoutId === workout.id && (
                            <div className="absolute left-0 right-0 top-8 z-20 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111B26] shadow-2xl">
                              <MenuAction icon={Eye} label="Visualizar" onClick={() => handleVisualizar(workout)} />
                              <MenuAction
                                icon={Plus}
                                label="Nuevo"
                                onClick={() => {
                                  setMenuWorkoutId(null)
                                  setAddingDay(day.key)
                                }}
                              />
                              <MenuAction icon={Copy} label="Duplicar como plantilla" onClick={() => handleDuplicate(workout)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {day.phase && day.semanaId && addingDay !== day.key && (
                      <button
                        type="button"
                        onClick={() => setAddingDay(day.key)}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#64748B] transition hover:bg-white/[0.05] hover:text-[#FF6A00]"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar workout
                      </button>
                    )}

                    {!day.phase && (
                      <button
                        type="button"
                        onClick={handleAddPhase}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-[#64748B] transition hover:bg-white/[0.05] hover:text-[#FF6A00]"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar fase
                      </button>
                    )}

                    {addingDay === day.key && (
                      <div className="absolute left-2 right-2 top-16 z-20 rounded-xl border border-white/[0.08] bg-[#111B26] p-2 shadow-2xl">
                        <input
                          autoFocus
                          value={newWorkoutName}
                          onChange={(event) => setNewWorkoutName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') submitNewWorkout(day)
                            if (event.key === 'Escape') { setAddingDay(null); setNewWorkoutName('') }
                          }}
                          placeholder="Nombre del workout"
                          className="input-field mb-2 text-xs"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setAddingDay(null); setNewWorkoutName('') }}
                            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#94A3B8] hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => submitNewWorkout(day)}
                            className="btn-primary rounded-lg px-3 py-1 text-[11px]"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {viewingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewingWorkout(null)}>
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0D1117] p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-black text-white">{viewingWorkout.nombre}</h3>
              <button type="button" onClick={() => setViewingWorkout(null)} className="text-[#94A3B8] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {isLoadingDetail && <p className="text-sm text-[#94A3B8]">Cargando…</p>}

            {!isLoadingDetail && viewingWorkout.blocks.length === 0 && (
              <p className="text-sm text-[#94A3B8]">Este workout todavía no tiene bloques ni ejercicios.</p>
            )}

            <div className="space-y-4">
              {viewingWorkout.blocks.map((block) => (
                <div key={block.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#FF6A00]">{block.nombre} · {block.tipo}</p>
                  <div className="space-y-2">
                    {block.exercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-[#C8D2E3]">
                        <span>{exercise.nombre}</span>
                        <span className="text-xs text-[#94A3B8]">
                          {exercise.series}×{exercise.repeticiones}{exercise.rpeRir ? ` · ${exercise.rpeRir}` : ''}{exercise.descansoSegundos ? ` · ${exercise.descansoSegundos}s` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function MenuAction({ icon: Icon, label, onClick }: { icon: typeof Eye; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#C8D2E3] transition hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]')}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
