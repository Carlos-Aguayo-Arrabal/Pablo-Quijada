'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { usePushSubscription } from '@/features/notifications/hooks/use-push-subscription'

interface PushNotificationPromptProps {
  userId?: string
  autoShowDelay?: number
}

export function PushNotificationPrompt({ userId, autoShowDelay = 3000 }: PushNotificationPromptProps) {
  const { isSupported, permission, isSubscribed, subscribe } = usePushSubscription(userId)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isSupported || isSubscribed || permission === 'denied') return

    const dismissed = localStorage.getItem('push-prompt-dismissed')
    if (dismissed) return

    const timer = setTimeout(() => setShow(true), autoShowDelay)
    return () => clearTimeout(timer)
  }, [isSupported, isSubscribed, permission, autoShowDelay])

  if (!show) return null

  const handleEnable = async () => {
    localStorage.setItem('push-prompt-dismissed', 'true')
    await subscribe()
    setShow(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('push-prompt-dismissed', 'true')
    setShow(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-3 rounded-2xl border border-white/[0.08] bg-[#111B26] p-4 shadow-2xl shadow-black/30">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF6A00]/15 text-[#FF6A00]">
          <Bell className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-white">¿Activar notificaciones?</p>
      </div>
      <p className="text-xs leading-relaxed text-[#94A3B8]">
        Recibe avisos de mensajes y check-ins nuevos incluso con la app cerrada.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={handleEnable} className="btn-primary px-3 py-1.5 text-xs">
          Activar
        </button>
        <button type="button" onClick={handleDismiss} className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-white">
          Ahora no
        </button>
      </div>
    </div>
  )
}
