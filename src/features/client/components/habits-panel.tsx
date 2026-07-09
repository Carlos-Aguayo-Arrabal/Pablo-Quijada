'use client'

import { useState } from 'react'
import { Check, Utensils } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { DEMO_HABITS, DEMO_MEALS } from '@/features/client/demo-data'

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
                  done ? 'border-[#FF6A00] bg-[#FF6A00] text-[#080C14]' : 'border-white/15 text-[#475569]'
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

export function NutritionPanel() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Utensils className="h-4 w-4 text-[#FB923C]" />
        <h2 className="text-sm font-semibold">Plan nutricional de hoy</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {DEMO_MEALS.map((meal) => (
          <div key={meal.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">{meal.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">{meal.content}</p>
            <p className="mt-3 text-xs font-medium text-[#FB923C]">{meal.macros}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
