'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  MessageSquare,
  Scale,
  Utensils,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import {
  clientTimeline,
  getAdherenceTone,
  type ClientRecord,
} from '@/features/clients/data'
import type { PaymentRecord } from '@/features/payments/types'

type ClientTab = 'Resumen' | 'Entrenamiento' | 'Nutrición' | 'Progreso' | 'Pagos' | 'Mensajes'

const tabs: ClientTab[] = ['Resumen', 'Entrenamiento', 'Nutrición', 'Progreso', 'Pagos', 'Mensajes']

const workoutPlan = [
  { day: 'Lunes', title: 'Fuerza torso + core', status: 'Completado', detail: '4 ejercicios · 45 min · RPE medio 7' },
  { day: 'Miércoles', title: 'Pierna y glúteo', status: 'Pendiente', detail: '5 ejercicios · 55 min · descanso 90s' },
  { day: 'Viernes', title: 'Full body técnico', status: 'Programado', detail: '4 ejercicios · 40 min · tempo controlado' },
]

const nutritionItems = [
  { label: 'Calorías objetivo', value: '2.150 kcal', note: 'Promedio semanal' },
  { label: 'Proteína', value: '150 g', note: 'Objetivo diario' },
  { label: 'Pasos', value: '8.000', note: 'Mínimo diario' },
  { label: 'Agua', value: '2,5 L', note: 'Hidratación' },
]

const progressData = [
  { label: 'Peso', current: '64.8 kg', change: '-0.6 kg', positive: true },
  { label: 'Cintura', current: '72 cm', change: '-2 cm', positive: true },
  { label: 'Sentadilla goblet', current: '26 kg', change: '+4 kg', positive: true },
  { label: 'Energía media', current: '7/10', change: '+1', positive: true },
]

const messages = [
  { from: 'Cliente', text: 'Hoy me noto bien, ¿subo un poco el peso en press?', time: 'Hace 2 h' },
  { from: 'Coach', text: 'Sí, sube 2 kg si mantienes técnica y no aparece molestia.', time: 'Hace 1 h' },
  { from: 'Cliente', text: 'Perfecto, lo pruebo en la segunda serie.', time: 'Hace 48 min' },
]

interface ClientProfileTabsProps {
  client: ClientRecord
  payments: PaymentRecord[]
}

export function ClientProfileTabs({ client, payments }: ClientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ClientTab>('Resumen')

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-sm font-bold transition',
                activeTab === tab
                  ? 'bg-[#FF6A00] text-[#0D1117]'
                  : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Resumen' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Actividad y seguimiento</h2>
            <div className="space-y-3">
              {clientTimeline.map((item) => (
                <div key={`${item.title}-${item.time}`} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
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
                  <Dumbbell className="h-5 w-5 text-[#FF6A00]" />
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-[#C8D2E3]">{item.status}</span>
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
        <section className="glass-card rounded-2xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Objetivos nutricionales</h2>
              <p className="text-xs text-[#94A3B8]">Seguimiento diario conectado al check-in.</p>
            </div>
            <Utensils className="h-5 w-5 text-[#FFB000]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {nutritionItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <p className="text-xs text-[#475569]">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#FFB000]/20 bg-[#FFB000]/10 p-4 text-sm text-[#C8D2E3]">
            Prioridad: mantener proteína alta y simplificar cenas los días de entrenamiento.
          </div>
        </section>
      )}

      {activeTab === 'Progreso' && (
        <section className="glass-card rounded-2xl p-5">
          <h2 className="mb-5 text-sm font-bold text-white">Progreso reciente</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {progressData.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <Scale className="mb-3 h-5 w-5 text-[#FF6A00]" />
                <p className="text-xs text-[#475569]">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-white">{item.current}</p>
                <p className="mt-1 text-xs font-bold text-[#FF6A00]">{item.change}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Adherencia global</span>
              <span className={cn('font-bold', getAdherenceTone(client.adherence))}>{client.adherence}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${client.adherence}%` }} />
            </div>
          </div>
        </section>
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
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-[#C8D2E3]">{payment.statusLabel}</span>
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
            {messages.map((message) => (
              <div key={`${message.from}-${message.time}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#FF6A00]">{message.from}</span>
                  <span className="text-xs text-[#475569]">{message.time}</span>
                </div>
                <p className="text-sm text-white">{message.text}</p>
              </div>
            ))}
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
