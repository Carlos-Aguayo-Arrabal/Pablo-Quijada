'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { PrescriptionTemplate } from '@/features/periodization/data'

interface PrescriptionsPanelProps {
  prescriptions: PrescriptionTemplate[]
}

export function PrescriptionsPanel({ prescriptions }: PrescriptionsPanelProps) {
  const [items, setItems] = useState(prescriptions)
  const [name, setName] = useState('Nueva prescripción')
  const [objective, setObjective] = useState<PrescriptionTemplate['objective']>('Fuerza')

  function addPrescription() {
    setItems((current) => [
      ...current,
      {
        id: `prescription-${Date.now()}`,
        name,
        objective,
        sets: 3,
        reps: '8',
        rpeRir: 'RPE 7',
        restSeconds: 90,
      },
    ])
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Prescripciones</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">Plantillas reutilizables por objetivo.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} className="input-field px-3 py-2 text-xs" />
          <select value={objective} onChange={(event) => setObjective(event.target.value as PrescriptionTemplate['objective'])} className="input-field px-3 py-2 text-xs">
            {['Fuerza', 'Hipertrofia', 'Descarga', 'Potencia', 'Acondicionamiento'].map((item) => (
              <option key={item} className="bg-[#0D1117]">{item}</option>
            ))}
          </select>
          <button type="button" onClick={addPrescription} className="btn-primary justify-center px-4 py-2 text-xs">
            <Plus className="h-4 w-4" />
            Crear
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <span className="rounded-full bg-[#FF6A00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF6A00]">{item.objective}</span>
            <h3 className="mt-3 text-sm font-black text-white">{item.name}</h3>
            <p className="mt-1 text-xs text-[#94A3B8]">{item.sets}x{item.reps} · {item.rpeRir} · {item.restSeconds}s</p>
          </article>
        ))}
      </div>
    </section>
  )
}
