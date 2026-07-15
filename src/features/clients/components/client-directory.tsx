'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  Calendar,
  CheckCircle2,
  Filter,
  Mail,
  MessageSquare,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getAdherenceTone, getStatusTone, type ClientRecord, type ClientStatus } from '@/features/clients/data'
import { toggleClientFavorite } from '@/features/clients/services/actions'

const filters: Array<ClientStatus | 'Todos'> = ['Todos', 'Activo', 'Riesgo', 'Pendiente', 'Pausado']

const actionHref = {
  checkin: '/dashboard/clients',
  message: '/dashboard/messages',
  payment: '/dashboard/payments',
  plan: '/dashboard/workouts',
}

const summaryTone = {
  orange: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  yellow: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  red: 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]',
}

interface ClientDirectoryProps {
  clients: ClientRecord[]
  summary: { total: number; activeCount: number; riskCount: number; pendingCheckins: number; mrr: number }
  title?: string
  subtitle?: string
  eyebrow?: string
  showInviteButton?: boolean
}

export function ClientDirectory({
  clients: initialClients,
  summary,
  title = 'Clientes',
  subtitle = 'Gestiona adherencia, pagos, check-ins y la próxima acción de cada persona desde una sola vista.',
  eyebrow = 'Cartera de clientes',
  showInviteButton = true,
}: ClientDirectoryProps) {
  const [clients, setClients] = useState(initialClients)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ClientStatus | 'Todos'>('Todos')
  const [sort, setSort] = useState<'priority' | 'adherence' | 'revenue'>('priority')

  async function handleToggleFavorite(client: ClientRecord) {
    const nextFavorite = !client.favorite
    setClients((current) => current.map((c) => (c.id === client.id ? { ...c, favorite: nextFavorite } : c)))
    const result = await toggleClientFavorite(client.id, nextFavorite)
    if (result?.error) {
      setClients((current) => current.map((c) => (c.id === client.id ? { ...c, favorite: !nextFavorite } : c)))
    }
  }

  const clientSummary = [
    { label: 'Clientes activos', value: String(summary.activeCount), detail: `${summary.total} en total`, icon: CheckCircle2, tone: 'orange' as const },
    { label: 'En riesgo', value: String(summary.riskCount), detail: 'requieren atención', icon: AlertTriangle, tone: 'red' as const },
    { label: 'Check-ins pendientes', value: String(summary.pendingCheckins), detail: 'por revisar hoy', icon: MessageSquare, tone: 'yellow' as const },
    { label: 'MRR clientes', value: `${summary.mrr.toFixed(0)} €`, detail: 'ingresos mensuales', icon: BadgeEuro, tone: 'orange' as const },
  ]

  const visibleClients = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return clients
      .filter((client) => {
        const matchesStatus = status === 'Todos' || client.status === status
        const matchesQuery =
          normalized.length === 0 ||
          [client.name, client.email, client.service, client.goal, client.nextAction, ...client.tags]
            .join(' ')
            .toLowerCase()
            .includes(normalized)

        return matchesStatus && matchesQuery
      })
      .sort((a, b) => {
        if (sort === 'adherence') return a.adherence - b.adherence
        if (sort === 'revenue') return Number.parseInt(b.revenue) - Number.parseInt(a.revenue)

        const priority = { Riesgo: 0, Pendiente: 1, Activo: 2, Pausado: 3 }
        return priority[a.status] - priority[b.status]
      })
  }, [clients, query, status, sort])

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">{eyebrow}</p>
          <h1 className="mt-1 text-3xl font-black text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/messages" className="btn-secondary px-4 py-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Mensaje grupal
          </Link>
          {showInviteButton && (
            <Link href="/dashboard/clients/new" className="btn-primary px-4 py-2 text-sm">
              Invitar cliente
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {clientSummary.map((item) => (
          <div key={item.label} className="glass-card rounded-2xl p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', summaryTone[item.tone as keyof typeof summaryTone])}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-xs text-[#475569]">{item.detail}</span>
            </div>
            <p className="text-3xl font-black text-white">{item.value}</p>
            <p className="text-sm text-[#94A3B8]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por nombre, objetivo, servicio o etiqueta..."
          />
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
          {filters.map((item) => (
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

        <label className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-[#94A3B8]">
          <SlidersHorizontal className="h-4 w-4 text-[#FF6A00]" />
          Orden
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="bg-transparent font-semibold text-white outline-none"
          >
            <option className="bg-[#0D1117]" value="priority">Prioridad</option>
            <option className="bg-[#0D1117]" value="adherence">Adherencia baja</option>
            <option className="bg-[#0D1117]" value="revenue">Ingreso</option>
          </select>
        </label>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-[#94A3B8]">
        <Filter className="h-4 w-4 text-[#475569]" />
        {visibleClients.length} clientes encontrados
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visibleClients.map((client) => (
          <article key={client.id} className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/35 to-[#FFB000]/25 text-sm font-black text-white">
                  {client.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-white">{client.name}</h2>
                    <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-bold', getStatusTone(client.status))}>
                      {client.status}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="w-fit rounded-full bg-[#FFB000]/10 px-3 py-1 text-xs font-bold text-[#FFB000]">{client.revenue}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(client)}
                  aria-label={client.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  title={client.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border transition',
                    client.favorite
                      ? 'border-[#FFB000]/40 bg-[#FFB000]/15 text-[#FFB000]'
                      : 'border-white/[0.08] bg-white/[0.03] text-[#475569] hover:text-[#FFB000]'
                  )}
                >
                  <Star className="h-4 w-4" fill={client.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#475569]">Objetivo</p>
              <p className="mt-1 text-sm font-semibold text-white">{client.goal}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{client.service}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="flex items-center gap-1 text-xs text-[#475569]">
                  <TrendingUp className="h-3 w-3" />
                  Adherencia
                </p>
                <p className={cn('mt-1 text-lg font-black', getAdherenceTone(client.adherence))}>{client.adherence}%</p>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${client.adherence}%` }} />
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-[#475569]">Entrenos</p>
                <p className="mt-1 text-sm font-bold text-white">{client.workouts}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{client.checkIns}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="flex items-center gap-1 text-xs text-[#475569]">
                  <Calendar className="h-3 w-3" />
                  Próxima acción
                </p>
                <p className="mt-1 text-sm font-bold text-white">{client.nextAction}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {client.group && (
                <span className="rounded-full border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-2.5 py-1 text-xs font-semibold text-[#FF6A00]">{client.group}</span>
              )}
              {client.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-[#94A3B8]">{tag}</span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/dashboard/clients/${client.id}`} className="btn-primary px-4 py-2 text-xs">
                Abrir ficha
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={actionHref[client.nextActionType]} className="btn-secondary px-4 py-2 text-xs">
                {client.nextAction}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visibleClients.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-lg font-bold text-white">No hay clientes con ese filtro</p>
          <p className="mt-2 text-sm text-[#94A3B8]">Prueba otro estado o busca por nombre, servicio u objetivo.</p>
        </div>
      )}
    </div>
  )
}
