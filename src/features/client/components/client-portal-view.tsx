'use client'

import { Activity, LogOut } from 'lucide-react'
import { signout } from '@/actions/auth'
import { WorkspaceActions } from '@/shared/components/workspace-actions'
import { ClientDemoBanner } from '@/features/client/components/client-demo-banner'
import { TodayWorkoutPanel } from '@/features/client/components/today-workout-panel'
import { HabitsPanel, NutritionPanel } from '@/features/client/components/habits-panel'
import { CheckinForm } from '@/features/client/components/checkin-form'
import { CoachChat } from '@/features/client/components/coach-chat'
import { WellnessForm } from '@/features/wellness/components/wellness-form'
import { BookSessionPanel } from '@/features/client/components/book-session-panel'
import type { AvailableSlot, ClientPlan, MyMessage, MyProfile, MySession } from '@/features/client/types'

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

interface ClientPortalViewProps {
  profile: MyProfile
  plan: ClientPlan
  initialMessages: MyMessage[]
  availableSlots: AvailableSlot[]
  mySessions: MySession[]
  isDemo: boolean
}

export function ClientPortalView({
  profile,
  plan,
  initialMessages,
  availableSlots,
  mySessions,
  isDemo,
}: ClientPortalViewProps) {
  return (
    <div className="theme-client min-h-screen bg-[#080C14] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080C14]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-brand2/25 bg-brand2/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-brand2">
              Portal cliente
            </div>
            <h1 className="truncate text-lg font-bold">Hola, {profile.nombre}</h1>
            <p className="truncate text-xs text-[#94A3B8]">Vista de entrenamientos, hábitos y comunicación con tu entrenador.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <WorkspaceActions mode="client" userName={profile.nombre} userEmail={profile.email} compact />
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-brand2/30 text-sm font-bold sm:flex">
              {initialsFor(profile.nombre)}
            </div>
            <form action={signout}>
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-[#94A3B8] hover:text-white"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {isDemo && <div className="pt-4"><ClientDemoBanner /></div>}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="mb-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Resumen</h2>
              <Activity className="h-4 w-4 text-brand" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Adherencia</span>
                  <span className="font-medium text-brand">{profile.adherencia}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${profile.adherencia}%`, background: 'var(--color-teal)' }} />
                </div>
              </div>
              {profile.pesoActual && (
                <div>
                  <span className="mb-1.5 block text-xs text-[#94A3B8]">Peso actual</span>
                  <span className="text-sm font-semibold text-white">{profile.pesoActual} kg</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <TodayWorkoutPanel plan={plan} />
            <NutritionPanel />
          </div>

          <div className="space-y-6">
            <BookSessionPanel initialSlots={availableSlots} initialMySessions={mySessions} />
            <HabitsPanel />
            <CheckinForm pesoActual={profile.pesoActual} />
            <WellnessForm />
            <CoachChat initialMessages={initialMessages} />
          </div>
        </section>
      </main>
    </div>
  )
}
