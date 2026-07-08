import { GradientBackground } from '@/shared/components/gradient-background'
import { Check, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { BrandMark } from '@/shared/components/brand-mark'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GradientBackground className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center px-6 py-8 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.88fr_1fr] lg:items-center">
          <aside className="hidden lg:block">
            <Link href="/" className="mb-12 flex w-fit group">
              <BrandMark />
            </Link>

            <div className="max-w-md">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/25 bg-[#FF6A00]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Panel profesional
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
                Gestiona clientes, planes y pagos desde un solo lugar.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                Entra a tu espacio de trabajo para revisar check-ins, responder mensajes y controlar la operación de tu servicio de coaching.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { value: '42', label: 'Clientes' },
                  { value: '91%', label: 'Adherencia' },
                  { value: '€7.8k', label: 'MRR' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4">
                    <div className="text-2xl font-bold text-[#FF6A00]">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-[#94A3B8]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {[
                  'Rutinas, nutrición y check-ins conectados',
                  'Mensajes con contexto de cada cliente',
                  'Pagos, citas y renovaciones bajo control',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-[#C8D2E3]">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6A00]/15 text-[#FF6A00]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <p className="mt-10 text-sm text-[#475569]">
                &copy; {new Date().getFullYear()} TrainTools. Todos los derechos reservados.
              </p>
            </div>
          </aside>

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
