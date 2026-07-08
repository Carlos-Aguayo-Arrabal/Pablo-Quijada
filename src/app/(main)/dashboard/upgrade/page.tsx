import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Planes',
}

const plans = [
  { name: 'Starter', price: '€19', desc: 'Para empezar con clientes online.', items: ['10 clientes', 'Planes y check-ins', 'Portal cliente'] },
  { name: 'Pro', price: '€49', desc: 'Para operar tu negocio completo.', items: ['Clientes ilimitados', 'Pagos y agenda', 'Mensajes y automatizaciones'], highlighted: true },
  { name: 'Studio', price: '€99', desc: 'Para centros y equipos.', items: ['Equipo multi-coach', 'Marca avanzada', 'Reportes de negocio'] },
]

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8">
        <div className="badge badge-teal mb-4">
          <Sparkles className="h-3 w-3" />
          Escala tu servicio
        </div>
        <h1 className="text-2xl font-bold text-white">Planes de TrainTools</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Elige el plan que encaja con tu volumen de clientes y automatizaciones.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={plan.highlighted ? 'rounded-2xl border-2 border-[#FF6A00]/35 bg-[#FF6A00]/10 p-6' : 'glass-card rounded-2xl p-6'}>
            <h2 className="text-lg font-bold text-white">{plan.name}</h2>
            <p className="mt-1 min-h-10 text-sm text-[#94A3B8]">{plan.desc}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="text-sm text-[#94A3B8]">/mes</span>
            </div>
            <div className="mt-5 space-y-2">
              {plan.items.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <Check className="h-4 w-4 text-[#FF6A00]" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/dashboard/payments" className={plan.highlighted ? 'btn-primary mt-6 w-full justify-center' : 'btn-secondary mt-6 w-full justify-center'}>
              Seleccionar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
