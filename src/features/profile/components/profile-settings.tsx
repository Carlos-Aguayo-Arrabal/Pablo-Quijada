'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  Copy,
  Info,
  Pencil,
  Save,
  UserCircle2,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const specialties = ['Fuerza', 'Hipertrofia', 'Nutrición', 'Readaptación', 'Pérdida de grasa']

export function ProfileSettings() {
  const [language, setLanguage] = useState<'English' | 'Spanish'>('Spanish')
  const [clientLanguage, setClientLanguage] = useState<'English' | 'Spanish'>('Spanish')
  const [marketplace, setMarketplace] = useState(true)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedSpecialties, setSelectedSpecialties] = useState(() => new Set(['Fuerza', 'Hipertrofia']))

  function save() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2600)
  }

  function copyLink() {
    navigator.clipboard?.writeText('https://traintools.es/marketplace/coaches/traintools')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  function toggleSpecialty(specialty: string) {
    setSelectedSpecialties((current) => {
      const next = new Set(current)
      if (next.has(specialty)) {
        next.delete(specialty)
      } else {
        next.add(specialty)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Perfil</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Configuración de cuenta, perfil profesional y portal del cliente.</p>
        </div>
        <button type="button" onClick={save} className="btn-primary w-fit">
          <Save className="h-4 w-4" />
          Guardar
        </button>
      </div>

      {saved && (
        <div className="mb-4 rounded-lg border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-4 py-3 text-sm text-[#FF6A00]">
          Cambios guardados correctamente.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.98fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-lg border border-white/[0.06] bg-[#101D2A] p-5">
            <h2 className="mb-5 text-lg font-bold text-white">Lenguaje y Región</h2>
            <div className="grid gap-5 sm:grid-cols-[170px_1fr] sm:items-center">
              <p className="text-sm text-[#C8D2E3]">Idioma</p>
              <Segmented value={language} onChange={setLanguage} />
              <p className="text-sm text-[#C8D2E3]">Región:</p>
              <p className="text-sm font-semibold text-white">Europe</p>
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#101D2A] p-5">
            <h2 className="mb-5 text-lg font-bold text-white">User Account</h2>
            <div className="grid gap-5 sm:grid-cols-[170px_1fr] sm:items-center">
              <p className="text-sm text-[#C8D2E3]">Inicio de sesión</p>
              <p className="text-sm font-semibold text-white">Sin asignar</p>
              <p className="text-sm text-[#C8D2E3]">Nombre de usuario</p>
              <p className="break-all text-sm font-semibold text-white">carlosaguayoarrabal2026@gmail.com</p>
              <p className="text-sm text-[#C8D2E3]">Contraseña</p>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/forgot-password" className="rounded-md bg-[#273747] px-4 py-2 text-sm font-semibold text-[#C8D2E3] transition hover:bg-[#324557]">
                  Actualizar contraseña
                </Link>
                <button
                  type="button"
                  onClick={save}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#FF6A00]/50 text-[#FFB000] transition hover:bg-[#FF6A00]/10"
                  aria-label="Información de contraseña"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-white/[0.06] bg-[#101D2A] p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Perfil profesional</h2>
              <AvatarUpload label="Adjuntar foto de perfil" />
            </div>
            <label className="block max-w-sm">
              <span className="mb-1 block text-xs text-[#C8D2E3]">Nombre</span>
              <input className="profile-input" defaultValue="TrainTools" />
            </label>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-[#101D2A] p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Portal del cliente</h2>
              <AvatarUpload label="Adjuntar foto del portal" />
            </div>

            <div className="space-y-5">
              <label className="block max-w-sm">
                <span className="mb-1 block text-xs text-[#C8D2E3]">Nombre completo *</span>
                <input className="profile-input" defaultValue="TrainTools" />
              </label>

              <div className="flex max-w-sm items-center gap-3">
                <input className="profile-input" placeholder="Nacionalidad" />
                <button
                  type="button"
                  onClick={save}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/[0.06]"
                  aria-label="Limpiar nacionalidad"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMarketplace((value) => !value)}
                className="flex items-center gap-3 text-left"
              >
                <span className={cn('flex h-5 w-10 items-center rounded-full p-0.5 transition', marketplace ? 'bg-[#FF6A00]' : 'bg-white/15')}>
                  <span className={cn('h-4 w-4 rounded-full bg-white transition', marketplace && 'translate-x-5')} />
                </span>
                <span className="text-sm font-semibold text-white">Mostrar tu perfil de entrenador en marketplace.</span>
              </button>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-1 block text-xs text-[#C8D2E3]">Enlace</span>
                  <input className="profile-input" readOnly value="https://traintools.es/marketplace/coaches/traintools" />
                </label>
                <button
                  type="button"
                  onClick={copyLink}
                  className="flex h-12 w-12 items-center justify-center rounded-md border border-[#7B8CA6]/60 text-[#9BACBF] transition hover:text-white"
                  aria-label="Copiar enlace"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              {copied && <p className="text-xs text-[#FF6A00]">Enlace copiado.</p>}

              <Segmented value={clientLanguage} onChange={setClientLanguage} />

              <label className="block">
                <span className="sr-only">Descripción personal</span>
                <textarea
                  className="profile-input min-h-28 resize-none"
                  placeholder="Descripción personal. 300 caracteres mínimo"
                  defaultValue="Ayudo a personas ocupadas a ganar músculo, perder grasa y mantener adherencia con entrenamiento estructurado y seguimiento semanal."
                />
              </label>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">
                  Especialidad - Selecciona una de ellas para indicar en que eres experto.
                </p>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => {
                    const selected = selectedSpecialties.has(specialty)
                    return (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm font-semibold transition',
                          selected
                            ? 'border-[#FF6A00] bg-[#FF6A00] text-[#0D1117]'
                            : 'border-white/10 bg-white/[0.04] text-[#C8D2E3] hover:border-[#FF6A00]/60'
                        )}
                      >
                        {specialty}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/client" className="btn-secondary px-4 py-2 text-sm">
                  Previsualizar portal
                </Link>
                <button type="button" onClick={save} className="btn-primary px-4 py-2 text-sm">
                  Guardar portal
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

interface AvatarUploadProps {
  label: string
}

function AvatarUpload({ label }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return URL.createObjectURL(file)
    })
  }

  return (
    <div className="relative h-16 w-16 shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
        aria-label={label}
      >
        {preview ? (
          <Image src={preview} alt={label} fill className="object-cover" unoptimized />
        ) : (
          <UserCircle2 className="h-16 w-16 text-[#7B8CA6]" strokeWidth={1.5} />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          <Pencil className="h-5 w-5 text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  )
}

interface SegmentedProps {
  value: 'English' | 'Spanish'
  onChange: (value: 'English' | 'Spanish') => void
}

function Segmented({ value, onChange }: SegmentedProps) {
  return (
    <div className="inline-flex w-fit overflow-hidden rounded-md border border-[#3A4B61] bg-[#132333]">
      {(['English', 'Spanish'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'px-4 py-2 text-sm font-bold transition',
            value === option ? 'bg-[#FF6A00] text-[#0D1117]' : 'text-white hover:bg-white/[0.06]'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
