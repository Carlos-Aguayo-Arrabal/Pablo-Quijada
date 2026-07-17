import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { clientMetrics, getAdherenceTone, getLevelTone, getStatusTone } from '@/features/clients/data'
import { getClientById } from '@/features/clients/services/actions'
import { ClientProfileTabs } from '@/features/clients/components/client-profile-tabs'
import { ClientGroupEditor } from '@/features/clients/components/client-group-editor'
import { listPaymentsByClient } from '@/features/payments/services/actions'
import { listPerformanceTests } from '@/features/performance-tests/services/actions'
import { listWellnessHistory } from '@/features/wellness/services/actions'
import { getLatestSummary } from '@/features/ai-summary/services/actions'
import { getClientNutritionPlan } from '@/features/nutrition/services/actions'
import { cn } from '@/shared/lib/utils'

export const metadata: Metadata = {
  title: 'Ficha cliente',
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [client, payments, tests, wellnessHistory, aiSummary, nutritionPlan] = await Promise.all([
    getClientById(id),
    listPaymentsByClient(id),
    listPerformanceTests(id),
    listWellnessHistory(id),
    getLatestSummary(id),
    getClientNutritionPlan(id),
  ])
  if (!client) notFound()

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <Link href="/dashboard/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5 lg:p-6">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full opacity-20 blur-[90px]"
          style={{ background: '#FF6A00' }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#0D1117] text-xl font-black text-[#FF6A00] ring-2 ring-[#FF6A00]/40">
              {client.initials}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0D1117] bg-[#FF6A00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0D1117]" />
              </span>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', getStatusTone(client.status))}>
                  {client.status}
                </span>
                {client.level && (
                  <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', getLevelTone(client.level))}>
                    {client.level}
                  </span>
                )}
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#C8D2E3]">
                  Portal activo
                </span>
                <ClientGroupEditor clientId={client.id} initialGroup={client.group} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">{client.name}</h1>
              <p className="mt-1 max-w-2xl text-sm text-[#94A3B8]">{client.goal}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#94A3B8]">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#FF6A00]" />{client.email}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#FF6A00]" />{client.phone}</span>
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#FF6A00]" />Desde {client.startedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/messages" className="btn-primary px-4 py-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              Enviar mensaje
            </Link>
            <Link href="/dashboard/workouts" className="btn-secondary px-4 py-2 text-sm">
              <ClipboardList className="h-4 w-4" />
              Asignar plan
            </Link>
            <Link href="/client" className="btn-secondary px-4 py-2 text-sm">
              Ver portal
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {clientMetrics.map((item) => {
          const rawValue = client[item.key]
          const value = item.key === 'adherence' ? `${rawValue}%` : rawValue
          const tone = item.key === 'adherence' ? getAdherenceTone(client.adherence) : 'text-white'

          return (
            <div key={item.label} className="glass-card group rounded-2xl p-4 transition hover:border-[#FF6A00]/25">
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] transition group-hover:bg-[#FF6A00]/15">
                <item.icon className="h-4 w-4" />
              </span>
              <p className={cn('text-2xl font-black', tone)}>{value}</p>
              <p className="text-xs text-[#94A3B8]">{item.label}</p>
            </div>
          )
        })}
      </div>

      <ClientProfileTabs
        client={client}
        payments={payments}
        tests={tests}
        wellnessHistory={wellnessHistory}
        aiSummary={aiSummary}
        nutritionPlan={nutritionPlan}
      />
    </div>
  )
}
