'use client'

import { useState } from 'react'
import { Calendar, Loader2, MapPin, Video, X } from 'lucide-react'
import { bookSession, cancelMySession } from '@/features/client/services/actions'
import type { AvailableSlot, MySession } from '@/features/client/types'

interface BookSessionPanelProps {
  initialSlots: AvailableSlot[]
  initialMySessions: MySession[]
}

export function BookSessionPanel({ initialSlots, initialMySessions }: BookSessionPanelProps) {
  const [slots, setSlots] = useState(initialSlots)
  const [mySessions, setMySessions] = useState(initialMySessions)
  const [modalidad, setModalidad] = useState<'presencial' | 'online'>('presencial')
  const [bookingSlot, setBookingSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleBook(slot: AvailableSlot) {
    setBookingSlot(slot.fechaHora)
    setError(null)

    const result = await bookSession({ fechaHora: slot.fechaHora, duracionMinutos: slot.duracionMinutos, modalidad })

    if (result.error) {
      setError(result.error)
      setBookingSlot(null)
      return
    }

    setSlots((current) => current.filter((s) => s.fechaHora !== slot.fechaHora))
    setMySessions((current) => [
      ...current,
      {
        id: `optimistic-${slot.fechaHora}`,
        titulo: 'Cita reservada',
        fechaHora: slot.fechaHora,
        duracionMinutos: slot.duracionMinutos,
        modalidad,
        estado: 'programada',
      },
    ])
    setBookingSlot(null)
  }

  function handleCancel(id: string) {
    setMySessions((current) => current.filter((s) => s.id !== id))
    cancelMySession(id)
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[#FF6A00]" />
        <h2 className="text-sm font-semibold">Reservar cita</h2>
      </div>

      {mySessions.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#475569]">Tus próximas citas</p>
          {mySessions.map((session) => {
            const date = new Date(session.fechaHora)
            return (
              <div key={session.id} className="flex items-center justify-between rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/5 px-3 py-2">
                <div className="text-xs text-white">
                  <p className="font-semibold">
                    {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                    {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[#94A3B8]">{session.modalidad === 'online' ? 'Online' : 'Presencial'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCancel(session.id)}
                  className="text-[#475569] hover:text-[#F87171]"
                  aria-label="Cancelar cita"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
          {error}
        </p>
      )}

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setModalidad('presencial')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${modalidad === 'presencial' ? 'bg-[#FF6A00] text-[#080C14]' : 'bg-white/[0.05] text-[#94A3B8]'}`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Presencial
        </button>
        <button
          type="button"
          onClick={() => setModalidad('online')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${modalidad === 'online' ? 'bg-[#FF6A00] text-[#080C14]' : 'bg-white/[0.05] text-[#94A3B8]'}`}
        >
          <Video className="h-3.5 w-3.5" />
          Online
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">Tu entrenador todavía no ha abierto huecos disponibles.</p>
      ) : (
        <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {slots.map((slot) => {
            const date = new Date(slot.fechaHora)
            const isBooking = bookingSlot === slot.fechaHora
            return (
              <button
                key={slot.fechaHora}
                type="button"
                onClick={() => handleBook(slot)}
                disabled={isBooking}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-2 text-left text-xs text-white hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 disabled:opacity-60"
              >
                {isBooking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <p className="font-semibold capitalize">
                      {date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[#94A3B8]">{date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
