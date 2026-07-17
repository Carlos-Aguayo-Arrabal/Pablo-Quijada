'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  LayoutGrid,
  BadgeEuro,
  MessageSquare,
  TrendingUp,
  Utensils,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  clientTimeline,
  type ClientRecord,
} from '@/features/clients/data'
import type { PaymentRecord, PaymentStatus } from '@/features/payments/types'
import type { PerformanceTest } from '@/features/performance-tests/data'
import { TestsList } from '@/features/performance-tests/components/tests-list'
import type { WellnessCheck } from '@/features/wellness/data'
import type { AiSummary } from '@/features/ai-summary/data'
import { AiSummaryCard } from '@/features/ai-summary/components/ai-summary-card'
import { ClientBioCard } from '@/features/clients/components/client-bio-card'
import { NutritionTab } from '@/features/nutrition/components/nutrition-tab'
import type { NutritionPlanView } from '@/features/nutrition/services/actions'

type ClientTab = 'Resumen' | 'Entrenamiento' | 'Nutrición' | 'Progreso' | 'Pagos' | 'Mensajes'

const tabs: { id: ClientTab; icon: typeof LayoutGrid }[] = [
  { id: 'Resumen', icon: LayoutGrid },
  { id: 'Entrenamiento', icon: Dumbbell },
  { id: 'Nutrición', icon: Utensils },
  { id: 'Progreso', icon: TrendingUp },
  { id: 'Pagos', icon: BadgeEuro },
  { id: 'Mensajes', icon: MessageSquare },
]

const workoutPlan = [
  { day: 'Lunes', title: 'Fuerza torso + core', status: 'Completado', detail: '4 ejercicios · 45 min · RPE medio 7' },
  { day: 'Miércoles', title: 'Pierna y glúteo', status: 'Pendiente', detail: '5 ejercicios · 55 min · descanso 90s' },
  { day: 'Viernes', title: 'Full body técnico', status: 'Programado', detail: '4 ejercicios · 40 min · tempo controlado' },
]

const workoutStatusTone: Record<string, string> = {
  Completado: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  Pendiente: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  Programado: 'border-white/15 bg-white/[0.05] text-[#94A3B8]',
}

const messages = [
  { from: 'Cliente', text: 'Hoy me noto bien, ¿subo un poco el peso en press?', time: 'Hace 2 h' },
  { from: 'Coach', text: 'Sí, sube 2 kg si mantienes técnica y no aparece molestia.', time: 'Hace 1 h' },
  { from: 'Cliente', text: 'Perfecto, lo pruebo en la segunda serie.', time: 'Hace 48 min' },
]

const paymentStatusTone: Record<PaymentStatus, string> = {
  Pagado: 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
  Pendiente: 'border-[#FFB000]/25 bg-[#FFB000]/10 text-[#FFB000]',
  Vencido: 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]',
}

interface ClientProfileTabsProps {
  client: ClientRecord
  payments: PaymentRecord[]
  tests: PerformanceTest[]
  wellnessHistory: WellnessCheck[]
  aiSummary: AiSummary | null
  nutritionPlan: NutritionPlanView | null
}

export function ClientProfileTabs({ client, payments, tests, wellnessHistory, aiSummary, nutritionPlan }: ClientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ClientTab>('Resumen')

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto border-b border-white/[0.08]">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition',
                activeTab === tab.id
                  ? 'text-[#FF6A00]'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.id}
              {activeTab === tab.id && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#FF6A00]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Resumen' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Actividad y seguimiento</h2>
            <div className="relative space-y-3">
              <span className="absolute bottom-4 left-[21px] top-4 w-px bg-white/[0.08]" aria-hidden />
              {clientTimeline.map((item) => (
                <div key={`${item.title}-${item.time}`} className="relative flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] ring-4 ring-[#0D1117]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-[#475569]">{item.time}</p>
                    </div>
                    <p className="mt-1 text-sm text-[#94A3B8]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 text-sm font-bold text-white">Próxima acción</h2>
              <div className="rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 p-4">
                <p className="text-lg font-black text-white">{client.nextAction}</p>
                <p className="mt-1 text-sm text-[#C8D2E3]">{client.notes}</p>
                <Link href="/dashboard/messages" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#FF6A00]">
                  Ejecutar acción <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <ClientBioCard client={client} />
            <AiSummaryCard clienteId={client.id} initialSummary={aiSummary} />
            <RiskPanel client={client} />
          </aside>
        </div>
      )}

      {activeTab === 'Entrenamiento' && (
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Plan activo</h2>
              <p className="text-xs text-[#94A3B8]">{client.service} · {client.workouts} completados esta semana</p>
            </div>
            <Link href="/dashboard/workouts" className="btn-primary w-fit px-4 py-2 text-xs">
              Editar rutina
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {workoutPlan.map((item) => (
              <div key={item.day} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                    <Dumbbell className="h-4 w-4" />
                  </span>
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', workoutStatusTone[item.status])}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#475569]">{item.day}</p>
                <h3 className="mt-1 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[#94A3B8]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'Nutrición' && (
        <NutritionTab clienteId={client.id} plan={nutritionPlan} />
      )}

      {activeTab === 'Progreso' && (
        <TestsList
          clienteId={client.id}
          tests={tests}
          wellnessHistory={wellnessHistory}
          adherencia={client.adherence}
        />
      )}

      {activeTab === 'Pagos' && (
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Pagos y suscripción</h2>
              <p className="text-xs text-[#94A3B8]">Servicio actual: {client.revenue}</p>
            </div>
            <Link href="/dashboard/payments" className="btn-secondary w-fit px-4 py-2 text-xs">
              Ver pagos
            </Link>
          </div>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{payment.concept}</p>
                  <p className="text-xs text-[#94A3B8]">{payment.dueDate ? `Vence ${payment.dueDate}` : 'Sin fecha de vencimiento'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#FFB000]">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: payment.currency }).format(payment.amount)}
                  </span>
                  <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', paymentStatusTone[payment.status])}>
                    {payment.statusLabel}
                  </span>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-[#94A3B8]">Todavía no hay pagos registrados para este cliente.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'Mensajes' && (
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Conversación reciente</h2>
              <p className="text-xs text-[#94A3B8]">Mensajes conectados con el contexto del plan.</p>
            </div>
            <Link href="/dashboard/messages" className="btn-primary w-fit px-4 py-2 text-xs">
              Abrir chat
              <MessageSquare className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {messages.map((message) => {
              const isCoach = message.from === 'Coach'
              return (
                <div key={`${message.from}-${message.time}`} className={cn('flex gap-3', isCoach && 'flex-row-reverse')}>
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
                      isCoach ? 'bg-[#FF6A00]/15 text-[#FF6A00]' : 'bg-white/[0.08] text-[#C8D2E3]'
                    )}
                  >
                    {isCoach ? 'C' : client.initials}
                  </span>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl border p-4',
                      isCoach
                        ? 'border-[#FF6A00]/20 bg-[#FF6A00]/10 text-right'
                        : 'border-white/[0.06] bg-white/[0.03]'
                    )}
                  >
                    <div className={cn('mb-2 flex items-center gap-3', isCoach ? 'flex-row-reverse justify-start' : 'justify-between')}>
                      <span className={cn('text-xs font-bold', isCoach ? 'text-[#FF6A00]' : 'text-[#C8D2E3]')}>{message.from}</span>
                      <span className="text-xs text-[#475569]">{message.time}</span>
                    </div>
                    <p className="text-sm text-white">{message.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function RiskPanel({ client }: { client: ClientRecord }) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <h2 className="mb-4 text-sm font-bold text-white">Riesgos y notas</h2>
      {client.risks.length > 0 ? (
        <div className="space-y-2">
          {client.risks.map((risk) => (
            <div key={risk} className="rounded-xl border border-[#F87171]/20 bg-[#F87171]/10 px-3 py-2 text-sm font-semibold text-[#F87171]">
              {risk}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/10 px-3 py-3 text-sm font-semibold text-[#FF6A00]">
          <CheckCircle2 className="h-4 w-4" />
          Sin riesgos activos
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">{client.notes}</p>
    </section>
  )
}
