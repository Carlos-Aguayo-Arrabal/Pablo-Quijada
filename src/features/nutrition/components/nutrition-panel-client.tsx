import { Flame, Utensils } from 'lucide-react'
import type { NutritionPlanView } from '@/features/nutrition/services/actions'

export function NutritionPanelClient({ plan }: { plan: NutritionPlanView | null }) {
  if (!plan) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-2 flex items-center gap-2">
          <Utensils className="h-4 w-4 text-brand2" />
          <h2 className="text-sm font-semibold">Plan nutricional</h2>
        </div>
        <p className="text-sm text-[#94A3B8]">Tu entrenador todavía no te ha asignado un plan nutricional.</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <Utensils className="h-4 w-4 text-brand2" />
        <h2 className="text-sm font-semibold">{plan.nombre}</h2>
      </div>

      {(plan.caloriasObjetivo || plan.proteinaObjetivoG) && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {plan.caloriasObjetivo && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#475569]">Calorías objetivo</p>
              <p className="mt-1 text-xl font-black text-white">{plan.caloriasObjetivo} kcal</p>
            </div>
          )}
          {plan.proteinaObjetivoG && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-[#475569]">Proteína objetivo</p>
              <p className="mt-1 text-xl font-black text-white">{plan.proteinaObjetivoG} g</p>
            </div>
          )}
        </div>
      )}

      {plan.meals.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">Tu entrenador todavía no ha añadido comidas a este plan.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plan.meals.map((meal) => (
            <div key={meal.id} className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
              {meal.imagenUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- imagen de storage, sin optimizacion de next/image en este proyecto
                <img src={meal.imagenUrl} alt={meal.nombre} className="h-32 w-full object-cover" />
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-white">{meal.nombre}</p>
                {meal.descripcion && <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{meal.descripcion}</p>}
                {(meal.calorias || meal.proteinaG) && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand">
                    <Flame className="h-3.5 w-3.5" />
                    {meal.calorias ? `${meal.calorias} kcal` : ''}
                    {meal.calorias && meal.proteinaG ? ' · ' : ''}
                    {meal.proteinaG ? `${meal.proteinaG} g proteína` : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.notas && (
        <div className="mt-4 rounded-xl border border-brand2/20 bg-brand2/10 p-4 text-sm text-[#C8D2E3]">
          {plan.notas}
        </div>
      )}
    </div>
  )
}
