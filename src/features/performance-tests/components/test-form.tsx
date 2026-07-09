'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { TEST_CATEGORIES, type TestCategoria } from '@/features/performance-tests/data'
import { createPerformanceTest } from '@/features/performance-tests/services/actions'

export function TestForm({ clienteId }: { clienteId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [categoria, setCategoria] = useState<TestCategoria>('fuerza')
  const [nombre, setNombre] = useState('')
  const [valor, setValor] = useState('')
  const [unidad, setUnidad] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const parsedValor = Number(valor.replace(',', '.'))
    if (Number.isNaN(parsedValor)) {
      setError('El valor debe ser un número')
      return
    }

    setIsSubmitting(true)
    const result = await createPerformanceTest({ clienteId, categoria, nombre, valor: parsedValor, unidad })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setNombre('')
    setValor('')
    setUnidad('')
    setIsSubmitting(false)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn-primary w-fit px-4 py-2 text-xs">
        <Plus className="h-4 w-4" />
        Registrar test
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      {error && (
        <p className="mb-3 rounded-lg border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Categoría</span>
          <select
            value={categoria}
            onChange={(event) => setCategoria(event.target.value as TestCategoria)}
            className="input-field py-2 text-xs"
          >
            {TEST_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#0D1117]">
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Nombre del test</span>
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            className="input-field py-2 text-xs"
            placeholder="Ej: 1RM Sentadilla"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Valor</span>
          <input
            value={valor}
            onChange={(event) => setValor(event.target.value)}
            className="input-field py-2 text-xs"
            placeholder="Ej: 80"
            inputMode="decimal"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-[#475569]">Unidad</span>
          <input
            value={unidad}
            onChange={(event) => setUnidad(event.target.value)}
            className="input-field py-2 text-xs"
            placeholder="kg, seg, cm..."
            required
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary px-4 py-2 text-xs disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Guardar test
        </button>
        <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary px-4 py-2 text-xs">
          Cancelar
        </button>
      </div>
    </form>
  )
}
