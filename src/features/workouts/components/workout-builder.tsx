'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Plus, Save, Trash2 } from 'lucide-react'
import { estimateExerciseSeconds, formatDuration, type WorkoutExercise } from '@/features/workouts/data'
import { createWorkoutPlan } from '@/features/workouts/services/actions'

const initialExercises: WorkoutExercise[] = [
  { name: 'Sentadilla goblet', sets: 4, reps: '10', rest: 90, rpe: '7', tempo: '3-1-1', notes: 'Controla bajada y torso estable.' },
  { name: 'Press banca con mancuernas', sets: 4, reps: '8', rest: 120, rpe: '8', tempo: '2-0-1', notes: 'No bloquees codos.' },
  { name: 'Plancha frontal', sets: 3, reps: '40s', rest: 60, rpe: '7', tempo: 'isométrico', notes: 'Respira y evita hundir cadera.' },
]

export function WorkoutBuilder() {
  const router = useRouter()
  const [title, setTitle] = useState('Fuerza torso + core')
  const [category, setCategory] = useState('Fuerza')
  const [client, setClient] = useState('Laura Martin')
  const [exercises, setExercises] = useState(initialExercises)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const totalSeconds = useMemo(() => exercises.reduce((sum, exercise) => sum + estimateExerciseSeconds(exercise), 0), [exercises])

  function updateExercise(index: number, patch: Partial<WorkoutExercise>) {
    setExercises((current) => current.map((exercise, itemIndex) => itemIndex === index ? { ...exercise, ...patch } : exercise))
  }

  function addExercise() {
    setExercises((current) => [...current, { name: 'Nuevo ejercicio', sets: 3, reps: '10', rest: 90, rpe: '7', tempo: '2-0-1', notes: 'Añade indicaciones técnicas.' }])
  }

  function removeExercise(index: number) {
    setExercises((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function savePlan() {
    setError(null)
    setIsSaving(true)

    const result = await createWorkoutPlan({ title, category, exercises })

    if (result.error) {
      setError(result.error)
      setIsSaving(false)
      return
    }

    setSaved(true)
    setIsSaving(false)
    router.push('/dashboard/workouts')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <section className="glass-card rounded-2xl p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Crear rutina</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">Define ejercicios y calcula el tiempo con series, reps y descanso.</p>
          </div>
          <button type="button" onClick={savePlan} disabled={isSaving} className="btn-primary w-fit px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar rutina'}
          </button>
        </div>

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm font-semibold text-[#FF6A00]">
            <CheckCircle2 className="h-4 w-4" />
            Rutina guardada.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Nombre</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Categoría</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field">
              <option className="bg-[#0D1117]">Fuerza</option>
              <option className="bg-[#0D1117]">Hipertrofia</option>
              <option className="bg-[#0D1117]">Pérdida de grasa</option>
              <option className="bg-[#0D1117]">Readaptación</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Asignar a</span>
            <select value={client} onChange={(event) => setClient(event.target.value)} className="input-field">
              <option className="bg-[#0D1117]">Laura Martin</option>
              <option className="bg-[#0D1117]">Carlos Ruiz</option>
              <option className="bg-[#0D1117]">Marta Vega</option>
              <option className="bg-[#0D1117]">Javier Molina</option>
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {exercises.map((exercise, index) => (
            <div key={`${exercise.name}-${index}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF6A00]">Ejercicio {index + 1}</p>
                  <input value={exercise.name} onChange={(event) => updateExercise(index, { name: event.target.value })} className="mt-1 w-full bg-transparent text-lg font-black text-white outline-none" />
                </div>
                <button type="button" onClick={() => removeExercise(index)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#F87171] hover:bg-[#F87171]/10" aria-label="Eliminar ejercicio">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-5">
                <NumberField label="Series" value={exercise.sets} onChange={(value) => updateExercise(index, { sets: value })} />
                <TextField label="Reps" value={exercise.reps} onChange={(value) => updateExercise(index, { reps: value })} />
                <NumberField label="Descanso s" value={exercise.rest} onChange={(value) => updateExercise(index, { rest: value })} />
                <TextField label="RPE" value={exercise.rpe} onChange={(value) => updateExercise(index, { rpe: value })} />
                <TextField label="Tempo" value={exercise.tempo} onChange={(value) => updateExercise(index, { tempo: value })} />
              </div>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">Notas técnicas</span>
                <input value={exercise.notes} onChange={(event) => updateExercise(index, { notes: event.target.value })} className="input-field" />
              </label>

              <p className="mt-3 text-xs font-semibold text-[#FFB000]">
                Tiempo estimado: {formatDuration(estimateExerciseSeconds(exercise))}
              </p>
            </div>
          ))}
        </div>

        <button type="button" onClick={addExercise} className="btn-secondary mt-5 px-4 py-2 text-sm">
          <Plus className="h-4 w-4" />
          Añadir ejercicio
        </button>
      </section>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6A00]">Vista previa</p>
          <h2 className="mt-3 text-2xl font-black text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{category} · asignado a {client}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <PreviewMetric label="Ejercicios" value={String(exercises.length)} />
            <PreviewMetric label="Duración" value={formatDuration(totalSeconds)} />
            <PreviewMetric label="Series totales" value={String(exercises.reduce((sum, item) => sum + item.sets, 0))} />
            <PreviewMetric label="Descanso medio" value={`${Math.round(exercises.reduce((sum, item) => sum + item.rest, 0) / exercises.length)}s`} />
          </div>
          <Link href="/dashboard/workouts" className="btn-primary mt-5 w-full justify-center">
            <Copy className="h-4 w-4" />
            Usar como plantilla
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white">Cómo se calcula el temporizador</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
            Cada ejercicio suma el tiempo estimado de trabajo por serie y los descansos entre series. Este mismo dato alimenta el temporizador del portal cliente.
          </p>
        </div>
      </aside>
    </div>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#94A3B8]">{label}</span>
      <input value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="input-field" type="number" min={0} />
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#94A3B8]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="input-field" />
    </label>
  )
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#0D1117]/70 p-3">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  )
}
