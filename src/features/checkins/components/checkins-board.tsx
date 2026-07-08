'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  MessageSquare,
  Search,
  Send,
  SlidersHorizontal,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  getRiskTone,
  getStatusTone,
  type CheckInRecord,
  type CheckInStatus,
} from '@/features/checkins/data'
import { approveCheckIn, sendCheckInReply } from '@/features/checkins/services/actions'

const statuses: Array<CheckInStatus | 'Todos'> = ['Todos', 'Pendiente', 'Requiere respuesta', 'Aprobado']

const statTone = {
  orange: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  yellow: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  red: 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]',
}

interface CheckInsBoardProps {
  checkIns: CheckInRecord[]
  stats: { pending: number; needsReply: number; approved: number; avgAdherence: number }
}

export function CheckInsBoard({ checkIns, stats }: CheckInsBoardProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CheckInStatus | 'Todos'>('Todos')
  const [selectedId, setSelectedId] = useState(checkIns[0]?.id)
  const [approved, setApproved] = useState<string[]>([])
  const [sentReplies, setSentReplies] = useState<string[]>([])
  const [replyDraft, setReplyDraft] = useState<string | null>(null)

  const checkInStats = [
    { label: 'Pendientes', value: String(stats.pending), detail: 'por revisar hoy', icon: ClipboardCheck, tone: 'orange' as const },
    { label: 'Requieren respuesta', value: String(stats.needsReply), detail: 'con alerta activa', icon: AlertTriangle, tone: 'red' as const },
    { label: 'Aprobados', value: String(stats.approved), detail: 'en total', icon: CheckCircle2, tone: 'yellow' as const },
    { label: 'Adherencia media', value: `${stats.avgAdherence}%`, detail: 'check-ins recibidos', icon: TrendingDown, tone: 'orange' as const },
  ]

  const visibleCheckIns = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return checkIns.filter((item) => {
      const matchesStatus = status === 'Todos' || item.status === status
      const matchesQuery =
        normalized.length === 0 ||
        [item.client, item.comment, item.alert, item.status, item.risk].join(' ').toLowerCase().includes(normalized)

      return matchesStatus && matchesQuery
    })
  }, [query, status, checkIns])

  const selected = visibleCheckIns.find((item) => item.id === selectedId) ?? visibleCheckIns[0] ?? checkIns[0]

  if (!selected) {
    return (
      <div className="mx-auto max-w-7xl p-5 lg:p-8">
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-white">Todavía no hay check-ins</p>
          <p className="mt-2 text-sm text-[#94A3B8]">Aparecerán aquí cuando tus clientes envíen su seguimiento semanal.</p>
        </div>
      </div>
    )
  }

  async function approve(id: string) {
    setApproved((current) => Array.from(new Set([...current, id])))
    await approveCheckIn(id)
  }

  async function sendReply(id: string) {
    const reply = replyDraft ?? selected.suggestedReply
    setSentReplies((current) => Array.from(new Set([...current, id])))
    await sendCheckInReply(id, reply)
  }

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">Seguimiento semanal</p>
          <h1 className="mt-1 text-3xl font-black text-white">Check-ins</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Revisa peso, energía, sueño, hambre, adherencia y comentarios para decidir qué cliente necesita respuesta hoy.
          </p>
        </div>
        <Link href="/dashboard/messages" className="btn-primary w-fit px-4 py-2 text-sm">
          <MessageSquare className="h-4 w-4" />
          Responder mensajes
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {checkInStats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', statTone[stat.tone as keyof typeof statTone])}>
                <stat.icon className="h-5 w-5" />
              </span>
              <span className="text-xs text-[#475569]">{stat.detail}</span>
            </div>
            <p className="text-3xl font-black text-white">{stat.value}</p>
            <p className="text-sm text-[#94A3B8]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por cliente, alerta o comentario..."
          />
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
          {statuses.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={cn(
                'whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition',
                status === item ? 'bg-[#FF6A00] text-[#0D1117]' : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <SlidersHorizontal className="h-4 w-4 text-[#475569]" />
            {visibleCheckIns.length} check-ins encontrados
          </div>

          {visibleCheckIns.map((item) => {
            const isSelected = selected.id === item.id
            const isApproved = approved.includes(item.id) || item.status === 'Aprobado'

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedId(item.id)
                  setReplyDraft(null)
                }}
                className={cn(
                  'w-full rounded-2xl border p-4 text-left transition',
                  isSelected ? 'border-[#FF6A00]/45 bg-[#FF6A00]/10' : 'border-white/[0.08] bg-[#111B26] hover:border-white/[0.16]'
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-white">{item.client}</h2>
                    <p className="text-xs text-[#94A3B8]">{item.date}</p>
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-bold', getStatusTone(isApproved ? 'Aprobado' : item.status))}>
                    {isApproved ? 'Aprobado' : item.status}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#C8D2E3]">{item.comment}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Mini label="Peso" value={item.weightChange} />
                  <Mini label="Energía" value={`${item.energy}/10`} />
                  <Mini label="Adh." value={`${item.adherence}%`} />
                </div>
              </button>
            )
          })}
        </section>

        <section className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6A00]">Detalle del check-in</p>
              <h2 className="mt-1 text-2xl font-black text-white">{selected.client}</h2>
              <p className="text-sm text-[#94A3B8]">{selected.date}</p>
            </div>
            <Link href={`/dashboard/clients/${selected.clientId}`} className="btn-secondary w-fit px-4 py-2 text-xs">
              Ver ficha
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Peso" value={selected.weight} detail={selected.weightChange} />
            <Metric label="Energía" value={`${selected.energy}/10`} detail="autorreporte" />
            <Metric label="Sueño" value={`${selected.sleep}/10`} detail="calidad" />
            <Metric label="Hambre" value={`${selected.hunger}/10`} detail="sensación" />
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <Metric label="Pasos" value={selected.steps} detail="media diaria" />
            <Metric label="Entrenos" value={selected.workouts} detail="semana" />
            <Metric label="Nutrición" value={selected.nutrition} detail="adherencia" />
          </div>

          <div className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#475569]">Comentario del cliente</p>
            <p className="mt-2 text-sm leading-relaxed text-white">{selected.comment}</p>
          </div>

          <div className="mb-5 rounded-2xl border border-[#F87171]/20 bg-[#F87171]/10 p-4">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-white">Alerta detectada</p>
              <span className={cn('text-xs font-black', getRiskTone(selected.risk))}>Riesgo {selected.risk}</span>
            </div>
            <p className="text-sm text-[#FCA5A5]">{selected.alert}</p>
          </div>

          <div className="rounded-2xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 p-4">
            <p className="text-sm font-black text-white">Respuesta sugerida</p>
            <textarea
              key={selected.id}
              className="input-field mt-3 min-h-32 resize-none"
              defaultValue={selected.suggestedReply}
              onChange={(event) => setReplyDraft(event.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => approve(selected.id)} className="btn-secondary px-4 py-2 text-xs">
                <Check className="h-4 w-4" />
                Aprobar check-in
              </button>
              <button type="button" onClick={() => sendReply(selected.id)} className="btn-primary px-4 py-2 text-xs">
                <Send className="h-4 w-4" />
                Enviar respuesta
              </button>
            </div>
            {(approved.includes(selected.id) || sentReplies.includes(selected.id)) && (
              <p className="mt-3 text-sm font-semibold text-[#FF6A00]">
                {sentReplies.includes(selected.id) ? 'Respuesta enviada.' : 'Check-in aprobado.'}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg bg-white/[0.04] px-2.5 py-2">
      <span className="block text-[#475569]">{label}</span>
      <span className="block font-black text-white">{value}</span>
    </span>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <p className="text-xs text-[#475569]">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{detail}</p>
    </div>
  )
}
