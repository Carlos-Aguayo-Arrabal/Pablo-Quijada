'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ESTADO_LABEL, ESTADO_TONE, type AiSummary } from '@/features/ai-summary/data'
import { generateClientSummary } from '@/features/ai-summary/services/actions'

export function AiSummaryCard({ clienteId, initialSummary }: { clienteId: string; initialSummary: AiSummary | null }) {
  const router = useRouter()
  const [summary, setSummary] = useState(initialSummary)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsLoading(true)
    setError(null)

    const result = await generateClientSummary(clienteId)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.refresh()
    setIsLoading(false)
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF6A00]" />
          <h2 className="text-sm font-bold text-white">Resumen con IA</h2>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          {summary ? 'Regenerar' : 'Generar resumen'}
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
          {error}
        </p>
      )}

      {!summary && !error && (
        <p className="text-sm text-[#94A3B8]">
          Genera un resumen del estado general de este cliente a partir de sus check-ins, cuestionarios de bienestar, tests y mensajes recientes.
        </p>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', ESTADO_TONE[summary.estadoGeneral])}>
              {ESTADO_LABEL[summary.estadoGeneral]}
            </span>
            <span className="text-xs text-[#475569]">
              {new Date(summary.generadoEn).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-[#C8D2E3]">{summary.resumen}</p>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#475569]">Puntos clave</p>
            <ul className="space-y-1.5">
              {summary.puntosClave.map((punto) => (
                <li key={punto} className="flex gap-2 text-sm text-[#94A3B8]">
                  <span className="text-[#FF6A00]">•</span>
                  {punto}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/10 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FF6A00]">Recomendación</p>
            <p className="mt-1 text-sm text-[#C8D2E3]">{summary.recomendacion}</p>
          </div>
        </div>
      )}
    </section>
  )
}
