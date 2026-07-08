'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { signup } from '@/actions/auth'

const signupSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos una mayúscula')
      .regex(/[0-9]/, 'Al menos un número'),
    confirmPassword: z.string(),
    goal: z.enum(['perder-peso', 'ganar-musculo', 'resistencia', 'salud-general']),
    acceptTerms: z.boolean().refine((v) => v, 'Debes aceptar los términos'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

const goals = [
  { value: 'perder-peso', label: '🔥 Perder peso', desc: 'Quema grasa y define tu cuerpo' },
  { value: 'ganar-musculo', label: '💪 Ganar músculo', desc: 'Hipertrofia y fuerza' },
  { value: 'resistencia', label: '🏃 Resistencia', desc: 'Cardio y rendimiento' },
  { value: 'salud-general', label: '❤️ Salud general', desc: 'Bienestar y movilidad' },
] as const

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { goal: 'salud-general', acceptTerms: false },
  })

  const selectedGoal = useWatch({ control, name: 'goal' })
  const password = useWatch({ control, name: 'password' }) ?? ''

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
      goal: data.goal,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    if (result.needsConfirmation) {
      setNeedsConfirmation(true)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (needsConfirmation) {
    return (
      <div className="rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-4 py-6 text-center">
        <p className="text-sm font-medium text-white">Revisa tu email</p>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Te hemos enviado un enlace de confirmación para activar tu cuenta.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="signup-form">
      {error && (
        <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-4 py-3 text-sm text-[#F87171]">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Nombre completo</label>
        <input
          {...register('name')}
          placeholder="Carlos García"
          className={cn('input-field', errors.name && 'border-[#F87171]/50')}
          id="signup-name"
        />
        {errors.name && <p className="text-xs text-[#F87171]">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Email</label>
        <input
          {...register('email')}
          type="email"
          placeholder="tu@email.com"
          className={cn('input-field', errors.email && 'border-[#F87171]/50')}
          id="signup-email"
        />
        {errors.email && <p className="text-xs text-[#F87171]">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Contraseña</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            className={cn('input-field pr-11', errors.password && 'border-[#F87171]/50')}
            id="signup-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8] transition-colors"
            id="toggle-signup-password"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {/* Password strength */}
        {password.length > 0 && (
          <div className="flex gap-3">
            {Object.entries(passwordChecks).map(([key, ok]) => (
              <div key={key} className={cn('flex items-center gap-1 text-xs', ok ? 'text-[#FF6A00]' : 'text-[#475569]')}>
                <Check className={cn('h-3 w-3', !ok && 'opacity-30')} />
                <span>
                  {key === 'length' ? '8+ chars' : key === 'uppercase' ? 'Mayúscula' : 'Número'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-[#94A3B8]">Confirmar contraseña</label>
        <input
          {...register('confirmPassword')}
          type={showPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          className={cn('input-field', errors.confirmPassword && 'border-[#F87171]/50')}
          id="signup-confirm-password"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[#F87171]">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Goal selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#94A3B8]">¿Cuál es tu objetivo?</label>
        <div className="grid grid-cols-2 gap-2">
          {goals.map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => setValue('goal', goal.value)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all duration-200',
                selectedGoal === goal.value
                  ? 'border-[#FF6A00]/40 bg-[#FF6A00]/10'
                  : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/5'
              )}
              id={`goal-${goal.value}`}
            >
              <div className="text-sm">{goal.label}</div>
              <div className="text-xs text-[#475569]">{goal.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          {...register('acceptTerms')}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#FF6A00]"
          id="signup-terms"
        />
        <span className="text-xs text-[#94A3B8] leading-relaxed">
          Acepto los{' '}
          <Link href="/terms" className="text-[#FF6A00] hover:underline">términos de servicio</Link>
          {' '}y la{' '}
          <Link href="/privacy" className="text-[#FF6A00] hover:underline">política de privacidad</Link>
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-xs text-[#F87171]">{errors.acceptTerms.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        id="signup-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          <>
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-[#94A3B8]">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login/L2Rhc2hib2FyZA%3D%3D" className="font-medium text-[#FF6A00] hover:text-[#FFB000] transition-colors">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
