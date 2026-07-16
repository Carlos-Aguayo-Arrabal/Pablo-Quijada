'use client'

import { useMemo, useState, type ComponentType } from 'react'
import Link from 'next/link'
import {
  Bell,
  Check,
  CircleHelp,
  ExternalLink,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { markAllNotificationsRead, markNotificationRead, sendTestNotification, type NotificationItem } from '@/features/notifications/services/actions'
import { usePushSubscription } from '@/features/notifications/hooks/use-push-subscription'

type WorkspaceMode = 'admin' | 'client'
type ActivePanel = 'help' | 'notifications' | 'settings' | null

interface WorkspaceActionsProps {
  mode: WorkspaceMode
  userId?: string
  userName?: string
  userEmail?: string
  settingsHref?: string
  compact?: boolean
  notifications?: NotificationItem[]
}

const modeCopy = {
  admin: {
    label: 'Coach',
    detail: 'Gestionas clientes, programas, pagos y mensajes',
    tone: 'border-brand/25 bg-brand/10 text-brand',
    icon: ShieldCheck,
  },
  client: {
    label: 'Portal cliente',
    detail: 'Vista de entrenamiento, hábitos y check-ins',
    tone: 'border-brand2/25 bg-brand2/10 text-brand2',
    icon: UserRound,
  },
}

const notificationSeeds = {
  admin: [
    { id: 'checkin', title: '3 check-ins pendientes', detail: 'Revisa respuestas y adherencia de hoy.' },
    { id: 'message', title: '2 mensajes sin responder', detail: 'Clientes esperando feedback.' },
    { id: 'payment', title: '1 pago vence mañana', detail: 'Renovación mensual pendiente.' },
  ],
  client: [
    { id: 'workout', title: 'Entrenamiento de hoy listo', detail: 'Fuerza torso + core, 45 minutos.' },
    { id: 'habit', title: 'Hábito pendiente', detail: 'Aún falta registrar agua y pasos.' },
    { id: 'coach', title: 'Mensaje de tu coach', detail: 'Revisa la pauta antes de entrenar.' },
  ],
}

export function WorkspaceActions({
  mode,
  userId,
  userName = mode === 'admin' ? 'Coach' : 'Cliente',
  userEmail,
  settingsHref,
  compact = false,
  notifications: realNotifications,
}: WorkspaceActionsProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [testError, setTestError] = useState<string | null>(null)
  const push = usePushSubscription(userId)
  const copy = modeCopy[mode]
  const ModeIcon = copy.icon
  const usingRealData = realNotifications !== undefined
  const notifications = useMemo(
    () =>
      realNotifications
        ? realNotifications.map((item) => ({ id: item.id, title: item.title, detail: item.detail, seededRead: item.read }))
        : notificationSeeds[mode].map((item) => ({ ...item, seededRead: false })),
    [realNotifications, mode]
  )
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.seededRead && !readIds.has(item.id)).length,
    [notifications, readIds]
  )

  function togglePanel(panel: Exclude<ActivePanel, null>) {
    setActivePanel((current) => current === panel ? null : panel)
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((item) => item.id)))
    if (usingRealData) void markAllNotificationsRead()
  }

  function markOneRead(id: string) {
    setReadIds((current) => new Set(current).add(id))
    if (usingRealData) void markNotificationRead(id)
  }

  return (
    <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
      <div className={cn(
        'hidden min-w-0 items-center gap-3 rounded-2xl border px-3 py-2 md:flex',
        copy.tone,
        compact && 'md:flex'
      )}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#080C14]/70">
          <ModeIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-black uppercase tracking-[0.14em]">{copy.label}</span>
          {!compact && <span className="block truncate text-[11px] text-[#94A3B8]">{copy.detail}</span>}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ActionButton icon={CircleHelp} label="Ayuda" active={activePanel === 'help'} onClick={() => togglePanel('help')} />
        <button
          type="button"
          onClick={() => togglePanel('notifications')}
          aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
          title="Notificaciones"
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#94A3B8] transition hover:border-brand/40 hover:text-white',
            activePanel === 'notifications' && 'border-brand/40 bg-brand/10 text-brand'
          )}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-black text-[#080C14]">
              {unreadCount}
            </span>
          )}
        </button>
        {/* El entrenador ya tiene "Configuración" + usuario + cerrar sesión en el
            sidebar — repetirlo aquí era redundante. El cliente no tiene sidebar,
            así que para él este es el único sitio donde ajustar notificaciones. */}
        {mode === 'client' && (
          <ActionButton icon={Settings} label="Ajustes" active={activePanel === 'settings'} onClick={() => togglePanel('settings')} />
        )}
      </div>

      {activePanel && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111B26] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div>
              <p className="text-sm font-black text-white">{panelTitle(activePanel)}</p>
              <p className="text-xs text-[#94A3B8]">{copy.label} · {userName}</p>
            </div>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
              aria-label="Cerrar panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {activePanel === 'help' && (
            <div className="space-y-3 p-4">
              <HelpItem title={mode === 'admin' ? 'Centro de ayuda para coaches' : 'Ayuda del portal cliente'} detail={mode === 'admin' ? 'Guías para crear programas, gestionar pagos y responder check-ins.' : 'Consulta cómo completar entrenamientos, check-ins y hábitos.'} />
              <HelpItem title="Atajos rápidos" detail={mode === 'admin' ? 'Planes, clientes y mensajes están en el menú lateral.' : 'Marca ejercicios, registra cargas y envía dudas desde esta pantalla.'} />
              <button type="button" className="btn-secondary w-full justify-center px-4 py-2 text-xs">
                <CircleHelp className="h-4 w-4" />
                Contactar soporte
              </button>
            </div>
          )}

          {activePanel === 'notifications' && (
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-[#94A3B8]">{unreadCount} sin leer</p>
                <button type="button" onClick={markAllRead} className="text-xs font-bold text-brand hover:text-brand2">
                  Marcar leídas
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => {
                  const isRead = item.seededRead || readIds.has(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markOneRead(item.id)}
                      className="flex w-full gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
                    >
                      <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', isRead ? 'bg-[#475569]' : 'bg-brand')} />
                      <span>
                        <span className="block text-sm font-bold text-white">{item.title}</span>
                        <span className="block text-xs leading-relaxed text-[#94A3B8]">{item.detail}</span>
                      </span>
                    </button>
                  )
                })}
                {notifications.length === 0 && (
                  <p className="px-1 py-2 text-sm text-[#94A3B8]">No tienes notificaciones todavía.</p>
                )}
              </div>
            </div>
          )}

          {activePanel === 'settings' && (
            <div className="space-y-3 p-4">
              {usingRealData && push.isSupported ? (
                <label className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white">
                  Alertas push
                  <input
                    type="checkbox"
                    checked={push.isSubscribed}
                    disabled={push.loading}
                    className="h-4 w-4 accent-brand"
                    onChange={(event) => (event.target.checked ? push.subscribe() : push.unsubscribe())}
                  />
                </label>
              ) : (
                <label className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white">
                  Alertas push
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand" onChange={() => setSaved(false)} />
                </label>
              )}
              {usingRealData && push.isSupported && push.isSubscribed && (
                <button
                  type="button"
                  onClick={async () => {
                    setTestStatus('sending')
                    setTestError(null)
                    const result = await sendTestNotification()
                    if (result.error) {
                      setTestStatus('error')
                      setTestError(result.error)
                      return
                    }
                    setTestStatus('sent')
                  }}
                  disabled={testStatus === 'sending'}
                  className="btn-secondary w-full justify-center px-4 py-2 text-xs disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" />
                  {testStatus === 'sending' ? 'Enviando...' : 'Enviar notificación de prueba'}
                </button>
              )}
              {testStatus === 'sent' && (
                <p className="rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-brand">
                  Enviada. Debería llegarte al móvil en unos segundos.
                </p>
              )}
              {testStatus === 'error' && testError && (
                <p className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
                  {testError}
                </p>
              )}
              <label className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white">
                Resumen diario
                <input type="checkbox" defaultChecked={mode === 'admin'} className="h-4 w-4 accent-brand" onChange={() => setSaved(false)} />
              </label>
              {userEmail && <p className="rounded-xl bg-white/[0.03] px-3 py-2 text-xs text-[#94A3B8]">{userEmail}</p>}
              <button type="button" onClick={() => setSaved(true)} className="btn-primary w-full justify-center px-4 py-2 text-xs">
                <Check className="h-4 w-4" />
                Guardar ajustes rápidos
              </button>
              {settingsHref && (
                <Link href={settingsHref} className="btn-secondary w-full justify-center px-4 py-2 text-xs" onClick={() => setActivePanel(null)}>
                  <ExternalLink className="h-4 w-4" />
                  Abrir configuración completa
                </Link>
              )}
              {saved && (
                <p className="rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-brand">
                  Ajustes guardados para esta sesión.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#94A3B8] transition hover:border-brand/40 hover:text-white',
        active && 'border-brand/40 bg-brand/10 text-brand'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function HelpItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{detail}</p>
    </div>
  )
}

function panelTitle(panel: Exclude<ActivePanel, null>) {
  if (panel === 'help') return 'Ayuda'
  if (panel === 'notifications') return 'Notificaciones'
  return 'Ajustes'
}
