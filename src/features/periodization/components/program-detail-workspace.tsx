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
  type ProgramPhaseView,
} from '@/features/periodization/data'

interface ProgramDetailWorkspaceProps {
  initialPhases: ProgramPhaseView[]
  clients: ProgramClientOption[]
  initialAssignedClients: number
  initialAdherence: number
}

export function ProgramDetailWorkspace({
  initialPhases,
  clients,
  initialAssignedClients,
  initialAdherence,
}: ProgramDetailWorkspaceProps) {
  const [phases, setPhases] = useState(initialPhases)

  return (
    <div className="mb-6 space-y-6">
      <ProgramAssignmentControls
        clients={clients}
        initialAssignedClients={initialAssignedClients}
        initialAdherence={initialAdherence}
      />
      <PhaseTimeline initialPhases={initialPhases} phases={phases} onPhasesChange={setPhases} />
      <MonthlyProgramCalendar phases={phases} />
      <PrescriptionsPanel prescriptions={prescriptionTemplates} />
      <WeeklyWorkoutBuilder prescriptions={prescriptionTemplates} />
    </div>
  )
}
