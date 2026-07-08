import type { Metadata } from 'next'
import { KeyRound } from 'lucide-react'
import { UpdatePasswordForm } from '@/features/auth/components/update-password-form'

export const metadata: Metadata = {
  title: 'Actualizar contraseña',
}

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080C14] p-6 text-white">
      <div className="glass-card w-full max-w-md rounded-2xl p-6">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A00]/15">
          <KeyRound className="h-5 w-5 text-[#FF6A00]" />
        </div>
        <h1 className="text-2xl font-bold">Establece tu nueva contraseña</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Introduce una nueva contraseña para tu cuenta.</p>
        <UpdatePasswordForm />
      </div>
    </main>
  )
}
