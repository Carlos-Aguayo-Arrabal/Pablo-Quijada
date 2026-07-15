'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, X } from 'lucide-react'
import { updateClientBioData } from '@/features/clients/services/actions'
import type { ClientRecord } from '@/features/clients/data'

interface EditClientBioModalProps {
  client: ClientRecord
  onClose: () => void
}

export function EditClientBioModal({ client, onClose }: EditClientBioModalProps) {
  const router = useRouter()
  const [level, setLevel] = useState(client.level ?? '')
  const [age, setAge] = useState(client.age ? String(client.age) : '')
  const [maxHeartRate, setMaxHeartRate] = useState(client.maxHeartRate ? String(client.maxHeartRate) : '')
  const [height, setHeight] = useState(client.height ? String(client.height) : '')
  const [weight, setWeight] = useState(client.weight === '—' ? '' : client.weight)
  const [goal, setGoal] = useState(client.goal)
  const [injuries, setInjuries] = useState(client.injuries)
  const [notes, setNotes] = useState(client.notes)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSave() {
    setError(null)
    setIsSubmitting(true)

    const result = await updateClientBioData(client.id, {
      level: level ? (level as 'Iniciado' | 'Intermedio' | 'Avanzado') : null,
      age: age ? Number.parseInt(age, 10) : null,
      maxHeartRate: maxHeartRate ? Number.parseInt(maxHeartRate, 10) : null,
      height: height ? Number.parseInt(height, 10) : null,
      weight,
      goal,
      injuries,
      notes,
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111B26] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-white">Editar datos de {client.name}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="col-span-2 block sm:col-span-1">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Nivel</span>
              <select value={level} onChange={(event) => setLevel(event.target.value)} className="input-field">
                <option value="" className="bg-[#0D1117]">Sin definir</option>
                <option value="Iniciado" className="bg-[#0D1117]">Iniciado</option>
                <option value="Intermedio" className="bg-[#0D1117]">Intermedio</option>
                <option value="Avanzado" className="bg-[#0D1117]">Avanzado</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Edad</span>
              <input value={age} onChange={(event) => setAge(event.target.value)} type="number" className="input-field" placeholder="27" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">FC máx (ppm)</span>
              <input value={maxHeartRate} onChange={(event) => setMaxHeartRate(event.target.value)} type="number" className="input-field" placeholder="194" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs text-[#94A3B8]">Altura (cm)</span>
              <input value={height} onChange={(event) => setHeight(event.target.value)} type="number" className="input-field" placeholder="178" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Peso</span>
            <input value={weight} onChange={(event) => setWeight(event.target.value)} className="input-field" placeholder="Ej: 74 kg" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Objetivos</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="input-field min-h-20 resize-none" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Lesiones / patologías</span>
            <textarea value={injuries} onChange={(event) => setInjuries(event.target.value)} className="input-field min-h-20 resize-none" placeholder="Ninguna registrada" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Observaciones</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="input-field min-h-20 resize-none" />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="btn-primary mt-5 w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSubmitting ? 'Guardando...' : 'Guardar datos'}
        </button>
      </div>
    </div>
  )
}
