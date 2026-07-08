'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgeEuro, Clock, Dumbbell, Search, SlidersHorizontal, Target, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getCategoryTone, type WorkoutCategory, type WorkoutPlan } from '@/features/workouts/data'

const categories: Array<WorkoutCategory | 'Todos'> = ['Todos', 'Fuerza', 'Hipertrofia', 'Pérdida de grasa', 'Readaptación', 'Nutrición']

const statTone = {
  orange: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  yellow: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
}

interface WorkoutLibraryProps {
  plans: WorkoutPlan[]
  stats: { templates: number; activeAssignments: number; avgAdherence: number; paidPlans: number }
}

export function WorkoutLibrary({ plans, stats }: WorkoutLibraryProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<WorkoutCategory | 'Todos'>('Todos')
  const [sort, setSort] = useState<'adherence' | 'clients' | 'duration'>('adherence')

  const workoutStats = [
    { label: 'Plantillas', value: String(stats.templates), detail: 'listas para asignar', icon: Dumbbell, tone: 'orange' as const },
    { label: 'Asignaciones activas', value: String(stats.activeAssignments), detail: 'en clientes actuales', icon: Users, tone: 'yellow' as const },
    { label: 'Adherencia media', value: `${stats.avgAdherence}%`, detail: 'entre planes', icon: Target, tone: 'orange' as const },
    { label: 'Servicios con pago', value: String(stats.paidPlans), detail: 'planes recurrentes', icon: BadgeEuro, tone: 'yellow' as const },
  ]

  const visiblePlans = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return plans
      .filter((plan) => {
        const matchesCategory = category === 'Todos' || plan.category === category
        const matchesQuery =
          normalized.length === 0 ||
          [plan.title, plan.category, plan.level, plan.description, ...plan.tags].join(' ').toLowerCase().includes(normalized)
        return matchesCategory && matchesQuery
      })
      .sort((a, b) => {
        if (sort === 'clients') return b.assignedClients - a.assignedClients
        if (sort === 'duration') return a.durationWeeks - b.durationWeeks
        return b.adherence - a.adherence
      })
  }, [category, plans, query, sort])

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">Entrenamientos</p>
          <h1 className="mt-1 text-3xl font-black text-white">Planes y rutinas</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Crea plantillas con días, ejercicios, series, repeticiones, RPE y descanso para asignarlas a clientes.
          </p>
        </div>
        <Link href="/dashboard/workouts/new" className="btn-primary w-fit px-4 py-2 text-sm">
          Crear rutina
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {workoutStats.map((stat) => (
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

      <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_auto_auto] xl:items-center">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field pl-10"
            placeholder="Buscar por nombre, objetivo, etiqueta o nivel..."
          />
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                'whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition',
                category === item ? 'bg-[#FF6A00] text-[#0D1117]' : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-[#94A3B8]">
          <SlidersHorizontal className="h-4 w-4 text-[#FF6A00]" />
          Orden
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="bg-transparent font-semibold text-white outline-none">
            <option className="bg-[#0D1117]" value="adherence">Adherencia</option>
            <option className="bg-[#0D1117]" value="clients">Clientes</option>
            <option className="bg-[#0D1117]" value="duration">Duración</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {visiblePlans.map((plan) => (
          <article key={plan.id} className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', getCategoryTone(plan.category))}>{plan.category}</span>
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-[#C8D2E3]">{plan.level}</span>
                </div>
                <h2 className="text-xl font-black text-white">{plan.title}</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">{plan.description}</p>
              </div>
              <span className="w-fit rounded-full bg-[#FFB000]/10 px-3 py-1 text-xs font-bold text-[#FFB000]">{plan.price}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <Metric icon={Clock} label="Duración" value={`${plan.durationWeeks} sem.`} />
              <Metric icon={Dumbbell} label="Sesiones" value={`${plan.sessionsPerWeek}/sem`} />
              <Metric icon={Users} label="Clientes" value={String(plan.assignedClients)} />
              <Metric icon={Dumbbell} label="Adherencia" value={`${plan.adherence}%`} highlight />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {plan.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-[#94A3B8]">{tag}</span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/dashboard/workouts/${plan.id}`} className="btn-primary px-4 py-2 text-xs">
                Abrir rutina
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/clients" className="btn-secondary px-4 py-2 text-xs">
                Asignar cliente
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value, highlight = false }: { icon: typeof Dumbbell; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <p className="flex items-center gap-1 text-xs text-[#475569]">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <p className={cn('mt-1 text-sm font-black', highlight ? 'text-[#FF6A00]' : 'text-white')}>{value}</p>
    </div>
  )
}
