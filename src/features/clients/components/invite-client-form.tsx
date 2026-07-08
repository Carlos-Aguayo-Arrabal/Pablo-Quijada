'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Mail, Send, UserPlus } from 'lucide-react'
import { createClient } from '@/features/clients/services/actions'

export function InviteClientForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState('Fuerza 12 semanas')
  const [message, setMessage] = useState('Te dejo acceso a tu portal con rutinas, check-ins y mensajes. Entra, revisa tu primera semana y dime cualquier duda.')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inviteUrl = useMemo(() => {
    const slug = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'nuevo-cliente'
    return `https://traintools.es/client/invite/${slug}`
  }, [name])

  async function sendInvite() {
    setError(null)
    setIsSubmitting(true)

    const result = await createClient({ name, email, service })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setSent(true)
    setIsSubmitting(false)
    router.push('/dashboard/clients')
  }

  function copyInvite() {
    navigator.clipboard?.writeText(inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <section className="glass-card rounded-2xl p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A00]/15">
            <UserPlus className="h-5 w-5 text-[#FF6A00]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Invitar cliente</h1>
            <p className="text-sm text-[#94A3B8]">Prepara acceso, servicio inicial y mensaje de bienvenida.</p>
          </div>
        </div>

        {sent && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm font-semibold text-[#FF6A00]">
            <CheckCircle2 className="h-4 w-4" />
            Cliente creado correctamente.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Nombre</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Laura Martin" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="cliente@email.com" type="email" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Servicio</span>
            <select value={service} onChange={(event) => setService(event.target.value)} className="input-field">
              <option className="bg-[#0D1117]">Fuerza 12 semanas</option>
              <option className="bg-[#0D1117]">Pérdida de grasa</option>
              <option className="bg-[#0D1117]">Hipertrofia inicial</option>
              <option className="bg-[#0D1117]">Nutrición flexible</option>
              <option className="bg-[#0D1117]">Readaptación base</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-[#94A3B8]">Primer check-in</span>
            <input className="input-field" type="date" defaultValue="2026-07-14" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Mensaje de bienvenida</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} className="input-field min-h-32 resize-none" />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={sendInvite} disabled={isSubmitting} className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Creando...' : 'Enviar invitación'}
          </button>
          <button type="button" onClick={copyInvite} className="btn-secondary">
            <Copy className="h-4 w-4" />
            Copiar enlace
          </button>
          <Link href="/dashboard/messages" className="btn-secondary">
            <Mail className="h-4 w-4" />
            Preparar mensaje
          </Link>
        </div>

        {copied && <p className="mt-3 text-sm font-semibold text-[#FF6A00]">Enlace copiado.</p>}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6A00]">Vista previa</p>
          <h2 className="mt-3 text-xl font-black text-white">{name || 'Nuevo cliente'}</h2>
          <p className="text-sm text-[#94A3B8]">{email || 'cliente@email.com'}</p>
          <div className="mt-5 rounded-xl bg-[#0D1117]/70 p-4">
            <p className="text-xs text-[#475569]">Servicio asignado</p>
            <p className="mt-1 text-sm font-bold text-white">{service}</p>
          </div>
          <div className="mt-3 rounded-xl bg-[#0D1117]/70 p-4">
            <p className="text-xs text-[#475569]">Enlace de acceso</p>
            <p className="mt-1 break-all text-sm font-semibold text-[#FFB000]">{inviteUrl}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white">Qué se crea al invitar</h3>
          <div className="mt-4 space-y-3 text-sm text-[#94A3B8]">
            <p>Portal cliente con acceso a entrenamientos, hábitos, nutrición y mensajes.</p>
            <p>Ficha interna con servicio, próximo check-in y estado pendiente de activación.</p>
            <p>Primer mensaje listo para enviar por email o WhatsApp.</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
