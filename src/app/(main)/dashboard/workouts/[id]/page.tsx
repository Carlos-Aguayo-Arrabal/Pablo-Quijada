import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BadgeEuro,
  Check,
  Clock,
  Dumbbell,
  MessageSquare,
  Timer,
  Users,
} from 'lucide-react'
import {
  estimateExerciseSeconds,
  formatDuration,
  getCategoryTone,
} from '@/features/workouts/data'
import { ProgramDetailWorkspace } from '@/features/periodization/components/program-detail-workspace'
import { getProgramWorkspace } from '@/features/periodization/services/actions'
import { listClients } from '@/features/clients/services/actions'
import { getWorkoutPlanById } from '@/features/workouts/services/actions'
import { cn } from '@/shared/lib/utils'

export const metadata: Metadata = {
  title: 'Detalle del plan',
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [plan, clients] = await Promise.all([getWorkoutPlanById(id), listClients()])
  if (!plan) notFound()
  const totalExercises = plan.days.reduce((sum, day) => sum + day.exercises.length, 0)
  const totalSeconds = plan.days.reduce(
    (sum, day) => sum + day.exercises.reduce((daySum, exercise) => daySum + estimateExerciseSeconds(exercise), 0),
    0
  )
  const workspace = await getProgramWorkspace(id, plan.category, plan.durationWeeks)

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <Link href="/dashboard/workouts" className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Volver a planes
      </Link>

      <section className="mb-6 rounded-2xl border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', getCategoryTone(plan.category))}>{plan.category}</span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#C8D2E3]">{plan.level}</span>
            </div>
            <h1 className="text-3xl font-black text-white">{plan.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">{plan.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/clients" className="btn-primary px-4 py-2 text-sm">Asignar a cliente</Link>
            <Link href="/dashboard/workouts/new" className="btn-secondary px-4 py-2 text-sm">Duplicar plantilla</Link>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { icon: Users, label: 'Clientes', value: String(plan.assignedClients) },
          { icon: Dumbbell, label: 'Sesiones', value: `${plan.sessionsPerWeek}/sem` },
          { icon: Clock, label: 'Duración', value: `${plan.durationWeeks} sem.` },
          { icon: Timer, label: 'Tiempo estimado', value: formatDuration(totalSeconds) },
          { icon: BadgeEuro, label: 'Servicio', value: plan.price },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-2xl p-4">
            <item.icon className="mb-3 h-5 w-5 text-[#FF6A00]" />
            <p className="text-2xl font-black text-white">{item.value}</p>
            <p className="text-xs text-[#94A3B8]">{item.label}</p>
          </div>
        ))}
      </div>

      <ProgramDetailWorkspace
        planId={id}
        workspace={workspace}
        clients={clients.map((client) => ({ id: client.id, name: client.name }))}
        initialAssignedClients={plan.assignedClients}
        initialAdherence={plan.adherence}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
        <div className="space-y-5">
          {plan.days.map((day) => {
            const daySeconds = day.exercises.reduce((sum, exercise) => sum + estimateExerciseSeconds(exercise), 0)

            return (
              <section key={day.day} className="glass-card rounded-2xl p-5">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF6A00]">{day.day}</p>
                    <h2 className="mt-1 text-xl font-black text-white">{day.title}</h2>
                    <p className="text-sm text-[#94A3B8]">{day.focus}</p>
                  </div>
                  <span className="w-fit rounded-full bg-[#FFB000]/10 px-3 py-1 text-xs font-bold text-[#FFB000]">
                    {formatDuration(daySeconds)}
                  </span>
                </div>

                <div className="space-y-3">
                  {day.exercises.map((exercise, index) => (
                    <div key={`${day.day}-${exercise.name}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-xs text-[#475569]">Ejercicio {index + 1}</p>
                          <h3 className="text-base font-bold text-white">{exercise.name}</h3>
                          <p className="mt-1 text-xs text-[#94A3B8]">{exercise.notes}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center sm:grid-cols-6 lg:min-w-[520px]">
                          <ExerciseMetric label="Series" value={String(exercise.sets)} />
                          <ExerciseMetric label="Reps" value={exercise.reps} />
                          <ExerciseMetric label="RPE" value={exercise.rpe} />
                          <ExerciseMetric label="Tempo" value={exercise.tempo} />
                          <ExerciseMetric label="Descanso" value={`${exercise.rest}s`} />
                          <ExerciseMetric label="Timer" value={formatDuration(estimateExerciseSeconds(exercise))} active />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#FF6A00]/25 bg-gradient-to-br from-[#FF6A00]/12 to-[#FFB000]/10 p-5">
            <Timer className="mb-3 h-6 w-6 text-[#FF6A00]" />
            <h2 className="text-sm font-bold text-white">Temporizador conectado</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#C8D2E3]">
              Cada ejercicio calcula su duración con series, reps y descanso. Al asignarlo al portal cliente, el timer usa estos mismos datos.
            </p>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Contenido incluido</h2>
            <div className="space-y-3">
              {[
                `${plan.days.length} días programados`,
                `${totalExercises} ejercicios configurados`,
                'Notas técnicas por ejercicio',
                'RPE, tempo y descanso por serie',
                'Check-in semanal vinculado',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm text-[#94A3B8]">
                  <Check className="h-4 w-4 text-[#FF6A00]" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Mensaje de asignación</h2>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#FF6A00]">
                <MessageSquare className="h-4 w-4" />
                Plantilla rápida
              </div>
              <p className="text-sm leading-relaxed text-[#C8D2E3]">
                Te he asignado {plan.title}. Revisa el primer día, registra cargas y dime sensaciones al terminar.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function ExerciseMetric({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={cn('rounded-lg px-2 py-2', active ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'bg-white/[0.04] text-white')}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 text-xs font-black">{value}</p>
    </div>
  )
}
