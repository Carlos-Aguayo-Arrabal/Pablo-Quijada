'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Gift, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { dismissOnboarding } from '@/features/onboarding/services/actions'
import type { OnboardingStatus } from '@/features/onboarding/data'

export function OnboardingWidget({ initialStatus }: { initialStatus: OnboardingStatus | null }) {
  const [status, setStatus] = useState(initialStatus)
  const [isOpen, setIsOpen] = useState(false)

  if (!status) return null

  async function handleDismiss() {
    setStatus(null)
    await dismissOnboarding()
  }

  const progressPct = Math.round((status.completedCount / status.totalCount) * 100)

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-80 rounded-2xl border border-white/[0.08] bg-[#111B26] p-4 shadow-2xl shadow-black/40">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-white">Explora TrainTools</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#475569] hover:text-white"
              aria-label="Minimizar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Progreso</span>
              <span className="font-semibold text-[#FF6A00]">
                {status.completedCount}/{status.totalCount}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {status.tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl border p-2.5',
                  task.completada ? 'border-[#4ADE80]/20 bg-[#4ADE80]/5' : 'border-white/[0.06] bg-white/[0.03]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    task.completada ? 'bg-[#4ADE80] text-[#080C14]' : 'border border-white/15'
                  )}
                >
                  {task.completada && <Check className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  {task.completada ? (
                    <p className="text-xs font-semibold text-[#94A3B8] line-through">{task.label}</p>
                  ) : (
                    <Link
                      href={task.href}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold text-white hover:text-[#FF6A00]"
                    >
                      {task.label}
                    </Link>
                  )}
                  <p className="mt-0.5 text-[11px] text-[#475569]">{task.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="mt-3 w-full text-center text-[11px] text-[#475569] hover:text-white"
          >
            No mostrar más
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6A00] text-[#080C14] shadow-2xl shadow-black/40 transition hover:bg-[#FFB000]"
        aria-label="Explora TrainTools"
      >
        <Gift className="h-5 w-5" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#111B26] text-[10px] font-bold text-white ring-2 ring-[#080C14]">
          {status.completedCount}/{status.totalCount}
        </span>
      </button>
    </>
  )
}
