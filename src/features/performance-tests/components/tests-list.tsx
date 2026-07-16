'use client'

import { useState, useTransition } from 'react'
import { Activity, HeartPulse, MoveVertical, Ruler, Scale, Sparkles, Trash2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { categoriaLabel, type PerformanceTest, type TestCategoria } from '@/features/performance-tests/data'
import { deletePerformanceTest } from '@/features/performance-tests/services/actions'
import { TestForm } from '@/features/performance-tests/components/test-form'
import { toneForPain, toneForStress, type WellnessCheck } from '@/features/wellness/data'

const toneClass = {
  low: 'text-[#4ADE80]',
  medium: 'text-[#FFB000]',
  high: 'text-[#F87171]',
} as const

const categoriaIcon: Record<TestCategoria, typeof Scale> = {
  fuerza: Scale,
  resistencia: Activity,
  flexibilidad: MoveVertical,
  medidas: Ruler,
  otro: Sparkles,
}

interface TestsListProps {
  clienteId: string
  tests: PerformanceTest[]
  wellnessHistory: WellnessCheck[]
  adherencia: number
}

export function TestsList({ clienteId, tests, wellnessHistory, adherencia }: TestsListProps) {
  const [items, setItems] = useState(tests)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    setItems((current) => current.filter((t) => t.id !== id))
    startTransition(() => {
      deletePerformanceTest(id, clienteId)
    })
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-white">Tests físicos</h2>
        <TestForm clienteId={clienteId} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#94A3B8]">
          Todavía no hay tests registrados para este cliente.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((test) => {
            const CategoriaIcon = categoriaIcon[test.categoria]
            return (
            <div key={test.id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-3 flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                  <CategoriaIcon className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(test.id)}
                  disabled={isPending}
                  className="text-[#475569] hover:text-[#F87171] disabled:opacity-50"
                  aria-label="Eliminar test"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#475569]">{categoriaLabel(test.categoria)} · {test.nombre}</p>
              <p className="mt-1 text-2xl font-black text-white">{test.valor} {test.unidad}</p>
              <p className="mt-1 text-xs text-[#94A3B8]">{new Date(test.fechaTest).toLocaleDateString('es-ES')}</p>
            </div>
            )
          })}
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Adherencia global</span>
          <span className="font-bold text-[#FF6A00]">{adherencia}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${adherencia}%` }} />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[#FF6A00]" />
          <h3 className="text-sm font-bold text-white">Bienestar reciente</h3>
        </div>
        {wellnessHistory.length === 0 ? (
          <p className="text-sm text-[#94A3B8]">Todavía no hay cuestionarios de bienestar enviados.</p>
        ) : (
          <div className="space-y-2">
            {wellnessHistory.map((check) => (
              <div key={check.id} className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-xs sm:grid-cols-5">
                <span className="text-[#475569] sm:col-span-1">
                  {new Date(check.creadoEn).toLocaleDateString('es-ES')}
                </span>
                <span className="text-[#94A3B8]">Sueño <span className="font-bold text-white">{check.sueno}/10</span></span>
                <span className={cn('text-[#94A3B8]', toneClass[toneForStress(check.estres)])}>
                  Estrés <span className="font-bold">{check.estres}/10</span>
                </span>
                <span className={cn('text-[#94A3B8]', toneClass[toneForPain(check.dolor)])}>
                  Dolor <span className="font-bold">{check.dolor}/10</span>
                </span>
                <span className="text-[#94A3B8]">Energía <span className="font-bold text-white">{check.energia}/10</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
