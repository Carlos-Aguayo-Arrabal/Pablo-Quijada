'use client'

import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { sendMyMessage } from '@/features/client/services/actions'
import type { MyMessage } from '@/features/client/types'

export function CoachChat({ initialMessages }: { initialMessages: MyMessage[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    const optimistic: MyMessage = {
      id: `optimistic-${Date.now()}`,
      remitente: 'cliente',
      contenido: trimmed,
      creadoEn: new Date().toISOString(),
    }
    setMessages((current) => [...current, optimistic])
    setDraft('')

    const result = await sendMyMessage(trimmed)
    if (result.error) {
      setMessages((current) => current.filter((m) => m.id !== optimistic.id))
    }
    setIsSending(false)
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-brand2" />
        <h2 className="text-sm font-semibold">Mensajes con tu entrenador</h2>
      </div>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="rounded-xl bg-white/[0.03] p-3 text-xs text-[#94A3B8]">
            Todavía no hay mensajes. Escribe la primera duda.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'rounded-xl p-3 text-sm',
              m.remitente === 'entrenador' ? 'bg-brand2/10 text-[#DDE2FF]' : 'ml-6 bg-brand/10 text-white'
            )}
          >
            {m.contenido}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSend()
            }
          }}
          className="input-field"
          placeholder="Escribe una duda..."
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-[#080C14] disabled:opacity-60"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
