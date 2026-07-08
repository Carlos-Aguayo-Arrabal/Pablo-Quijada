'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await resetPassword(email)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setSent(true)
    setIsLoading(false)
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-4 py-4 text-sm text-white">
        Si existe una cuenta con ese email, te hemos enviado instrucciones para recuperar tu contraseña.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mt-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {error}
        </div>
      )}
      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs text-[#94A3B8]">Email</span>
        <input
          className="input-field"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <button type="submit" disabled={isLoading} className="btn-primary mt-5 w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
      </button>
    </form>
  )
}
