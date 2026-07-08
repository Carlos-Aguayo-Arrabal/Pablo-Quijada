'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CopyCheck, Users } from 'lucide-react'
import type { ProgramClientOption } from '@/features/periodization/data'

interface ProgramAssignmentControlsProps {
  clients: ProgramClientOption[]
  initialAssignedClients: number
  initialAdherence: number
}

export function ProgramAssignmentControls({
  clients,
  initialAssignedClients,
  initialAdherence,
}: ProgramAssignmentControlsProps) {
  const [visibility, setVisibility] = useState<'siempre' | 'programada'>('siempre')
  const [permissions, setPermissions] = useState<'publico' | 'privado'>('privado')
  const [templateSaved, setTemplateSaved] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const assignedClients = initialAssignedClients + selectedClients.length
  const aggregateAdherence = useMemo(() => {
    if (selectedClients.length === 0) return initialAdherence
    return Math.round((initialAdherence + 82 + selectedClients.length * 3) / 2)
  }, [initialAdherence, selectedClients.length])

  function toggleClient(id: string) {
    setSelectedClients((current) => current.includes(id) ? current.filter((clientId) => clientId !== id) : [...current, id])
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Asignación y permisos</h2>
          <p className="mt-1 text-xs text-[#94A3B8]">{assignedClients} clientes · {aggregateAdherence}% adherencia agregada</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setTemplateSaved(true)} className="btn-secondary px-4 py-2 text-xs">
            <CopyCheck className="h-4 w-4" />
            {templateSaved ? 'Plantilla guardada' : 'Guardar como plantilla'}
          </button>
          <button type="button" onClick={() => setIsAssigning((value) => !value)} className="btn-primary px-4 py-2 text-xs">
            <Users className="h-4 w-4" />
            Asignar Programa
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Visibilidad</span>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} className="input-field">
            <option className="bg-[#0D1117]" value="siempre">Siempre</option>
            <option className="bg-[#0D1117]" value="programada">Programada</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Permisos</span>
          <select value={permissions} onChange={(event) => setPermissions(event.target.value as typeof permissions)} className="input-field">
            <option className="bg-[#0D1117]" value="privado">Privado</option>
            <option className="bg-[#0D1117]" value="publico">Público</option>
          </select>
        </label>
      </div>

      {visibility === 'programada' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-4 py-3 text-xs font-semibold text-[#FFB000]">
          <CalendarClock className="h-4 w-4" />
          Publicación programada para el próximo lunes.
        </div>
      )}

      {isAssigning && (
        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#FF6A00]">Clientes</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <label key={client.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-[#080C14]/60 px-3 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                  className="h-4 w-4 accent-[#FF6A00]"
                />
                {client.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
