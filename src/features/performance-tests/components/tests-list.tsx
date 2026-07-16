'use client'

import { useMemo, useState, useTransition } from 'react'
import { Activity, HeartPulse, MoveVertical, Ruler, Scale, Sparkles, TrendingDown, TrendingUp, Trash2 } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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

  const trends = useMemo(() => {
    const groups = new Map<string, PerformanceTest[]>()
    for (const test of items) {
      const key = `${test.categoria}__${test.nombre}`
      const bucket = groups.get(key) ?? []
      bucket.push(test)
      groups.set(key, bucket)
    }
    return Array.from(groups.values())
      .map((group) => [...group].sort((a, b) => new Date(a.fechaTest).getTime() - new Date(b.fechaTest).getTime()))
      .filter((group) => group.length >= 2)
      .map((group) => {
        const first = group[0]
        const last = group[group.length - 1]
        const delta = Math.round((last.valor - first.valor) * 100) / 100
        return {
          key: `${last.categoria}__${last.nombre}`,
          nombre: last.nombre,
          categoria: last.categoria,
          unidad: last.unidad,
          latest: last.valor,
          delta,
          data: group.map((t) => ({
            fecha: new Date(t.fechaTest).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            valor: t.valor,
          })),
        }
      })
  }, [items])

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

      {trends.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-bold text-white">Marcas y evolución</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {trends.map((trend) => {
              const isUp = trend.delta > 0
              const isDown = trend.delta < 0
              return (
                <div key={trend.key} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#475569]">{categoriaLabel(trend.categoria)} · {trend.nombre}</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {trend.latest} <span className="text-sm font-bold text-[#94A3B8]">{trend.unidad}</span>
                      </p>
                    </div>
                    {trend.delta !== 0 && (
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold',
                          isUp && 'border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF6A00]',
                          isDown && 'border-[#F87171]/25 bg-[#F87171]/10 text-[#F87171]'
                        )}
                      >
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {isUp ? '+' : ''}{trend.delta} {trend.unidad}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend.data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                        <XAxis dataKey="fecha" hide />
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Tooltip
                          contentStyle={{
                            background: '#0D1117',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: '#94A3B8' }}
                          itemStyle={{ color: '#FF6A00' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="valor"
                          stroke="#FF6A00"
                          strokeWidth={2}
                          dot={{ r: 3, fill: '#FF6A00', strokeWidth: 0 }}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </div>
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
