'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { createSession } from '@/features/agenda/services/actions'
import type { SessionType } from '@/features/agenda/data'

interface SessionFormProps {
  clients: { id: string; name: string }[]
  sessionTypes: SessionType[]
  onCreated: () => void
}

export function SessionForm({ clients, sessionTypes, onCreated }: SessionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [clienteId, setClienteId] = useState(clients[0]?.id ?? '')
  const [tipoSesionId, setTipoSesionId] = useState(sessionTypes[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [modalidad, setModalidad] = useState<'presencial' | 'online'>('presencial')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('10:00')
  const [duracion, setDuracion] = useState(60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!clienteId) {
      setError('Selecciona un cliente')
      return
    }
    if (!fecha) {
      setError('Selecciona una fecha')
      return
    }

    setIsSubmitting(true)
    const fechaHora = new Date(`${fecha}T${hora}:00`).toISOString()

    const result = await createSession({
      clienteId,
      tipoSesionId: tipoSesionId || undefined,
      titulo: titulo || 'Sesión',
      modalidad,
      fechaHora,
      duracionMinutos: duracion,
    })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setTitulo('')
    setFecha('')
    setIsSubmitting(false)
    setIsOpen(false)
    onCreated()
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn-primary w-fit px-4 py-2 text-xs">
        <Plus className="h-4 w-4" />
        Nueva cita
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      {error && (
        <p className="mb-3 rounded-lg border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Cliente</span>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="input-field py-2 text-xs">
            {clients.length === 0 && <option value="">Sin clientes</option>}
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0D1117]">
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Tipo de sesión</span>
          <select value={tipoSesionId} onChange={(e) => setTipoSesionId(e.target.value)} className="input-field py-2 text-xs">
            <option value="" className="bg-[#0D1117]">Sin tipo</option>
            {sessionTypes.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#0D1117]">
                {t.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Título</span>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-field py-2 text-xs" placeholder="Ej: Sesión presencial" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Modalidad</span>
          <select value={modalidad} onChange={(e) => setModalidad(e.target.value as 'presencial' | 'online')} className="input-field py-2 text-xs">
            <option value="presencial" className="bg-[#0D1117]">Presencial</option>
            <option value="online" className="bg-[#0D1117]">Online</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="input-field py-2 text-xs" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Hora</span>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="input-field py-2 text-xs" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Duración (min)</span>
          <input
            type="number"
            min={5}
            value={duracion}
            onChange={(e) => setDuracion(Number(e.target.value))}
            className="input-field py-2 text-xs"
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 text-xs disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Guardar cita
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary px-4 py-2 text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}
