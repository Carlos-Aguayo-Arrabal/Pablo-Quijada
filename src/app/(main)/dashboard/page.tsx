import type { Metadata } from 'next'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Dumbbell,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { StatsCard } from '@/features/dashboard/components/stats-card'
import { WeeklyProgressChart } from '@/features/dashboard/components/progress-chart'
import { getDashboardSummary } from '@/features/dashboard/services/actions'

export const metadata: Metadata = {
  title: 'Dashboard',
}

const weeklyData = [
  { day: 'Lun', value: 27, target: 30 },
  { day: 'Mar', value: 31, target: 30 },
  { day: 'Mié', value: 22, target: 30 },
  { day: 'Jue', value: 34, target: 30 },
  { day: 'Vie', value: 19, target: 30 },
  { day: 'Sáb', value: 14, target: 20 },
  { day: 'Dom', value: 8, target: 15 },
]

const activityIcon = { checkin: ClipboardCheck, message: MessageSquare } as const

const quickActions = [
  { label: 'Añadir cliente', href: '/dashboard/clients/new', icon: Plus },
  { label: 'Crear entrenamiento', href: '/dashboard/workouts/new', icon: ClipboardList },
  { label: 'Enviar mensaje', href: '/dashboard/messages', icon: Send },
  { label: 'Ver agenda', href: '/dashboard/history', icon: CalendarCheck },
]

const toneClass = {
  orange: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  yellow: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  red: 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]',
}

export default async function DashboardPage() {
  const today = new Date()
  const summary = await getDashboardSummary()

  const todayTasks = [
    {
      title: 'Revisar check-ins',
      detail: 'Check-ins de clientes esperando aprobación o respuesta.',
      meta: `${summary.pendingCheckinsCount} pendientes`,
      href: '/dashboard/checkins',
      icon: ClipboardCheck,
      tone: 'orange',
    },
    {
      title: 'Responder mensajes',
      detail: 'Conversaciones con mensajes sin leer de tus clientes.',
      meta: `${summary.unreadThreadsCount} abiertos`,
      href: '/dashboard/messages',
      icon: MessageSquare,
      tone: 'yellow',
    },
    {
      title: 'Planes de entrenamiento',
      detail: 'Plantillas y rutinas disponibles para asignar.',
      meta: `${summary.totalWorkoutPlans} planes`,
      href: '/dashboard/workouts',
      icon: Dumbbell,
      tone: 'orange',
    },
    {
      title: 'Cobros y pagos',
      detail: 'Renovaciones y suscripciones de tus clientes.',
      meta: 'Ver pagos',
      href: '/dashboard/payments',
      icon: BadgeEuro,
      tone: 'red',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm capitalize text-[#94A3B8]">
            {today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="mt-1 text-3xl font-black leading-tight text-white">Dashboard operativo</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Hoy tienes <span className="font-semibold text-[#FF6A00]">{summary.pendingCheckinsCount} check-ins</span>, <span className="font-semibold text-[#FFB000]">{summary.totalWorkoutPlans} planes</span> y <span className="font-semibold text-[#F87171]">{summary.unreadThreadsCount} mensajes</span> que necesitan atención.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="btn-secondary justify-center px-4 py-2 text-xs">
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatsCard title="Clientes activos" value={summary.stats.activeClients} icon={Users} iconColor="teal" />
        <StatsCard title="Ingresos mensuales" value={summary.stats.mrr.toFixed(0)} unit="€" icon={BadgeEuro} iconColor="indigo" />
        <StatsCard title="Adherencia media" value={summary.stats.avgAdherence} unit="%" icon={TrendingUp} iconColor="teal" progress={summary.stats.avgAdherence} />
        <StatsCard title="Clientes en riesgo" value={summary.stats.riskCount} icon={AlertTriangle} iconColor="red" />
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-4">
        {todayTasks.map((task) => (
          <Link key={task.title} href={task.href} className="group rounded-2xl border border-white/[0.08] bg-[#111B26] p-4 transition hover:border-[#FF6A00]/40 hover:bg-[#142231]">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass[task.tone as keyof typeof toneClass]}`}>
                <task.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-white">{task.meta}</span>
            </div>
            <h2 className="text-sm font-bold text-white">{task.title}</h2>
            <p className="mt-1 min-h-10 text-xs leading-relaxed text-[#94A3B8]">{task.detail}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00]">
              Abrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <WeeklyProgressChart data={weeklyData} label="Entrenos completados" unit="entrenos" color="teal" />

            <section className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">Clientes en riesgo</h2>
                  <p className="text-xs text-[#94A3B8]">Prioridad para retención y adherencia.</p>
                </div>
                <Link href="/dashboard/clients" className="text-xs font-semibold text-[#FF6A00] hover:text-[#FFB000]">Ver todos</Link>
              </div>

              <div className="space-y-3">
                {summary.riskClients.map((client) => (
                  <Link key={client.id} href={`/dashboard/clients/${client.id}`} className="block rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">{client.name}</h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#F87171]">{client.problem}</p>
                      </div>
                      <span className="rounded-lg bg-[#F87171]/10 px-2 py-1 text-xs font-bold text-[#F87171]">{client.metric}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{client.detail}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00]">
                      Ver ficha <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
                {summary.riskClients.length === 0 && (
                  <p className="text-sm text-[#94A3B8]">Ningún cliente en riesgo ahora mismo.</p>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Check-ins pendientes</h2>
                <Link href="/dashboard/checkins" className="text-xs font-semibold text-[#FF6A00] hover:text-[#FFB000]">Revisar</Link>
              </div>
              <div className="space-y-3">
                {summary.pendingCheckIns.map((checkIn, index) => (
                  <Link key={`${checkIn.clientId}-${index}`} href={checkIn.clientId ? `/dashboard/clients/${checkIn.clientId}` : '/dashboard/checkins'} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                      <ClipboardCheck className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{checkIn.client}</span>
                      <span className="block truncate text-xs text-[#94A3B8]">{checkIn.result}</span>
                      <span className="mt-1 block text-xs font-semibold text-[#FFB000]">{checkIn.status}</span>
                    </span>
                  </Link>
                ))}
                {summary.pendingCheckIns.length === 0 && (
                  <p className="text-sm text-[#94A3B8]">No hay check-ins pendientes.</p>
                )}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Pagos y renovaciones</h2>
                <Link href="/dashboard/payments" className="text-xs font-semibold text-[#FF6A00] hover:text-[#FFB000]">Ver pagos</Link>
              </div>
              <div className="space-y-3">
                {summary.pendingPayments.map((payment) => (
                  <Link key={payment.id} href={`/dashboard/clients/${payment.clientId}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]">
                    <span>
                      <span className="block text-sm font-semibold text-white">{payment.client}</span>
                      <span className="block text-xs text-[#94A3B8]">{payment.concept} · {payment.status}</span>
                    </span>
                    <span className="rounded-lg bg-[#FFB000]/10 px-2.5 py-1 text-sm font-bold text-[#FFB000]">{payment.amount}</span>
                  </Link>
                ))}
                {summary.pendingPayments.length === 0 && (
                  <p className="text-sm text-[#94A3B8]">No hay pagos pendientes.</p>
                )}
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D1117] text-[#FF6A00]">
                <TrendingDown className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">Foco de hoy</h2>
                <p className="text-xs text-[#94A3B8]">Evitar bajas por falta de seguimiento.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#C8D2E3]">
              {summary.riskClients.length > 0
                ? `Empieza por ${summary.riskClients.map((c) => c.name).join(' y ')}: combinan baja adherencia con riesgo activo.`
                : 'Ningún cliente en riesgo ahora mismo. Buen momento para revisar check-ins pendientes.'}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={summary.riskClients[0] ? `/dashboard/clients/${summary.riskClients[0].id}` : '/dashboard/clients'} className="btn-primary justify-center px-3 py-2 text-xs">Ver cliente</Link>
              <Link href="/dashboard/messages" className="btn-secondary justify-center px-3 py-2 text-xs">Mensaje</Link>
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Actividad reciente</h2>
              <RefreshCw className="h-4 w-4 text-[#475569]" />
            </div>
            <div className="space-y-3">
              {summary.recentActivity.map((item, index) => {
                const Icon = activityIcon[item.type]
                return (
                  <Link key={`${item.type}-${index}`} href={item.href} className="flex gap-3 rounded-xl p-2 transition hover:bg-white/[0.05]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-[#FF6A00]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm text-white">{item.text}</span>
                      <span className="block text-xs text-[#475569]">{item.time}</span>
                    </span>
                  </Link>
                )
              })}
              {summary.recentActivity.length === 0 && (
                <p className="text-sm text-[#94A3B8]">Todavía no hay actividad para mostrar.</p>
              )}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Próximas citas</h2>
            {[
              ['09:30', 'Revisión semanal', 'Laura Martin'],
              ['11:00', 'Sesión presencial', 'Carlos Ruiz'],
              ['16:30', 'Onboarding', 'Nueva clienta'],
            ].map(([time, title, client]) => (
              <Link key={`${time}-${client}`} href="/dashboard/history" className="mb-2 flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:bg-white/[0.06] last:mb-0">
                <span className="text-xs font-bold text-[#FF6A00]">{time}</span>
                <span>
                  <span className="block text-sm font-semibold text-white">{title}</span>
                  <span className="block text-xs text-[#94A3B8]">{client}</span>
                </span>
              </Link>
            ))}
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Tareas rápidas</h2>
            {[
              { icon: CheckCircle2, label: 'Aprobar 6 check-ins', href: '/dashboard/checkins' },
              { icon: Clock, label: 'Programar recordatorios', href: '/dashboard/history' },
              { icon: MessageSquare, label: 'Responder mensajes', href: '/dashboard/messages' },
            ].map((task) => (
              <Link key={task.label} href={task.href} className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#94A3B8] transition hover:bg-white/[0.05] hover:text-white last:mb-0">
                <task.icon className="h-4 w-4 text-[#FF6A00]" />
                {task.label}
              </Link>
            ))}
          </section>
        </aside>
      </div>
    </div>
  )
}
