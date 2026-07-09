'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'
import { retryClaimClientInvite } from '@/features/client/services/actions'

export function ClientInviteRetry() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRetry = async () => {
    setIsLoading(true)
    setError(null)

    const result = await retryClaimClientInvite()

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/client')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
        No encontramos una invitación pendiente para tu email en este momento.
      </div>
      {error && (
        <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleRetry}
        disabled={isLoading}
        className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        id="client-retry-claim"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        Reintentar
      </button>
      <p className="text-center text-xs text-[#94A3B8]">
        Si tu entrenador acaba de invitarte, puede que necesites unos segundos antes de reintentar.
      </p>
    </div>
  )
}
