'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, Loader2, MessageCircle, Send, UserPlus, X } from 'lucide-react'
import { createClient } from '@/features/clients/services/actions'

const services = [
  'Fuerza 12 semanas',
  'Pérdida de grasa',
  'Hipertrofia inicial',
  'Nutrición flexible',
  'Readaptación base',
]

export function InviteClientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState(services[0])
  const [group, setGroup] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [created, setCreated] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteUrl = useMemo(() => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return 'https://traintools.es/client/signup'
    return `https://traintools.es/client/signup?email=${encodeURIComponent(trimmedEmail)}`
  }, [email])

  const whatsappUrl = useMemo(() => {
    const message = `Hola${name ? ` ${name.split(' ')[0]}` : ''}! Te dejo tu acceso a TrainTools para ver tu plan, tus check-ins y hablar conmigo: ${inviteUrl}`
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }, [inviteUrl, name])

  async function handleSubmit() {
    setError(null)
    setIsSubmitting(true)

    const result = await createClient({ name, email, service, group })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setCreated(true)
    setIsSubmitting(false)
    router.refresh()
  }

  function copyLink() {
    navigator.clipboard?.writeText(inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111B26] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6A00]/15 text-[#FF6A00]">
              <UserPlus className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-black text-white">Invitar atleta</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!created ? (
          <>
            <p className="mb-5 text-sm text-[#94A3B8]">
              Crea el acceso de tu atleta. Le llegará un enlace para registrarse y vincularse a tu cuenta.
            </p>

            {error && (
              <div className="mb-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">Nombre</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" placeholder="Laura Martin" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">Email</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="input-field" placeholder="atleta@email.com" type="email" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Servicio</span>
                  <select value={service} onChange={(event) => setService(event.target.value)} className="input-field">
                    {services.map((item) => (
                      <option key={item} className="bg-[#0D1117]">{item}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Grupo (opcional)</span>
                  <input value={group} onChange={(event) => setGroup(event.target.value)} className="input-field" placeholder="Ej: Mañanas" />
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !name || !email}
              className="btn-primary mt-5 w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSubmitting ? 'Creando...' : 'Enviar invitación'}
            </button>
          </>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm font-semibold text-[#FF6A00]">
              <CheckCircle2 className="h-4 w-4" />
              {name} ya está creado. Comparte su enlace de acceso.
            </div>

            <div className="rounded-xl bg-[#0D1117]/70 p-4">
              <p className="text-xs text-[#475569]">Enlace de acceso</p>
              <p className="mt-1 break-all text-sm font-semibold text-[#FFB000]">{inviteUrl}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={copyLink} className="btn-secondary justify-center py-2.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary justify-center bg-[#25D366] py-2.5 text-sm hover:bg-[#20BD5A]">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <button type="button" onClick={onClose} className="btn-secondary mt-3 w-full justify-center py-2.5 text-sm">
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
