'use client'

import { useState } from 'react'
import { ChevronDown, Copy, Link2, Plus, Trash2 } from 'lucide-react'
import {
  adherenceTone,
  initialBuilderWorkouts,
  type BuilderBlock,
  type BuilderExercise,
  type BuilderWorkout,
  type PrescriptionTemplate,
} from '@/features/periodization/data'
import { cn } from '@/shared/lib/utils'

interface WeeklyWorkoutBuilderProps {
  prescriptions: PrescriptionTemplate[]
}

const toneClass = {
  red: 'bg-[#F87171]',
  yellow: 'bg-[#FFB000]',
  green: 'bg-[#FF6A00]',
}

export function WeeklyWorkoutBuilder({ prescriptions }: WeeklyWorkoutBuilderProps) {
  const [workouts, setWorkouts] = useState(initialBuilderWorkouts)

  function updateWorkout(id: string, patch: Partial<BuilderWorkout>) {
    setWorkouts((current) => current.map((workout) => workout.id === id ? { ...workout, ...patch } : workout))
  }

  function addWorkout(day: string) {
    setWorkouts((current) => current.map((workout) => workout.day === day ? {
      ...workout,
      name: 'Nuevo Workout',
      timeSlot: '09:00',
      clients: 0,
      adherence: 0,
      blocks: workout.blocks.length ? workout.blocks : [],
    } : workout))
  }

  function addBlock(workoutId: string) {
    setWorkouts((current) => current.map((workout) => {
      if (workout.id !== workoutId) return workout
      const block: BuilderBlock = {
        id: `block-${Date.now()}`,
        name: 'Nuevo bloque',
        type: 'fuerza',
        collapsed: false,
        exercises: [
          { id: `exercise-${Date.now()}`, name: 'Nuevo ejercicio', supersetLabel: 'A1', sets: 3, reps: '10', rpeRir: 'RPE 7', restSeconds: 90 },
        ],
      }
      return { ...workout, blocks: [...workout.blocks, block] }
    }))
  }

  function updateBlock(workoutId: string, blockId: string, patch: Partial<BuilderBlock>) {
    setWorkouts((current) => current.map((workout) => workout.id === workoutId ? {
      ...workout,
      blocks: workout.blocks.map((block) => block.id === blockId ? { ...block, ...patch } : block),
    } : workout))
  }

  function cloneBlock(workoutId: string, blockId: string) {
    setWorkouts((current) => current.map((workout) => {
      if (workout.id !== workoutId) return workout
      const source = workout.blocks.find((block) => block.id === blockId)
      if (!source) return workout
      return {
        ...workout,
        blocks: [...workout.blocks, { ...source, id: `block-${Date.now()}`, name: `${source.name} copia`, collapsed: false }],
      }
    }))
  }

  function deleteBlock(workoutId: string, blockId: string) {
    setWorkouts((current) => current.map((workout) => workout.id === workoutId ? {
      ...workout,
      blocks: workout.blocks.filter((block) => block.id !== blockId),
    } : workout))
  }

  function updateExercise(workoutId: string, blockId: string, exerciseId: string, patch: Partial<BuilderExercise>) {
    setWorkouts((current) => current.map((workout) => workout.id === workoutId ? {
      ...workout,
      blocks: workout.blocks.map((block) => block.id === blockId ? {
        ...block,
        exercises: block.exercises.map((exercise) => exercise.id === exerciseId ? { ...exercise, ...patch } : exercise),
      } : block),
    } : workout))
  }

  function applyPrescription(workoutId: string, blockId: string, exerciseId: string, prescription: PrescriptionTemplate) {
    updateExercise(workoutId, blockId, exerciseId, {
      sets: prescription.sets,
      reps: prescription.reps,
      rpeRir: prescription.rpeRir,
      restSeconds: prescription.restSeconds,
    })
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-white">Constructor de semana</h2>
        <p className="mt-1 text-xs text-[#94A3B8]">Bloques, ejercicios y prescripciones por día.</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1320px] grid-cols-7 gap-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#FF6A00]">{workout.day}</p>

              <div className="rounded-xl border border-white/[0.08] bg-[#111B26] p-3">
                <input
                  value={workout.name}
                  onChange={(event) => updateWorkout(workout.id, { name: event.target.value })}
                  className="w-full bg-transparent text-sm font-black text-white outline-none"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    value={workout.timeSlot}
                    onChange={(event) => updateWorkout(workout.id, { timeSlot: event.target.value })}
                    className="input-field px-2 py-1.5 text-xs"
                  />
                  <div className="rounded-lg bg-white/[0.04] px-2 py-1.5 text-xs text-[#94A3B8]">
                    {workout.clients} clientes
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[#94A3B8]">
                  <span className={cn('h-2.5 w-2.5 rounded-full', toneClass[adherenceTone(workout.adherence)])} />
                  {workout.adherence}% adherencia
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {workout.blocks.map((block) => (
                  <div key={block.id} className="group rounded-xl border border-white/[0.07] bg-white/[0.03]">
                    <div className="flex items-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => updateBlock(workout.id, block.id, { collapsed: !block.collapsed })}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
                      >
                        <ChevronDown className={cn('h-4 w-4 transition', block.collapsed && '-rotate-90')} />
                      </button>
                      <input
                        value={block.name}
                        onChange={(event) => updateBlock(workout.id, block.id, { name: event.target.value })}
                        className="min-w-0 flex-1 bg-transparent text-xs font-bold text-white outline-none"
                      />
                      <span className="rounded-full bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6A00]">{block.type}</span>
                      <div className="flex opacity-0 transition group-hover:opacity-100">
                        <button type="button" onClick={() => cloneBlock(workout.id, block.id)} className="p-1 text-[#94A3B8] hover:text-[#FF6A00]"><Copy className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => deleteBlock(workout.id, block.id)} className="p-1 text-[#94A3B8] hover:text-[#F87171]"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>

                    {!block.collapsed && (
                      <div className="space-y-2 border-t border-white/[0.06] p-2">
                        {block.exercises.map((exercise) => (
                          <div key={exercise.id} className="rounded-lg bg-[#080C14]/60 p-2">
                            <div className="mb-2 flex items-center gap-2">
                              <input
                                value={exercise.supersetLabel}
                                onChange={(event) => updateExercise(workout.id, block.id, exercise.id, { supersetLabel: event.target.value })}
                                className="w-10 rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1 text-xs font-black text-[#FFB000] outline-none"
                              />
                              <input
                                value={exercise.name}
                                onChange={(event) => updateExercise(workout.id, block.id, exercise.id, { name: event.target.value })}
                                className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-white outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateExercise(workout.id, block.id, exercise.id, { linked: !exercise.linked })}
                                className={cn('rounded-md p-1', exercise.linked ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'text-[#64748B] hover:text-[#FF6A00]')}
                              >
                                <Link2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <SmallField value={exercise.sets} onChange={(value) => updateExercise(workout.id, block.id, exercise.id, { sets: Number(value) || 1 })} />
                              <SmallField value={exercise.reps} onChange={(value) => updateExercise(workout.id, block.id, exercise.id, { reps: value })} />
                              <SmallField value={exercise.restSeconds} onChange={(value) => updateExercise(workout.id, block.id, exercise.id, { restSeconds: Number(value) || 0 })} />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1">
                              {prescriptions.slice(0, 3).map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => applyPrescription(workout.id, block.id, exercise.id, item)}
                                  className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-[#94A3B8] hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]"
                                >
                                  {item.objective}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => addBlock(workout.id)} className="btn-secondary justify-center px-3 py-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo bloque
                </button>
                <button type="button" onClick={() => addWorkout(workout.day)} className="btn-secondary justify-center px-3 py-2 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo Workout
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SmallField({ value, onChange }: { value: string | number | null; onChange: (value: string) => void }) {
  return (
    <input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1 text-center text-[11px] font-bold text-white outline-none focus:border-[#FF6A00]"
    />
  )
}
