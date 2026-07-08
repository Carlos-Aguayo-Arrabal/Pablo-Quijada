import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Plus, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Agenda',
}

const appointments = [
  { time: '09:30', title: 'Revisión semanal', client: 'Laura Martin', type: 'Online' },
  { time: '11:00', title: 'Sesión presencial', client: 'Carlos Ruiz', type: 'Presencial' },
  { time: '16:30', title: 'Onboarding', client: 'Nueva clienta', type: 'Online' },
  { time: '18:00', title: 'Revisión nutricional', client: 'Marta Vega', type: 'Online' },
]

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Sesiones, revisiones y recordatorios de tus clientes.</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary w-fit text-sm">
          <Plus className="h-4 w-4" />
          Nueva cita
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#FFB000]" />
          <h2 className="text-sm font-semibold text-white">Hoy</h2>
        </div>
        <div className="space-y-3">
          {appointments.map((item) => (
            <Link key={`${item.time}-${item.client}`} href="/dashboard/messages" className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
              <div className="w-14 shrink-0 text-sm font-bold text-[#FF6A00]">{item.time}</div>
              <div className="flex-1">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-[#94A3B8]">{item.client}</p>
              </div>
              <div className="hidden items-center gap-1 text-xs text-[#94A3B8] sm:flex">
                {item.type === 'Online' ? <Video className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {item.type}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
