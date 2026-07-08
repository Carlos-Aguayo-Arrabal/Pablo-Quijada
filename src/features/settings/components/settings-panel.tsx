'use client'

import { useState } from 'react'
import { Bell, Check, Globe, Lock, Mail, Save, Shield, Smartphone } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const notificationOptions = [
  { id: 'checkins', label: 'Avisos de check-ins', detail: 'Recibe una alerta cuando un cliente complete su revisión.' },
  { id: 'payments', label: 'Pagos y renovaciones', detail: 'Notificaciones de cobros fallidos, vencimientos y renovaciones.' },
  { id: 'messages', label: 'Mensajes sin responder', detail: 'Resumen de conversaciones pendientes al final del día.' },
]

export function SettingsPanel() {
  const [saved, setSaved] = useState(false)
  const [securityMessage, setSecurityMessage] = useState('')
  const [notifications, setNotifications] = useState(() => new Set(['checkins', 'payments']))
  const [timezone, setTimezone] = useState('Europe/Madrid')
  const [language, setLanguage] = useState('es')

  function toggleNotification(id: string) {
    setSaved(false)
    setNotifications((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Ajustes generales de tu espacio, seguridad y notificaciones.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#FF6A00]" />
              <h2 className="text-sm font-semibold text-white">Preferencias</h2>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">Idioma</span>
                <select value={language} onChange={(event) => { setLanguage(event.target.value); setSaved(false) }} className="input-field">
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">Zona horaria</span>
                <select value={timezone} onChange={(event) => { setTimezone(event.target.value); setSaved(false) }} className="input-field">
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                </select>
              </label>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#FFB000]" />
              <h2 className="text-sm font-semibold text-white">Seguridad</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: Lock, label: 'Cambiar contraseña', detail: 'Último cambio hace 30 días' },
                { icon: Smartphone, label: 'Sesiones activas', detail: '2 dispositivos conectados' },
                { icon: Mail, label: 'Email de recuperación', detail: 'carlosaguayoarrabal2026@gmail.com' },
              ].map((item) => (
                <button key={item.label} type="button" onClick={() => setSecurityMessage(`${item.label}: acción preparada en esta demo.`)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]">
                  <item.icon className="h-4 w-4 text-[#475569]" />
                  <span>
                    <span className="block text-sm font-medium text-white">{item.label}</span>
                    <span className="block text-xs text-[#94A3B8]">{item.detail}</span>
                  </span>
                </button>
              ))}
            </div>
            {securityMessage && (
              <p className="mt-3 rounded-xl border border-[#FFB000]/25 bg-[#FFB000]/10 px-3 py-2 text-xs text-[#DDE2FF]">
                {securityMessage}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#FB923C]" />
              <h2 className="text-sm font-semibold text-white">Notificaciones</h2>
            </div>
            <div className="space-y-3">
              {notificationOptions.map((option) => {
                const active = notifications.has(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleNotification(option.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:bg-white/[0.06]"
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', active ? 'border-[#FF6A00] bg-[#FF6A00] text-[#080C14]' : 'border-white/15 text-[#475569]')}>
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-white">{option.label}</span>
                      <span className="block text-xs text-[#94A3B8]">{option.detail}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/10 to-[#FFB000]/10 p-5">
            <h2 className="text-sm font-bold text-white">Guardar cambios</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">Los ajustes de esta demo se aplican en pantalla para validar el flujo.</p>
            <button type="button" onClick={() => setSaved(true)} className="btn-primary mt-4">
              <Save className="h-4 w-4" />
              Guardar configuración
            </button>
            {saved && (
              <p className="mt-3 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-3 py-2 text-xs text-[#FF6A00]">
                Configuración guardada correctamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
