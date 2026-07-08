'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Flame,
  MessageSquare,
  Pause,
  Play,
  RotateCcw,
  Send,
  Target,
  Utensils,
  Video,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { WorkspaceActions } from '@/shared/components/workspace-actions'

const exercises = [
  {
    id: 'sentadilla-goblet',
    name: 'Sentadilla goblet',
    sets: 4,
    reps: 10,
    rpe: 7,
    restSeconds: 90,
    secondsPerRep: 4,
    note: 'Controla la bajada y mantén el torso estable.',
  },
  {
    id: 'press-banca',
    name: 'Press banca con mancuernas',
    sets: 4,
    reps: 8,
    rpe: 8,
    restSeconds: 120,
    secondsPerRep: 5,
    note: 'No bloquees codos al final del recorrido.',
  },
  {
    id: 'remo-polea',
    name: 'Remo en polea',
    sets: 3,
    reps: 12,
    rpe: 7,
    restSeconds: 75,
    secondsPerRep: 3,
    note: 'Pausa un segundo al juntar escápulas.',
  },
  {
    id: 'plancha',
    name: 'Plancha frontal',
    sets: 3,
    reps: 1,
    durationSeconds: 40,
    restSeconds: 60,
    secondsPerRep: 40,
    note: 'Respira y evita hundir la cadera.',
  },
]

const habits = [
  { id: 'protein', label: 'Llegar a 150 g de proteína', detail: 'Objetivo nutricional diario' },
  { id: 'steps', label: '8.000 pasos', detail: 'Actividad fuera del entrenamiento' },
  { id: 'water', label: '2,5 L de agua', detail: 'Hidratación' },
]

const meals = [
  { name: 'Desayuno', content: 'Yogur griego, avena, frutos rojos y nueces', macros: '520 kcal · 38P / 58C / 16G' },
  { name: 'Comida', content: 'Arroz, pollo, verduras y aceite de oliva', macros: '710 kcal · 52P / 82C / 18G' },
  { name: 'Cena', content: 'Salmón, patata cocida y ensalada grande', macros: '640 kcal · 46P / 50C / 24G' },
]

type ExerciseLogs = Record<string, { load: string; reps: string; note: string }>

function readStoredArray(key: string, fallback: string[]) {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : fallback
  } catch {
    return fallback
  }
}

function readStoredValue(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  return window.localStorage.getItem(key) ?? fallback
}

function readStoredLogs() {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem('client-portal:logs')
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ExerciseLogs
  } catch {
    return {}
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getWorkSeconds(exercise: (typeof exercises)[number]) {
  return exercise.durationSeconds ?? exercise.reps * exercise.secondsPerRep
}

function getTotalExerciseSeconds(exercise: (typeof exercises)[number]) {
  const work = getWorkSeconds(exercise) * exercise.sets
  const rests = exercise.restSeconds * Math.max(exercise.sets - 1, 0)
  return work + rests
}

export function ClientPortal() {
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(
    () => new Set(readStoredArray('client-portal:exercises', ['sentadilla-goblet']))
  )
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(
    () => new Set(readStoredArray('client-portal:habits', ['water']))
  )
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogs>(() => readStoredLogs())
  const [energy, setEnergy] = useState(() => Number(readStoredValue('client-portal:energy', '7')))
  const [weight, setWeight] = useState(() => readStoredValue('client-portal:weight', '78.4'))
  const [message, setMessage] = useState('')
  const [checkInSent, setCheckInSent] = useState(false)
  const [sessionFinished, setSessionFinished] = useState(false)
  const [techniqueTip, setTechniqueTip] = useState('')
  const [lastMessage, setLastMessage] = useState('Perfecto, hoy toca fuerza. Si notas molestia en hombro, baja carga en press.')

  const exerciseProgress = useMemo(
    () => Math.round((completedExercises.size / exercises.length) * 100),
    [completedExercises]
  )
  const habitProgress = useMemo(
    () => Math.round((completedHabits.size / habits.length) * 100),
    [completedHabits]
  )

  useEffect(() => {
    window.localStorage.setItem('client-portal:exercises', JSON.stringify([...completedExercises]))
  }, [completedExercises])

  useEffect(() => {
    window.localStorage.setItem('client-portal:habits', JSON.stringify([...completedHabits]))
  }, [completedHabits])

  useEffect(() => {
    window.localStorage.setItem('client-portal:logs', JSON.stringify(exerciseLogs))
  }, [exerciseLogs])

  useEffect(() => {
    window.localStorage.setItem('client-portal:weight', weight)
  }, [weight])

  useEffect(() => {
    window.localStorage.setItem('client-portal:energy', String(energy))
  }, [energy])

  function toggleExercise(id: string) {
    setCompletedExercises((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleHabit(id: string) {
    setCompletedHabits((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function sendMessage() {
    const trimmed = message.trim()
    if (!trimmed) return
    setLastMessage(trimmed)
    setMessage('')
  }

  function updateExerciseLog(id: string, field: keyof ExerciseLogs[string], value: string) {
    setExerciseLogs((current) => ({
      ...current,
      [id]: {
        load: current[id]?.load ?? '',
        reps: current[id]?.reps ?? '',
        note: current[id]?.note ?? '',
        [field]: value,
      },
    }))
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080C14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#FFB000]/25 bg-[#FFB000]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFB000]">
              Portal cliente
            </div>
            <h1 className="truncate text-lg font-bold">Hola, Laura</h1>
            <p className="truncate text-xs text-[#94A3B8]">Vista de entrenamientos, hábitos y comunicación con tu coach.</p>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <WorkspaceActions mode="client" userName="Laura" userEmail="laura@cliente.demo" compact />
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/30 to-[#FFB000]/30 text-sm font-bold sm:flex">
              LM
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="badge badge-teal mb-3">
                  <CalendarCheck className="h-3 w-3" />
                  Día 3 · Semana 4
                </div>
                <h2 className="text-2xl font-black tracking-tight">Fuerza torso + core</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#94A3B8]">
                  Sesión de 45 minutos. Prioriza técnica, registra cargas y deja comentario si algo molesta.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-center">
                <div className="text-3xl font-black text-[#FF6A00]">{exerciseProgress}%</div>
                <div className="text-xs text-[#94A3B8]">completado</div>
              </div>
            </div>
            {sessionFinished && (
              <div className="mb-5 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm text-[#FF6A00]">
                Sesión finalizada. Tu coach verá el entrenamiento completado con tus registros.
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock, label: 'Duración', value: '45 min' },
                { icon: Flame, label: 'Estimado', value: '340 kcal' },
                { icon: Target, label: 'Objetivo', value: 'Fuerza' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.04] p-3">
                  <item.icon className="mb-2 h-4 w-4 text-[#FF6A00]" />
                  <p className="text-xs text-[#94A3B8]">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Resumen semanal</h2>
              <Activity className="h-4 w-4 text-[#FF6A00]" />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Entrenos', value: '3 / 4', pct: 75, color: '#FF6A00' },
                { label: 'Hábitos', value: `${completedHabits.size} / ${habits.length}`, pct: habitProgress, color: '#FFB000' },
                { label: 'Peso', value: `${weight} kg`, pct: 68, color: '#FB923C' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">{item.label}</span>
                    <span className="font-medium" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Entrenamiento de hoy</h2>
                <span className="text-xs text-[#94A3B8]">{completedExercises.size} de {exercises.length}</span>
              </div>
              <div className="space-y-3">
                {exercises.map((exercise, index) => {
                  const done = completedExercises.has(exercise.id)
                  const log = exerciseLogs[exercise.id] ?? { load: '', reps: '', note: '' }
                  return (
                    <div
                      key={exercise.id}
                      className={cn(
                        'rounded-xl border p-4 transition',
                        done ? 'border-[#FF6A00]/25 bg-[#FF6A00]/8' : 'border-white/[0.08] bg-white/[0.03]'
                      )}
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExercise(exercise.id)}
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition',
                            done
                              ? 'border-[#FF6A00] bg-[#FF6A00] text-[#080C14]'
                              : 'border-white/15 text-[#475569] hover:border-[#FF6A00]/60 hover:text-[#FF6A00]'
                          )}
                          aria-label={done ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-[#475569]">Ejercicio {index + 1}</p>
                              <h3 className={cn('font-semibold', done && 'text-[#FF6A00]')}>{exercise.name}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setTechniqueTip(`Técnica abierta: ${exercise.name}. En una versión con backend aquí aparecería el vídeo asignado por Carlos.`)}
                              className="flex min-h-8 items-center gap-1 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Ver técnica
                            </button>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-[#94A3B8] sm:grid-cols-3">
                            <span>{exercise.sets} series</span>
                            <span>
                              {exercise.durationSeconds
                                ? `${exercise.durationSeconds} segundos`
                                : `${exercise.reps} reps · RPE ${exercise.rpe}`}
                            </span>
                            <span>{exercise.restSeconds}s descanso</span>
                          </div>
                          <p className="mt-3 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-[#94A3B8]">
                            {exercise.note}
                          </p>
                          <ExerciseTimer key={exercise.name} exercise={exercise} />
                          <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            <label className="block">
                              <span className="mb-1 block text-[11px] text-[#475569]">Carga usada</span>
                              <input
                                value={log.load}
                                onChange={(event) => updateExerciseLog(exercise.id, 'load', event.target.value)}
                                className="input-field py-2 text-xs"
                                placeholder="Ej: 22 kg"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[11px] text-[#475569]">Reps reales</span>
                              <input
                                value={log.reps}
                                onChange={(event) => updateExerciseLog(exercise.id, 'reps', event.target.value)}
                                className="input-field py-2 text-xs"
                                placeholder="Ej: 10/10/9/8"
                              />
                            </label>
                            <label className="block sm:col-span-1">
                              <span className="mb-1 block text-[11px] text-[#475569]">Nota</span>
                              <input
                                value={log.note}
                                onChange={(event) => updateExerciseLog(exercise.id, 'note', event.target.value)}
                                className="input-field py-2 text-xs"
                                placeholder="Sensaciones"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setSessionFinished(true)}
                disabled={completedExercises.size < exercises.length}
                className="btn-primary mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Finalizar sesión
                <Check className="h-4 w-4" />
              </button>
              {completedExercises.size < exercises.length && (
                <p className="mt-2 text-center text-xs text-[#94A3B8]">
                  Completa todos los ejercicios para cerrar la sesión.
                </p>
              )}
            </div>

            {techniqueTip && (
              <div className="glass-card rounded-2xl p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#FF6A00]" />
                  <h2 className="text-sm font-semibold">Guía técnica</h2>
                </div>
                <p className="text-sm text-[#94A3B8]">{techniqueTip}</p>
              </div>
            )}

            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-[#FB923C]" />
                <h2 className="text-sm font-semibold">Plan nutricional de hoy</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {meals.map((meal) => (
                  <div key={meal.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">{meal.name}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{meal.content}</p>
                    <p className="mt-3 text-xs font-medium text-[#FB923C]">{meal.macros}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 text-sm font-semibold">Hábitos diarios</h2>
              <div className="space-y-3">
                {habits.map((habit) => {
                  const done = completedHabits.has(habit.id)
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => toggleHabit(habit.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full border', done ? 'border-[#FF6A00] bg-[#FF6A00] text-[#080C14]' : 'border-white/15 text-[#475569]')}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-white">{habit.label}</span>
                        <span className="block text-xs text-[#94A3B8]">{habit.detail}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <form
              className="glass-card rounded-2xl p-5"
              onSubmit={(event) => {
                event.preventDefault()
                setCheckInSent(true)
              }}
            >
              <h2 className="mb-4 text-sm font-semibold">Check-in rápido</h2>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Peso de hoy</span>
                  <input
                    value={weight}
                    onChange={(event) => setWeight(event.target.value)}
                    className="input-field"
                    inputMode="decimal"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Energía: {energy}/10</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(event) => setEnergy(Number(event.target.value))}
                    className="w-full accent-[#FF6A00]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Comentario para Carlos</span>
                  <textarea
                    className="input-field min-h-24 resize-none"
                    placeholder="Ej: dormí poco, pero el entrenamiento salió bien..."
                  />
                </label>
                <button className="btn-primary w-full justify-center" type="submit">
                  Enviar check-in
                  <ChevronRight className="h-4 w-4" />
                </button>
                {checkInSent && (
                  <p className="rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-3 py-2 text-xs text-[#FF6A00]">
                    Check-in enviado. Carlos lo verá en su panel.
                  </p>
                )}
              </div>
            </form>

            <div className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#FFB000]" />
                <h2 className="text-sm font-semibold">Mensaje con tu coach</h2>
              </div>
              <div className="mb-3 rounded-xl bg-[#FFB000]/10 p-3 text-sm text-[#DDE2FF]">
                {lastMessage}
              </div>
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="input-field"
                  placeholder="Escribe una duda..."
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00] text-[#080C14]"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface ExerciseTimerProps {
  exercise: (typeof exercises)[number]
}

function ExerciseTimer({ exercise }: ExerciseTimerProps) {
  const totalSeconds = getTotalExerciseSeconds(exercise)
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setIsRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning])

  const elapsedSeconds = totalSeconds - remainingSeconds
  const phase = getTimerPhase(exercise, elapsedSeconds)
  const progress = totalSeconds > 0 ? Math.round((elapsedSeconds / totalSeconds) * 100) : 0

  function resetTimer() {
    setIsRunning(false)
    setRemainingSeconds(totalSeconds)
  }

  return (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#080C14]/45 p-3">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#475569]">Temporizador de ejercicio</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black text-[#FF6A00]">{formatTime(remainingSeconds)}</span>
            <span className="text-xs text-[#94A3B8]">
              Serie {phase.set} de {exercise.sets} · {phase.label}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((value) => !value)}
            disabled={remainingSeconds === 0}
            className="flex h-9 min-w-24 items-center justify-center gap-2 rounded-full bg-[#FF6A00] px-3 text-xs font-bold text-[#080C14] disabled:opacity-50"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-[#94A3B8] hover:text-white"
            aria-label="Reiniciar temporizador"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-[#94A3B8]">
        Total estimado: {formatTime(totalSeconds)} · Trabajo: {formatTime(getWorkSeconds(exercise))} por serie · Descanso: {formatTime(exercise.restSeconds)}
      </p>
    </div>
  )
}

function getTimerPhase(exercise: (typeof exercises)[number], elapsedSeconds: number) {
  const workSeconds = getWorkSeconds(exercise)
  const setBlockSeconds = workSeconds + exercise.restSeconds

  for (let set = 1; set <= exercise.sets; set += 1) {
    const setStart = (set - 1) * setBlockSeconds
    const workEnd = setStart + workSeconds
    const restEnd = workEnd + (set < exercise.sets ? exercise.restSeconds : 0)

    if (elapsedSeconds < workEnd) {
      return { set, label: 'trabajo' }
    }

    if (set < exercise.sets && elapsedSeconds < restEnd) {
      return { set, label: 'descanso' }
    }
  }

  return { set: exercise.sets, label: 'completado' }
}
