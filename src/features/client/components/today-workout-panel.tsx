'use client'

import { useMemo, useState } from 'react'
import { CalendarCheck, Check, Clock, Flame, Target, Video } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ClientPlan } from '@/features/client/types'
import { ExerciseTimer } from '@/features/client/components/exercise-timer'

type ExerciseLogs = Record<string, { load: string; reps: string; note: string }>

export function TodayWorkoutPanel({ plan }: { plan: ClientPlan }) {
  const exercises = plan?.exercises ?? []

  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogs>({})
  const [sessionFinished, setSessionFinished] = useState(false)
  const [techniqueTip, setTechniqueTip] = useState('')

  const exerciseProgress = useMemo(
    () => (exercises.length ? Math.round((completedExercises.size / exercises.length) * 100) : 0),
    [completedExercises, exercises.length]
  )

  function toggleExercise(id: string) {
    setCompletedExercises((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
    <>
      <section className="mb-6 rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="badge badge-teal mb-3">
              <CalendarCheck className="h-3 w-3" />
              {plan?.programaNombre ?? 'Sin plan asignado'}
            </div>
            <h2 className="text-2xl font-black tracking-tight">{plan?.sessionNombre ?? 'Tu entrenador aún no te ha asignado un plan'}</h2>
            {exercises.length > 0 && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#94A3B8]">
                Prioriza técnica, registra cargas y deja comentario si algo molesta.
              </p>
            )}
          </div>
          {exercises.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-center">
              <div className="text-3xl font-black text-[#FF6A00]">{exerciseProgress}%</div>
              <div className="text-xs text-[#94A3B8]">completado</div>
            </div>
          )}
        </div>
        {sessionFinished && (
          <div className="mb-5 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm text-[#FF6A00]">
            Sesión finalizada. Tu coach verá el entrenamiento completado con tus registros.
          </div>
        )}
        {exercises.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Clock, label: 'Ejercicios', value: `${exercises.length}` },
              { icon: Flame, label: 'Series totales', value: `${exercises.reduce((sum, e) => sum + e.sets, 0)}` },
              { icon: Target, label: 'Objetivo', value: 'Fuerza' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/[0.04] p-3">
                <item.icon className="mb-2 h-4 w-4 text-[#FF6A00]" />
                <p className="text-xs text-[#94A3B8]">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {exercises.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Ejercicios de la sesión</h2>
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
                          onClick={() => setTechniqueTip(`${exercise.name}: pide a tu entrenador que te muestre la técnica en tu próxima sesión.`)}
                          className="flex min-h-8 items-center gap-1 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Ver técnica
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#94A3B8] sm:grid-cols-3">
                        <span>{exercise.sets} series</span>
                        <span>
                          {exercise.repsLabel}
                          {exercise.rpeRir ? ` · ${exercise.rpeRir}` : ''}
                        </span>
                        <span>{exercise.restSeconds}s descanso</span>
                      </div>
                      <ExerciseTimer key={exercise.id} exercise={exercise} />
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
      )}

      {techniqueTip && (
        <div className="glass-card mt-6 rounded-2xl p-5">
          <div className="mb-2 flex items-center gap-2">
            <Video className="h-4 w-4 text-[#FF6A00]" />
            <h2 className="text-sm font-semibold">Guía técnica</h2>
          </div>
          <p className="text-sm text-[#94A3B8]">{techniqueTip}</p>
        </div>
      )}
    </>
  )
}
