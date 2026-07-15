import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getAdherenceTone, getStatusTone, type ClientRecord } from '@/features/clients/data'

function groupClients(clients: ClientRecord[]) {
  const groups = new Map<string, ClientRecord[]>()

  for (const client of clients) {
    const key = client.group?.trim() || 'Sin grupo'
    const bucket = groups.get(key) ?? []
    bucket.push(client)
    groups.set(key, bucket)
  }

  return [...groups.entries()].sort(([a], [b]) => {
    if (a === 'Sin grupo') return 1
    if (b === 'Sin grupo') return -1
    return a.localeCompare(b)
  })
}

export function GroupsBoard({ clients }: { clients: ClientRecord[] }) {
  const groups = groupClients(clients)

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">Cartera de clientes</p>
        <h1 className="mt-1 text-3xl font-black text-white">Grupos</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
          Clientes agrupados por horario, nivel o cohorte. Asigna un grupo desde la ficha de cada cliente.
        </p>
      </div>

      <div className="space-y-6">
        {groups.map(([groupName, members]) => (
          <section key={groupName} className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00]">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-white">{groupName}</h2>
                  <p className="text-xs text-[#94A3B8]">{members.length} cliente{members.length === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6A00]/35 to-[#FFB000]/25 text-xs font-black text-white">
                    {client.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-white">{client.name}</p>
                      <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold', getStatusTone(client.status))}>
                        {client.status}
                      </span>
                    </div>
                    <p className={cn('text-xs font-semibold', getAdherenceTone(client.adherence))}>{client.adherence}% adherencia</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#475569]" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        {groups.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-lg font-bold text-white">Todavía no tienes clientes</p>
            <p className="mt-2 text-sm text-[#94A3B8]">Invita a tu primer cliente para empezar a organizarlos en grupos.</p>
          </div>
        )}
      </div>
    </div>
  )
}
