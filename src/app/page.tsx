import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeEuro,
  CalendarCheck,
  Check,
  ClipboardList,
  Dumbbell,
  LineChart,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { Navbar } from '@/shared/components/navbar'
import { GradientBackground } from '@/shared/components/gradient-background'

export const metadata: Metadata = {
  title: 'TrainTools — Gestiona tu negocio fitness',
  description:
    'Plataforma para entrenadores, nutricionistas y centros wellness: clientes, rutinas, nutrición, citas, pagos y seguimiento en un solo lugar.',
}

const features = [
  {
    icon: Users,
    title: 'Clientes centralizados',
    desc: 'Ficha completa, objetivos, estado del servicio, actividad reciente y tareas pendientes sin saltar entre WhatsApp, Excel y PDFs.',
    color: '#FF6A00',
  },
  {
    icon: Dumbbell,
    title: 'Rutinas y programas',
    desc: 'Crea planes por días, adjunta vídeos, repeticiones, cargas, descansos y notas para que cada cliente sepa exactamente qué hacer.',
    color: '#FFB000',
  },
  {
    icon: ClipboardList,
    title: 'Nutrición y hábitos',
    desc: 'Organiza menús, alternativas, check-ins y hábitos diarios para acompañar el progreso más allá del entrenamiento.',
    color: '#FB923C',
  },
  {
    icon: MessageSquare,
    title: 'Chat y comunidad',
    desc: 'Mantén la conversación dentro del servicio, con contexto de cada plan y mensajes accionables.',
    color: '#FF6A00',
  },
  {
    icon: BadgeEuro,
    title: 'Pagos recurrentes',
    desc: 'Controla ingresos, renovaciones, pagos pendientes y servicios activos desde un panel sencillo.',
    color: '#FFB000',
  },
  {
    icon: Sparkles,
    title: 'Asistente IA para coaches',
    desc: 'Genera borradores de rutinas, respuestas, ajustes de plan y resúmenes de seguimiento en minutos.',
    color: '#FB923C',
  },
]

const stats = [
  { value: '42', label: 'clientes activos' },
  { value: '€7.8k', label: 'MRR previsto' },
  { value: '91%', label: 'adherencia semanal' },
  { value: '18', label: 'check-ins hoy' },
]

const workflow = [
  {
    title: 'Crea tu servicio y precio',
    desc: 'Define el servicio, el precio mensual y qué incluye en pocos minutos.',
  },
  {
    title: 'Invita clientes a su app',
    desc: 'Cada cliente recibe su propio acceso para ver su plan y hablar contigo.',
  },
  {
    title: 'Asigna planes y tareas',
    desc: 'Reparte rutinas, nutrición y check-ins según el objetivo de cada uno.',
  },
  {
    title: 'Mide progreso y cobra a tiempo',
    desc: 'Sigue la adherencia y gestiona pagos y renovaciones desde el mismo panel.',
  },
]

export default function HomePage() {
  return (
    <GradientBackground intensity="normal">
      <Navbar />

      <section className="relative flex min-h-screen items-center pt-20 pb-16">
        <div className="container-fit grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="badge badge-teal mb-6">
              <Sparkles className="h-3 w-3" />
              Software para coaches, nutricionistas y centros
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Gestiona tu negocio fitness desde un solo panel.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              TrainTools te ayuda a organizar clientes, rutinas, nutrición, citas, comunicación y pagos para ofrecer un servicio más profesional sin vivir entre hojas de cálculo.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-7 py-3.5 text-base">
                Prueba gratis 1 mes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#94A3B8]">
              {['Sin tarjeta', 'Setup en 10 minutos', '1 mes gratis'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#FF6A00]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1421]/85 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#475569]">Panel del coach</p>
                <h2 className="text-lg font-bold text-white">Resumen de negocio</h2>
              </div>
              <div className="rounded-full bg-[#FF6A00]/15 px-3 py-1 text-xs font-semibold text-[#FF6A00]">
                En directo
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.035] p-4">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-[#94A3B8]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-[#FF6A00]/15 bg-[#FF6A00]/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Clientes que requieren atención</h3>
                <LineChart className="h-4 w-4 text-[#FF6A00]" />
              </div>
              {[
                ['Laura Martin', 'Check-in completado', 'Responder'],
                ['Carlos Ruiz', 'Pago vence mañana', 'Cobro'],
                ['Marta Vega', 'Rutina finalizada', 'Actualizar'],
              ].map(([name, detail, action]) => (
                <div key={name} className="flex items-center justify-between border-t border-white/[0.06] py-3 first:border-t-0 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-[#94A3B8]">{detail}</p>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-[#94A3B8]">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="funciones" className="py-20">
        <div className="container-fit">
          <div className="mb-12 max-w-2xl">
            <div className="badge badge-indigo mb-4">
              <Zap className="h-3 w-3" />
              Todo lo operativo
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              La oficina digital de tu servicio de coaching.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${feature.color}18` }}>
                  <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="flujo" className="border-y border-white/[0.06] bg-white/[0.02] py-16">
        <div className="container-fit">
          <div className="grid gap-6 md:grid-cols-4">
            {workflow.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/10 text-sm font-bold text-[#FF6A00]">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-[#94A3B8]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precios" className="py-20">
        <div className="container-fit grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Empieza con tu primer grupo de clientes.
            </h2>
            <p className="mt-4 text-[#94A3B8]">
              Un MVP pensado para coaches que quieren vender mejor, entregar mejor y medir mejor desde el primer día.
            </p>
          </div>
          <div className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/10 to-[#FFB000]/10 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Plan Pro Coach</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">Gratis</span>
                  <span className="text-sm text-[#94A3B8]">el primer mes</span>
                </div>
                <p className="mt-1 text-xs text-[#94A3B8]">Después, €29/mes. Sin tarjeta para empezar.</p>
              </div>
              <Link href="/signup" className="btn-primary justify-center">
                Empezar prueba gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-2 text-sm text-[#94A3B8] sm:grid-cols-2">
              {['Hasta 25 clientes', 'Rutinas ilimitadas', 'Panel de pagos', 'Chat y check-ins'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#FF6A00]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="container-fit flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6A00] to-[#FFB000]">
              <CalendarCheck className="h-4 w-4 text-[#080C14]" />
            </div>
            <span className="font-bold text-white">TrainTools</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569]">
            <Link href="/client" className="hover:text-white">Vista cliente</Link>
            <span>© {new Date().getFullYear()} TrainTools. Hecho para profesionales wellness.</span>
          </div>
        </div>
      </footer>
    </GradientBackground>
  )
}
