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
import { clientMetrics, getAdherenceTone, getStatusTone } from '@/features/clients/data'
import { getClientById } from '@/features/clients/services/actions'
import { ClientProfileTabs } from '@/features/clients/components/client-profile-tabs'
import { ClientGroupEditor } from '@/features/clients/components/client-group-editor'
import { listPaymentsByClient } from '@/features/payments/services/actions'
import { listPerformanceTests } from '@/features/performance-tests/services/actions'
import { listWellnessHistory } from '@/features/wellness/services/actions'
import { getLatestSummary } from '@/features/ai-summary/services/actions'
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
  const [client, payments, tests, wellnessHistory, aiSummary] = await Promise.all([
    getClientById(id),
    listPaymentsByClient(id),
    listPerformanceTests(id),
    listWellnessHistory(id),
    getLatestSummary(id),
  ])
  if (!client) notFound()

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <Link href="/dashboard/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <section className="mb-6 rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0D1117] text-xl font-black text-[#FF6A00] ring-1 ring-white/10">
              {client.initials}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', getStatusTone(client.status))}>
                  {client.status}
                </span>
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#C8D2E3]">
                  Portal activo
                </span>
                <ClientGroupEditor clientId={client.id} initialGroup={client.group} />
              </div>
              <h1 className="text-3xl font-black text-white">{client.name}</h1>
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
            <div key={item.label} className="glass-card rounded-2xl p-4">
              <item.icon className="mb-3 h-5 w-5 text-[#FF6A00]" />
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
      />
    </div>
  )
}
