import type { Metadata } from 'next'
import { SignupForm } from '@/features/auth/components/signup-form'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta TrainTools y empieza a gestionar tu negocio de coaching.',
}

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Prueba TrainTools 1 mes gratis</h1>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Crea tu espacio profesional y empieza con tus primeros clientes. Sin tarjeta.
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
