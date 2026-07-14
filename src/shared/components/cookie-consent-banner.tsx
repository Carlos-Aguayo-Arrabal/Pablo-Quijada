'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const COOKIE_CONSENT_KEY = 'traintools-cookie-consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) {
      setVisible(true)
    }
  }, [])

  function choose(value: 'accepted' | 'rejected') {
    localStorage.setItem(COOKIE_CONSENT_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/[0.08] bg-[#0B111C]/97 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
        <p className="text-center text-sm text-[#94A3B8] sm:text-left">
          Usamos cookies de analítica (Google Analytics) para entender cómo se usa la app y mejorarla. Puedes aceptarlas o rechazarlas.{' '}
          <Link href="/privacy" className="font-medium text-[#FF6A00] hover:text-[#FFB000]">
            Política de privacidad
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="btn-primary px-4 py-2 text-xs"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
