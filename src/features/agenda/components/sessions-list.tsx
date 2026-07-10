'use client'

import { useState, useTransition } from 'react'
import { Calendar, Check, MapPin, Users, Video, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { listSessions, updateSessionStatus } from '@/features/agenda/services/actions'
import { SessionForm } from '@/features/agenda/components/session-form'
import { ESTADO_LABEL, ESTADO_TONE, MODALIDAD_LABEL, type SessionRecord, type SessionsStats, type SessionType } from '@/features/agenda/data'

interface SessionsListProps {
  initialSessions: SessionRecord[]
  initialStats: SessionsStats
  clients: { id: string; name: string }[]
  sessionTypes: SessionType[]
}

export function SessionsList({ initialSessions, initialStats, clients, sessionTypes }: SessionsListProps) {
  const [sessions, setSessions] = useState(initialSessions)
  const [stats, setStats] = useState(initialStats)
  const [isPending, startTransition] = useTransition()

  function refresh() {
    startTransition(async () => {
      const now = new Date()
      const in90days = new Date(now)
      in90days.setDate(in90days.getDate() + 90)
      const result = await listSessions({ from: now.toISOString(), to: in90days.toISOString() })
      setSessions(result.filter((s) => s.estado === 'programada'))
    })
  }

  function handleStatusChange(id: string, estado: 'completada' | 'cancelada') {
    setSessions((current) => current.filter((s) => s.id !== id))
    startTransition(() => {
      updateSessionStatus(id, estado)
    })
  }

  const statCards = [
    { label: 'Total (presenciales + online)', value: stats.total },
    { label: 'Presenciales', value: stats.presenciales },
    { label: 'Online', value: stats.online },
    { label: '% Asistencia', value: `${stats.asistenciaPct}%` },
    { label: 'Reservas del cliente', value: stats.reservas },
  ]

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-4">
            <p className="text-2xl font-black text-white">{card.value}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Próximas sesiones</h2>
            <p className="text-xs text-[#94A3B8]">Sesiones programadas de aquí en adelante.</p>
          </div>
          <SessionForm clients={clients} sessionTypes={sessionTypes} onCreated={refresh} />
        </div>

        {sessions.length === 0 ? (
          <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#94A3B8]">
            No hay sesiones programadas próximamente.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const date = new Date(session.fechaHora)
              return (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${session.tipoSesionColor}22`, color: session.tipoSesionColor }}
                    >
                      <Calendar className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{session.titulo}</p>
                      <p className="text-sm text-[#94A3B8]">
                        {session.clienteNombre} · {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}{' '}
                        {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#475569]">
                        <span className="inline-flex items-center gap-1">
                          {session.modalidad === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {MODALIDAD_LABEL[session.modalidad]}
                        </span>
                        {session.origen === 'cliente' && (
                          <span className="inline-flex items-center gap-1 text-[#FF6A00]">
                            <Users className="h-3 w-3" />
                            Reservada por el cliente
                          </span>
                        )}
                        <span className={cn('font-semibold', ESTADO_TONE[session.estado])}>{ESTADO_LABEL[session.estado]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(session.id, 'completada')}
                      disabled={isPending}
                      className="flex h-8 items-center gap-1 rounded-lg border border-[#4ADE80]/25 bg-[#4ADE80]/10 px-3 text-xs font-semibold text-[#4ADE80] disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Completada
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(session.id, 'cancelada')}
                      disabled={isPending}
                      className="flex h-8 items-center gap-1 rounded-lg border border-[#F87171]/25 bg-[#F87171]/10 px-3 text-xs font-semibold text-[#F87171] disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
