'use client'

import { useState, useTransition } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { deleteAvailabilitySlot, upsertAvailabilitySlot } from '@/features/agenda/services/actions'
import { DIAS_SEMANA, type AvailabilitySlot } from '@/features/agenda/data'

interface NewSlotDraft {
  diaSemana: number
  horaInicio: string
  horaFin: string
  duracionSesionMinutos: number
}

export function AvailabilityManager({ initialSlots }: { initialSlots: AvailabilitySlot[] }) {
  const [slots, setSlots] = useState(initialSlots)
  const [draftDay, setDraftDay] = useState<number | null>(null)
  const [draft, setDraft] = useState<NewSlotDraft>({ diaSemana: 0, horaInicio: '09:00', horaFin: '13:00', duracionSesionMinutos: 60 })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function openDraft(diaSemana: number) {
    setDraftDay(diaSemana)
    setDraft({ diaSemana, horaInicio: '09:00', horaFin: '13:00', duracionSesionMinutos: 60 })
    setError(null)
  }

  async function handleSave() {
    if (draft.horaFin <= draft.horaInicio) {
      setError('La hora de fin debe ser posterior a la de inicio')
      return
    }

    const result = await upsertAvailabilitySlot({ ...draft, activo: true })
    if (result.error) {
      setError(result.error)
      return
    }

    setSlots((current) => [
      ...current,
      { id: `pending-${Date.now()}`, ...draft, activo: true },
    ])
    setDraftDay(null)
  }

  function toggleActive(slot: AvailabilitySlot) {
    setSlots((current) => current.map((s) => (s.id === slot.id ? { ...s, activo: !s.activo } : s)))
    startTransition(() => {
      upsertAvailabilitySlot({
        id: slot.id,
        diaSemana: slot.diaSemana,
        horaInicio: slot.horaInicio,
        horaFin: slot.horaFin,
        duracionSesionMinutos: slot.duracionSesionMinutos,
        activo: !slot.activo,
      })
    })
  }

  function handleDelete(id: string) {
    setSlots((current) => current.filter((s) => s.id !== id))
    startTransition(() => {
      deleteAvailabilitySlot(id)
    })
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5">
        <h2 className="text-sm font-bold text-white">Horario de citas</h2>
        <p className="text-xs text-[#94A3B8]">Define las franjas en las que tus clientes pueden reservar cita.</p>
      </div>

      <div className="space-y-3">
        {DIAS_SEMANA.map((label, diaSemana) => {
          const daySlots = slots.filter((s) => s.diaSemana === diaSemana)
          const isDrafting = draftDay === diaSemana

          return (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{label}</p>
                <button
                  type="button"
                  onClick={() => openDraft(diaSemana)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:text-[#FFB000]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir franja
                </button>
              </div>

              {daySlots.length === 0 && !isDrafting && (
                <p className="text-xs text-[#475569]">Sin franjas definidas</p>
              )}

              <div className="space-y-2">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
                    <span className={cn('text-xs', slot.activo ? 'text-white' : 'text-[#475569] line-through')}>
                      {slot.horaInicio.slice(0, 5)} – {slot.horaFin.slice(0, 5)} · sesiones de {slot.duracionSesionMinutos} min
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(slot)}
                        disabled={isPending}
                        className={cn(
                          'text-[11px] font-semibold disabled:opacity-50',
                          slot.activo ? 'text-[#4ADE80]' : 'text-[#475569]'
                        )}
                      >
                        {slot.activo ? 'Activa' : 'Inactiva'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        disabled={isPending}
                        className="text-[#475569] hover:text-[#F87171] disabled:opacity-50"
                        aria-label="Eliminar franja"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isDrafting && (
                <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                  {error && <p className="mb-2 text-xs text-[#F87171]">{error}</p>}
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] text-[#475569]">Inicio</span>
                      <input
                        type="time"
                        value={draft.horaInicio}
                        onChange={(e) => setDraft((d) => ({ ...d, horaInicio: e.target.value }))}
                        className="input-field py-1.5 text-xs"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] text-[#475569]">Fin</span>
                      <input
                        type="time"
                        value={draft.horaFin}
                        onChange={(e) => setDraft((d) => ({ ...d, horaFin: e.target.value }))}
                        className="input-field py-1.5 text-xs"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] text-[#475569]">Duración sesión (min)</span>
                      <input
                        type="number"
                        min={5}
                        value={draft.duracionSesionMinutos}
                        onChange={(e) => setDraft((d) => ({ ...d, duracionSesionMinutos: Number(e.target.value) }))}
                        className="input-field py-1.5 text-xs"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSave} className="btn-primary px-3 py-1.5 text-xs">Guardar</button>
                      <button type="button" onClick={() => setDraftDay(null)} className="btn-secondary px-3 py-1.5 text-xs">Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isPending && <Loader2 className="mt-3 h-4 w-4 animate-spin text-[#94A3B8]" />}
    </section>
  )
}
