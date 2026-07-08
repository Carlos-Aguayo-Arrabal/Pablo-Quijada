'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/actions/auth'

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await updatePassword(password)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mt-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {error}
        </div>
      )}
      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs text-[#94A3B8]">Nueva contraseña</span>
        <input
          className="input-field"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <button type="submit" disabled={isLoading} className="btn-primary mt-5 w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>
    </form>
  )
}
