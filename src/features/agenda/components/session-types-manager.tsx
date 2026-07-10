'use client'

import { useState, useTransition } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { createSessionType, deleteSessionType, updateSessionType } from '@/features/agenda/services/actions'
import type { SessionType } from '@/features/agenda/data'

export function SessionTypesManager({ initialTypes }: { initialTypes: SessionType[] }) {
  const [types, setTypes] = useState(initialTypes)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#FF6A00')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const result = await createSessionType({ nombre: newName, color: newColor })
    if (result.error) {
      setError(result.error)
      return
    }

    setTypes((current) => [...current, { id: `pending-${Date.now()}`, nombre: newName, color: newColor }])
    setNewName('')
    setNewColor('#FF6A00')
    setIsCreating(false)
  }

  function handleColorChange(id: string, color: string) {
    setTypes((current) => current.map((t) => (t.id === id ? { ...t, color } : t)))
    startTransition(() => {
      updateSessionType(id, { color })
    })
  }

  function handleDelete(id: string) {
    setTypes((current) => current.filter((t) => t.id !== id))
    startTransition(() => {
      deleteSessionType(id)
    })
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-white">Tipos de sesión</h2>
          <p className="text-xs text-[#94A3B8]">Categoriza tus sesiones para organizarlas por color.</p>
        </div>
        {!isCreating && (
          <button type="button" onClick={() => setIsCreating(true)} className="btn-primary w-fit px-4 py-2 text-xs">
            <Plus className="h-4 w-4" />
            Crear tipo de sesión
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          {error && (
            <p className="w-full rounded-lg border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-[11px] text-[#475569]">Nombre</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field py-2 text-xs"
              placeholder="Ej: Nutrición"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-[#475569]">Color</span>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-9 w-14 rounded-lg border border-white/[0.08] bg-transparent"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary px-4 py-2 text-xs">Guardar</button>
            <button type="button" onClick={() => setIsCreating(false)} className="btn-secondary px-4 py-2 text-xs">Cancelar</button>
          </div>
        </form>
      )}

      {types.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#94A3B8]">
          Todavía no has creado ningún tipo de sesión.
        </p>
      ) : (
        <div className="space-y-2">
          {types.map((type) => (
            <div key={type.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={type.color}
                  onChange={(e) => handleColorChange(type.id, e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded-full border border-white/[0.1] bg-transparent"
                  aria-label={`Color de ${type.nombre}`}
                />
                <span className="text-sm font-semibold text-white">{type.nombre}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(type.id)}
                disabled={isPending}
                className="text-[#475569] hover:text-[#F87171] disabled:opacity-50"
                aria-label={`Eliminar ${type.nombre}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isPending && <Loader2 className="mt-3 h-4 w-4 animate-spin text-[#94A3B8]" />}
    </section>
  )
}
