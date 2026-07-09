import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ClientSignupForm } from '@/features/client/components/client-signup-form'

export const metadata: Metadata = {
  title: 'Activa tu acceso',
  description: 'Crea tu contraseña para acceder a tu portal de entrenamiento.',
}

export default function ClientSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080C14] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Activa tu acceso</h1>
          <p className="mt-1.5 text-sm text-[#94A3B8]">
            Tu entrenador te ha invitado a TrainTools. Crea tu contraseña para entrar a tu portal.
          </p>
        </div>
        <Suspense fallback={null}>
          <ClientSignupForm />
        </Suspense>
      </div>
    </div>
  )
}
