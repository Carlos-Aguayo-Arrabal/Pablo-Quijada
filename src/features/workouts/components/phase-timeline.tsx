'use client'

import { useMemo, useState, useTransition, type CSSProperties } from 'react'
import { Check, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { createPhaseAction, updatePhaseAction } from '@/features/periodization/services/actions'

export interface PhaseTimelineItem {
  id: string
  name: string
  durationWeeks: number
}

interface PhaseTimelineProps {
  initialPhases: PhaseTimelineItem[]
  phases?: PhaseTimelineItem[]
  onPhasesChange?: (phases: PhaseTimelineItem[]) => void
  planId?: string
  programId?: string
}

export function PhaseTimeline({ initialPhases, phases: controlledPhases, onPhasesChange, planId, programId }: PhaseTimelineProps) {
  const [localPhases, setLocalPhases] = useState(initialPhases)
  const phases = controlledPhases ?? localPhases
  const [editingId, setEditingId] = useState<string | null>(initialPhases[0]?.id ?? null)
  const editingPhase = phases.find((phase) => phase.id === editingId) ?? null
  const totalWeeks = useMemo(() => phases.reduce((sum, phase) => sum + phase.durationWeeks, 0), [phases])
  const [isPending, startTransition] = useTransition()
  const canPersist = Boolean(planId && programId && !programId.startsWith('demo-'))

  function setPhases(nextPhases: PhaseTimelineItem[]) {
    if (onPhasesChange) {
      onPhasesChange(nextPhases)
      return
    }

    setLocalPhases(nextPhases)
  }

  function updatePhase(id: string, patch: Partial<PhaseTimelineItem>) {
    setPhases(phases.map((phase) => phase.id === id ? { ...phase, ...patch } : phase))

    if (canPersist && planId && programId) {
      startTransition(() => {
        void updatePhaseAction(planId, id, {
          nombre: patch.name,
          duracionSemanas: patch.durationWeeks,
        })
      })
    }
  }

  function addPhase() {
    const nextPhase: PhaseTimelineItem = {
      id: `phase-${Date.now()}`,
      name: `Fase ${phases.length + 1}`,
      durationWeeks: 1,
    }

    setPhases([...phases, nextPhase])
    setEditingId(nextPhase.id)

    if (canPersist && planId && programId) {
      startTransition(() => {
        void createPhaseAction(planId, programId)
      })
    }
  }

  return (
    <section className="glass-card mb-6 rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Periodización</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">{phases.length} fases · {totalWeeks} semanas{isPending ? ' · guardando…' : ''}</p>
        </div>
        <button type="button" onClick={addPhase} className="btn-primary w-fit px-4 py-2 text-xs">
          <Plus className="h-4 w-4" />
          Nueva fase
        </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[640px] grid-cols-[repeat(var(--phase-count),minmax(140px,1fr))_120px]" style={{ '--phase-count': phases.length } as CSSProperties}>
          {phases.map((phase, index) => {
            const isActive = phase.id === editingId
            const isLast = index === phases.length - 1

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setEditingId(phase.id)}
                className="group relative flex min-h-24 flex-col items-center px-2 text-center"
              >
                <span className="absolute left-1/2 top-4 h-px w-full bg-white/[0.12]" aria-hidden="true" />
                {isLast && <span className="absolute right-0 top-4 h-px w-1/2 bg-[#111B26]" aria-hidden="true" />}
                <span className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition',
                  isActive
                    ? 'border-[#FF6A00] bg-[#FF6A00] text-[#0D1117] shadow-lg shadow-[#FF6A00]/20'
                    : 'border-white/[0.16] bg-[#111B26] text-[#94A3B8] group-hover:border-[#FF6A00]/60 group-hover:text-[#FF6A00]'
                )}>
                  {isActive ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="mt-3 line-clamp-2 text-sm font-black text-white">
                  {phase.name} <span className="text-[#FFB000]">— {phase.durationWeeks} semanas</span>
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={addPhase}
            className="relative flex min-h-24 flex-col items-center px-2 text-center text-[#94A3B8] transition hover:text-[#FF6A00]"
          >
            <span className="absolute left-0 top-4 h-px w-1/2 bg-white/[0.12]" aria-hidden="true" />
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#FF6A00]/50 bg-[#FF6A00]/10 text-[#FF6A00]">
              <Plus className="h-4 w-4" />
            </span>
            <span className="mt-3 text-sm font-black">Nueva fase</span>
          </button>
        </div>
      </div>

      {editingPhase && (
        <div className="mt-4 grid gap-3 rounded-2xl border border-[#FF6A00]/20 bg-[#FF6A00]/[0.04] p-4 sm:grid-cols-[1fr_180px]">
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Nombre de fase</span>
            <input
              value={editingPhase.name}
              onChange={(event) => updatePhase(editingPhase.id, { name: event.target.value })}
              className="input-field"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Duración</span>
            <input
              value={editingPhase.durationWeeks}
              onChange={(event) => updatePhase(editingPhase.id, { durationWeeks: Math.max(1, Number(event.target.value) || 1) })}
              className="input-field"
              type="number"
              min={1}
            />
          </label>
        </div>
      )}
    </section>
  )
}
