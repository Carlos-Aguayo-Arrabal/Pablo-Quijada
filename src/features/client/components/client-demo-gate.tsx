'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, PlayCircle } from 'lucide-react'
import { startClientDemo } from '@/features/client/services/actions'

export function ClientDemoGate() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemo = async () => {
    setIsLoading(true)
    await startClientDemo()
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080C14] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-white">Portal del cliente</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Si tu entrenador ya te invitó, inicia sesión con tu cuenta. Si solo quieres ver cómo funciona,
          prueba el modo demo — no se guarda nada.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleDemo}
            disabled={isLoading}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            id="client-demo-button"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            {isLoading ? 'Cargando demo...' : 'Ver demo interactiva'}
          </button>

          <Link href="/login" className="btn-secondary w-full justify-center py-3 text-sm">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
