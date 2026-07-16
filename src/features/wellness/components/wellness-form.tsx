'use client'

import { useState } from 'react'
import { HeartPulse, Loader2 } from 'lucide-react'
import { submitWellnessCheck } from '@/features/wellness/services/actions'

const sliders = [
  { key: 'sueno', label: 'Sueño' },
  { key: 'estres', label: 'Estrés' },
  { key: 'dolor', label: 'Dolor' },
  { key: 'energia', label: 'Energía' },
] as const

type SliderKey = (typeof sliders)[number]['key']

export function WellnessForm() {
  const [values, setValues] = useState<Record<SliderKey, number>>({
    sueno: 5,
    estres: 5,
    dolor: 1,
    energia: 5,
  })
  const [notas, setNotas] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await submitWellnessCheck({ ...values, notas })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setSent(true)
    setNotas('')
    setIsSubmitting(false)
  }

  return (
    <form className="glass-card rounded-2xl p-5" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-brand" />
        <h2 className="text-sm font-semibold">Cuestionario de bienestar</h2>
      </div>
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
            {error}
          </p>
        )}
        {sliders.map((slider) => (
          <label key={slider.key} className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">
              {slider.label}: {values[slider.key]}/10
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={values[slider.key]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [slider.key]: Number(event.target.value) }))
              }
              className="w-full accent-brand"
            />
          </label>
        ))}
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Notas (opcional)</span>
          <textarea
            value={notas}
            onChange={(event) => setNotas(event.target.value)}
            className="input-field min-h-20 resize-none"
            placeholder="Ej: molestia en la rodilla desde ayer..."
          />
        </label>
        <button className="btn-primary w-full justify-center disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Enviar bienestar
        </button>
        {sent && (
          <p className="rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-brand">
            Cuestionario enviado. Tu entrenador lo verá en tu historial.
          </p>
        )}
      </div>
    </form>
  )
}
