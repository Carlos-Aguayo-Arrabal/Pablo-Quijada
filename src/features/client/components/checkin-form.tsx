'use client'

import { useState } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { submitMyCheckin } from '@/features/client/services/actions'

export function CheckinForm({ pesoActual }: { pesoActual: string | null }) {
  const [weight, setWeight] = useState(pesoActual ?? '')
  const [energy, setEnergy] = useState(7)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await submitMyCheckin({ peso: weight, energia: energy, comentario: comment })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setSent(true)
    setComment('')
    setIsSubmitting(false)
  }

  return (
    <form className="glass-card rounded-2xl p-5" onSubmit={handleSubmit}>
      <h2 className="mb-4 text-sm font-semibold">Check-in rápido</h2>
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
            {error}
          </p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Peso de hoy</span>
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="input-field"
            inputMode="decimal"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Energía: {energy}/10</span>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(event) => setEnergy(Number(event.target.value))}
            className="w-full accent-brand"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Comentario para tu entrenador</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="input-field min-h-24 resize-none"
            placeholder="Ej: dormí poco, pero el entrenamiento salió bien..."
          />
        </label>
        <button className="btn-primary w-full justify-center disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enviar check-in
          <ChevronRight className="h-4 w-4" />
        </button>
        {sent && (
          <p className="rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-brand">
            Check-in enviado. Tu entrenador lo verá en su panel.
          </p>
        )}
      </div>
    </form>
  )
}
