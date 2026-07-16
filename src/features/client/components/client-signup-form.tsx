'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { signupClient } from '@/features/client/services/actions'

const clientSignupSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').optional(),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos una mayúscula')
      .regex(/[0-9]/, 'Al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ClientSignupFormData = z.infer<typeof clientSignupSchema>

export function ClientSignupForm() {
  const searchParams = useSearchParams()
  const invitedEmail = searchParams.get('email') ?? ''
  const inviteCode = searchParams.get('code') ?? ''

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClientSignupFormData>({
    resolver: zodResolver(clientSignupSchema),
    defaultValues: { email: invitedEmail },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const onSubmit = async (data: ClientSignupFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await signupClient({ name: data.name, email: data.email, password: data.password, code: inviteCode || undefined })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setNeedsConfirmation(true)
    setIsLoading(false)
  }

  if (needsConfirmation) {
    return (
      <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-6 text-center">
        <p className="text-sm font-medium text-white">Revisa tu email</p>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Te hemos enviado un enlace de confirmación. Al confirmarlo entrarás directamente a tu portal.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="client-signup-form">
      {error && (
        <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      {inviteCode && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#94A3B8]">Nombre</label>
          <input
            {...register('name')}
            type="text"
            placeholder="Tu nombre completo"
            className={cn('input-field', errors.name && 'border-[#F87171]/50')}
            id="client-signup-name"
          />
          {errors.name && <p className="text-xs text-[#F87171]">{errors.name.message}</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Email</label>
        <input
          {...register('email')}
          type="email"
          placeholder="tu@email.com"
          className={cn('input-field', errors.email && 'border-[#F87171]/50')}
          id="client-signup-email"
        />
        {!inviteCode && (
          <p className="text-xs text-[#475569]">Debe coincidir con el email al que tu entrenador te invitó.</p>
        )}
        {errors.email && <p className="text-xs text-[#F87171]">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Contraseña</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            className={cn('input-field pr-11', errors.password && 'border-[#F87171]/50')}
            id="client-signup-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors"
            id="toggle-client-signup-password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="flex gap-3">
            {Object.entries(passwordChecks).map(([key, ok]) => (
              <div key={key} className={cn('flex items-center gap-1 text-xs', ok ? 'text-brand' : 'text-[#475569]')}>
                <Check className={cn('h-3 w-3', !ok && 'opacity-30')} />
                <span>{key === 'length' ? '8+ chars' : key === 'uppercase' ? 'Mayúscula' : 'Número'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Confirmar contraseña</label>
        <input
          {...register('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          className={cn('input-field', errors.confirmPassword && 'border-[#F87171]/50')}
          id="client-signup-confirm-password"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[#F87171]">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        id="client-signup-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            Activar mi acceso
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
