'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ArrowRight, MessageSquare, Search, Send } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { listMessages, sendMessage } from '@/features/messages/services/actions'
import type { MessageItem, MessageThread } from '@/features/messages/types'

interface MessageCenterProps {
  threads: MessageThread[]
  initialMessages: MessageItem[]
}

export function MessageCenter({ threads, initialMessages }: MessageCenterProps) {
  const [selected, setSelected] = useState(threads[0] ?? null)
  const [messages, setMessages] = useState(initialMessages)
  const [reply, setReply] = useState('')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const visibleThreads = threads.filter((thread) =>
    thread.clientName.toLowerCase().includes(query.trim().toLowerCase())
  )

  function selectThread(thread: MessageThread) {
    setSelected(thread)
    startTransition(async () => {
      const data = await listMessages(thread.clientId)
      setMessages(data)
    })
  }

  function submitReply() {
    const trimmed = reply.trim()
    if (!trimmed || !selected) return

    const optimistic: MessageItem = { id: `temp-${Date.now()}`, sender: 'coach', body: trimmed, time: 'Ahora' }
    setMessages((current) => [...current, optimistic])
    setReply('')

    startTransition(async () => {
      await sendMessage(selected.clientId, trimmed)
    })
  }

  if (!selected) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-lg font-bold text-white">Todavía no hay conversaciones</p>
        <p className="mt-2 text-sm text-[#94A3B8]">Cuando invites clientes y te escriban, sus mensajes aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="glass-card rounded-2xl p-5">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input-field pl-10"
            placeholder="Buscar conversación..."
          />
        </div>
        <div className="space-y-2">
          {visibleThreads.map((thread) => (
            <button
              key={thread.clientId}
              type="button"
              onClick={() => selectThread(thread)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                selected.clientId === thread.clientId
                  ? 'border-[#FF6A00]/45 bg-[#FF6A00]/10'
                  : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFB000]/20 text-sm font-bold text-white">
                {thread.clientName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">{thread.clientName}</p>
                  <span className="text-[11px] text-[#475569]">{thread.time}</span>
                </div>
                <p className="truncate text-xs text-[#94A3B8]">{thread.preview}</p>
              </div>
              {thread.unread && <span className="h-2 w-2 rounded-full bg-[#FF6A00]" />}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <MessageSquare className="h-4 w-4 text-[#FFB000]" />
          <h2 className="text-sm font-semibold text-white">{selected.clientName}</h2>
        </div>
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'max-w-[82%] rounded-2xl p-3 text-sm',
                message.sender === 'coach'
                  ? 'ml-auto bg-[#FF6A00]/14 text-[#CFFBE9]'
                  : 'bg-[#FFB000]/12 text-[#DDE2FF]'
              )}
            >
              {message.body}
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-sm text-[#94A3B8]">Todavía no hay mensajes con {selected.clientName}.</p>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <input
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitReply()}
            className="input-field"
            placeholder="Escribe respuesta..."
          />
          <button
            type="button"
            onClick={submitReply}
            disabled={isPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00] text-[#080C14] disabled:opacity-60"
            aria-label="Enviar respuesta"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <Link href={`/dashboard/clients/${selected.clientId}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#FF6A00]">
          Abrir ficha de {selected.clientName}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
