'use client'

import { useState } from 'react'
import { Cake, HeartPulse, Pencil, Ruler, Weight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getLevelTone, type ClientRecord } from '@/features/clients/data'
import { EditClientBioModal } from '@/features/clients/components/edit-client-bio-modal'

export function ClientBioCard({ client }: { client: ClientRecord }) {
  const [isEditing, setIsEditing] = useState(false)

  const stats = [
    { icon: Cake, label: 'Edad', value: client.age ? `${client.age} años` : '—' },
    { icon: HeartPulse, label: 'FC máx', value: client.maxHeartRate ? `${client.maxHeartRate} ppm` : '—' },
    { icon: Ruler, label: 'Altura', value: client.height ? `${client.height} cm` : '—' },
    { icon: Weight, label: 'Peso', value: client.weight && client.weight !== '—' ? client.weight : '—' },
  ]

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Datos biométricos</h2>
          {client.level && (
            <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-bold', getLevelTone(client.level))}>
              {client.level}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6A00] hover:text-[#FFB000]"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar datos
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <stat.icon className="mb-1.5 h-3.5 w-3.5 text-[#FF6A00]" />
            <p className="text-xs text-[#475569]">{stat.label}</p>
            <p className="mt-1 text-sm font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#475569]">Lesiones / patologías</p>
          <p className="mt-1 text-sm text-[#C8D2E3]">{client.injuries || '—'}</p>
        </div>
      </div>

      {isEditing && <EditClientBioModal client={client} onClose={() => setIsEditing(false)} />}
    </section>
  )
}
