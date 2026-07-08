import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080C14] p-6 text-white">
      <div className="glass-card w-full max-w-md rounded-2xl p-6">
        <Link href="/auth/login/L2Rhc2hib2FyZA%3D%3D" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </Link>
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A00]/15">
          <Mail className="h-5 w-5 text-[#FF6A00]" />
        </div>
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Introduce tu email y te enviaremos instrucciones para volver a entrar.</p>
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
