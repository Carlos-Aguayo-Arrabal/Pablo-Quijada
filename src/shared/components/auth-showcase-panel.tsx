import { Check, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { BrandMark } from '@/shared/components/brand-mark'

export function AuthShowcasePanel() {
  return (
    <aside className="relative hidden overflow-hidden rounded-[2rem] p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A1A] via-[#B23D0A] to-[#170800]" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#FFB000]/30 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-[380px] w-[380px] rounded-full bg-[#080C14]/50 blur-[100px]" />

      <div className="relative z-10">
        <Link href="/" className="mb-12 flex w-fit [&_p:last-child]:text-white/70">
          <BrandMark />
        </Link>

        <div className="max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
            Panel profesional
          </div>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
            Gestiona clientes, planes y pagos desde un solo lugar.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Entra a tu espacio de trabajo para revisar check-ins, responder mensajes y controlar la operación de tu servicio de coaching.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: '42', label: 'Clientes' },
            { value: '91%', label: 'Adherencia' },
            { value: '€7.8k', label: 'MRR' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-0.5 text-xs text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {[
            'Rutinas, nutrición y check-ins conectados',
            'Mensajes con contexto de cada cliente',
            'Pagos, citas y renovaciones bajo control',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
              {item}
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-white/50">
          &copy; {new Date().getFullYear()} TrainTools. Todos los derechos reservados.
        </p>
      </div>
    </aside>
  )
}
