'use client'

import { useState } from 'react'
import { Check, Pencil, Users, X } from 'lucide-react'
import { updateClientGroup } from '@/features/clients/services/actions'

export function ClientGroupEditor({ clientId, initialGroup }: { clientId: string; initialGroup: string | null }) {
  const [group, setGroup] = useState(initialGroup ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState(initialGroup ?? '')

  async function handleSave() {
    setIsSaving(true)
    const result = await updateClientGroup(clientId, { group: draft.trim() })
    setIsSaving(false)
    if (!result?.error) {
      setGroup(draft.trim())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] py-1 pl-3 pr-1.5">
        <Users className="h-3.5 w-3.5 text-[#94A3B8]" />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ej: Fuerza · Mañanas"
          autoFocus
          className="w-40 bg-transparent text-xs text-white placeholder:text-[#475569] outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          aria-label="Guardar grupo"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[#FF6A00] hover:bg-white/[0.08] disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => { setDraft(group); setIsEditing(false) }}
          aria-label="Cancelar"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[#475569] hover:bg-white/[0.08]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => { setDraft(group); setIsEditing(true) }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#C8D2E3] transition hover:bg-white/[0.1]"
    >
      <Users className="h-3.5 w-3.5 text-[#FF6A00]" />
      {group || 'Sin grupo'}
      <Pencil className="h-3 w-3 text-[#475569]" />
    </button>
  )
}
