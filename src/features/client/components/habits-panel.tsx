'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { DEMO_HABITS } from '@/features/client/demo-data'

export function HabitsPanel() {
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())

  function toggleHabit(id: string) {
    setCompletedHabits((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="mb-4 text-sm font-semibold">Hábitos diarios</h2>
      <div className="space-y-3">
        {DEMO_HABITS.map((habit) => {
          const done = completedHabits.has(habit.id)
          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border',
                  done ? 'border-brand bg-brand text-[#080C14]' : 'border-white/15 text-[#475569]'
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-white">{habit.label}</span>
                <span className="block text-xs text-[#94A3B8]">{habit.detail}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
