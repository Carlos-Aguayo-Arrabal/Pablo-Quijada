'use client'

import { useMemo, useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { WorkoutCard, type WorkoutCardProps } from '@/features/dashboard/components/workout-card'
import { cn } from '@/shared/lib/utils'

const categories = ['todos', 'fuerza', 'hiit', 'flexibilidad', 'full-body'] as const

interface PlanLibraryProps {
  plans: WorkoutCardProps[]
}

export function PlanLibrary({ plans }: PlanLibraryProps) {
  const [category, setCategory] = useState<(typeof categories)[number]>('todos')
  const [query, setQuery] = useState('')

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesCategory = category === 'todos' || plan.category === category
      const matchesQuery = plan.title.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [category, plans, query])

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            type="search"
            placeholder="Buscar plan..."
            className="input-field pl-10"
            id="plan-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 shrink-0 text-[#475569]" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all',
                category === cat
                  ? 'border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00]'
                  : 'border-white/10 bg-white/[0.04] text-[#94A3B8] hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]'
              )}
              id={`filter-${cat}`}
            >
              {cat === 'todos' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <WorkoutCard key={plan.id} {...plan} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center text-sm text-[#94A3B8]">
          No hay planes que coincidan con tu búsqueda.
        </div>
      )}
    </>
  )
}
