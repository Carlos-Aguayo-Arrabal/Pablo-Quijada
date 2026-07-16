'use client'

import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { ClientPlanExercise } from '@/features/client/types'

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getTotalSeconds(exercise: ClientPlanExercise) {
  const work = exercise.workSeconds * exercise.sets
  const rests = exercise.restSeconds * Math.max(exercise.sets - 1, 0)
  return work + rests
}

function getPhase(exercise: ClientPlanExercise, elapsedSeconds: number) {
  const setBlockSeconds = exercise.workSeconds + exercise.restSeconds

  for (let set = 1; set <= exercise.sets; set += 1) {
    const setStart = (set - 1) * setBlockSeconds
    const workEnd = setStart + exercise.workSeconds
    const restEnd = workEnd + (set < exercise.sets ? exercise.restSeconds : 0)

    if (elapsedSeconds < workEnd) return { set, label: 'trabajo' }
    if (set < exercise.sets && elapsedSeconds < restEnd) return { set, label: 'descanso' }
  }

  return { set: exercise.sets, label: 'completado' }
}

export function ExerciseTimer({ exercise }: { exercise: ClientPlanExercise }) {
  const totalSeconds = getTotalSeconds(exercise)
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
  const phase = getPhase(exercise, elapsedSeconds)
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
            <span className="text-2xl font-black text-brand">{formatTime(remainingSeconds)}</span>
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
            className="flex h-11 min-w-24 items-center justify-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-[#080C14] disabled:opacity-50"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-[#94A3B8] hover:text-white"
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
        Total estimado: {formatTime(totalSeconds)} · Trabajo: {formatTime(exercise.workSeconds)} por serie · Descanso: {formatTime(exercise.restSeconds)}
      </p>
    </div>
  )
}
