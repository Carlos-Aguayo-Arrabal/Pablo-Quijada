'use client'

import { useState } from 'react'
import { PhaseTimeline } from '@/features/workouts/components/phase-timeline'
import { MonthlyProgramCalendar } from '@/features/periodization/components/monthly-program-calendar'
import { PrescriptionsPanel } from '@/features/periodization/components/prescriptions-panel'
import { ProgramAssignmentControls } from '@/features/periodization/components/program-assignment-controls'
import { WeeklyWorkoutBuilder } from '@/features/periodization/components/weekly-workout-builder'
import {
  prescriptionTemplates,
  type ProgramClientOption,
} from '@/features/periodization/data'
import type { ProgramWorkspace } from '@/features/periodization/services/actions'

interface ProgramDetailWorkspaceProps {
  planId: string
  workspace: ProgramWorkspace
  clients: ProgramClientOption[]
  initialAssignedClients: number
  initialAdherence: number
}

export function ProgramDetailWorkspace({
  planId,
  workspace,
  clients,
  initialAssignedClients,
  initialAdherence,
}: ProgramDetailWorkspaceProps) {
  const [syncedWorkspace, setSyncedWorkspace] = useState(workspace)
  const [phases, setPhases] = useState(workspace.phases)

  // Cuando una server action persiste un cambio y revalida la ruta, `workspace`
  // llega con datos frescos de Supabase (ids reales de fases/semanas). Detectar el
  // cambio de referencia durante el render y resincronizar ahí (en vez de en un
  // efecto) evita el doble render que provoca `setState` síncrono dentro de un
  // `useEffect`.
  if (workspace !== syncedWorkspace) {
    setSyncedWorkspace(workspace)
    setPhases(workspace.phases)
  }

  function handlePhasesChange(next: { id: string; name: string; durationWeeks: number }[]) {
    setPhases(next.map((phase) => ({
      ...phase,
      weeks: phases.find((existing) => existing.id === phase.id)?.weeks ?? [],
    })))
  }

  return (
    <div className="mb-6 space-y-6">
      <ProgramAssignmentControls
        planId={planId}
        programId={workspace.programId}
        clients={clients}
        initialAssignedClients={initialAssignedClients}
        initialAdherence={initialAdherence}
      />
      <PhaseTimeline
        initialPhases={workspace.phases}
        phases={phases}
        onPhasesChange={handlePhasesChange}
        planId={planId}
        programId={workspace.programId}
      />
      <MonthlyProgramCalendar planId={planId} programId={workspace.programId} phases={phases} workoutsByWeek={workspace.workoutsByWeek} />
      <PrescriptionsPanel prescriptions={prescriptionTemplates} />
      <WeeklyWorkoutBuilder prescriptions={prescriptionTemplates} />
    </div>
  )
}
