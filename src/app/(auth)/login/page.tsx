import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu panel TrainTools.',
}

export default function LoginPage() {
  redirect('/auth/login/L2Rhc2hib2FyZA%3D%3D')
}
