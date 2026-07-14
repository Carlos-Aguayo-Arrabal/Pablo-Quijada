import { GradientBackground } from '@/shared/components/gradient-background'
import { AuthShowcasePanel } from '@/shared/components/auth-showcase-panel'
import Link from 'next/link'
import { BrandMark } from '@/shared/components/brand-mark'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GradientBackground className="min-h-screen">
      <div className="flex items-center justify-end gap-2 px-6 py-4 sm:px-8 lg:px-12">
        <Link
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-white"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/signup"
          className="btn-primary px-4 py-2 text-sm"
        >
          Crear cuenta gratis
        </Link>
      </div>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 pb-8 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.88fr_1fr] lg:items-stretch">
          <AuthShowcasePanel />

          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px]">
              <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
                <BrandMark />
              </Link>

              <div className="rounded-3xl border border-white/[0.08] bg-[#0D1421]/78 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
    </GradientBackground>
  )
}
