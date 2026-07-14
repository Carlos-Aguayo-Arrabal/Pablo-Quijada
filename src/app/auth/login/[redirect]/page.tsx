import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'
import { getHelpResources } from '@/features/settings/services/actions'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accede a tu panel TrainTools.',
}

function decodeRedirect(value: string) {
  try {
    const decoded = Buffer.from(decodeURIComponent(value), 'base64').toString('utf8')
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/dashboard'
    return decoded
  } catch {
    return '/dashboard'
  }
}

export default async function AuthLoginPage({
  params,
}: {
  params: Promise<{ redirect: string }>
}) {
  const { redirect } = await params
  const redirectTo = decodeRedirect(redirect)
  const helpResources = await getHelpResources()

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6A00]">
          Acceso seguro
        </p>
        <h1 className="text-2xl font-bold text-white">Bienvenido de nuevo</h1>
        <p className="mt-1.5 text-sm text-[#94A3B8]">
          Inicia sesión para continuar hacia {redirectTo}.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} manualUrl={helpResources.manualUrl} videoUrl={helpResources.videoUrl} />
    </div>
  )
}
