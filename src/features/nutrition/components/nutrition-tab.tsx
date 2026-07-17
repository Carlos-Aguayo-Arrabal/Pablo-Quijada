'use client'

import { useRef, useState, useTransition } from 'react'
import { ImagePlus, Loader2, Plus, Search, Sparkles, Trash2, Upload, Utensils } from 'lucide-react'
import {
  createMeal,
  createNutritionPlan,
  deleteMeal,
  generateMealImageAI,
  generateNutritionPlanAI,
  searchMealStockImage,
  updateMeal,
  updateNutritionPlanSettings,
  uploadMealImage,
  type NutritionPlanView,
} from '@/features/nutrition/services/actions'

interface NutritionTabProps {
  clienteId: string
  plan: NutritionPlanView | null
}

export function NutritionTab({ clienteId, plan }: NutritionTabProps) {
  const [syncedPlan, setSyncedPlan] = useState(plan)
  if (plan !== syncedPlan) setSyncedPlan(plan)

  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  function flashStatus(message: string) {
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(null), 4000)
  }

  if (!syncedPlan) {
    return (
      <section className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <Utensils className="h-4 w-4 text-brand2" />
          <h2 className="text-sm font-bold text-white">Plan nutricional</h2>
        </div>
        <p className="mb-4 text-sm text-[#94A3B8]">Todavía no has creado un plan nutricional para este cliente.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await generateNutritionPlanAI(clienteId)
                if (result.error) flashStatus(result.error)
              })
            }
            className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generar plan con IA
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await createNutritionPlan(clienteId)
                if (result.error) flashStatus(result.error)
              })
            }
            className="btn-secondary px-4 py-2 text-xs disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Crear plan en blanco
          </button>
        </div>
        {statusMessage && (
          <p className="mt-3 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
            {statusMessage}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="glass-card rounded-2xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-brand2" />
          <h2 className="text-sm font-bold text-white">{syncedPlan.nombre}</h2>
        </div>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
      </div>

      {statusMessage && (
        <p className="mb-4 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 px-3 py-2 text-xs text-[#F87171]">
          {statusMessage}
        </p>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Calorías objetivo</span>
          <input
            type="number"
            defaultValue={syncedPlan.caloriasObjetivo ?? ''}
            onBlur={(event) => {
              const value = event.target.value ? Number(event.target.value) : null
              startTransition(async () => {
                const result = await updateNutritionPlanSettings(clienteId, syncedPlan.id, { caloriasObjetivo: value })
                if (result.error) flashStatus(result.error)
              })
            }}
            className="input-field"
            placeholder="Ej: 2150"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-[#94A3B8]">Proteína objetivo (g)</span>
          <input
            type="number"
            defaultValue={syncedPlan.proteinaObjetivoG ?? ''}
            onBlur={(event) => {
              const value = event.target.value ? Number(event.target.value) : null
              startTransition(async () => {
                const result = await updateNutritionPlanSettings(clienteId, syncedPlan.id, { proteinaObjetivoG: value })
                if (result.error) flashStatus(result.error)
              })
            }}
            className="input-field"
            placeholder="Ej: 150"
          />
        </label>
      </div>

      <label className="mb-5 block">
        <span className="mb-1.5 block text-xs text-[#94A3B8]">Notas para el cliente</span>
        <textarea
          defaultValue={syncedPlan.notas ?? ''}
          onBlur={(event) => {
            startTransition(async () => {
              const result = await updateNutritionPlanSettings(clienteId, syncedPlan.id, { notas: event.target.value || null })
              if (result.error) flashStatus(result.error)
            })
          }}
          className="input-field min-h-20 resize-none"
          placeholder="Ej: prioriza proteína alta y simplifica cenas los días de entrenamiento."
        />
      </label>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Comidas</h3>
        <AddMealForm clienteId={clienteId} planId={syncedPlan.id} onError={flashStatus} />
      </div>

      {syncedPlan.meals.length === 0 ? (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-[#94A3B8]">
          Añade la primera comida del plan.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {syncedPlan.meals.map((meal) => (
            <MealCard key={meal.id} clienteId={clienteId} meal={meal} onError={flashStatus} />
          ))}
        </div>
      )}
    </section>
  )
}

function AddMealForm({ clienteId, planId, onError }: { clienteId: string; planId: string; onError: (message: string) => void }) {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    setName('')
    startTransition(async () => {
      const result = await createMeal(clienteId, planId, trimmed)
      if (result.error) onError(result.error)
    })
  }

  return (
    <div className="flex gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleAdd()
          }
        }}
        placeholder="Ej: Merienda"
        className="input-field w-40 py-2 text-xs"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || !name.trim()}
        className="btn-secondary px-3 py-2 text-xs disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Añadir
      </button>
    </div>
  )
}

function MealCard({
  clienteId,
  meal,
  onError,
}: {
  clienteId: string
  meal: NutritionPlanView['meals'][number]
  onError: (message: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [imageAction, setImageAction] = useState<'upload' | 'stock' | 'ai' | null>(null)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isBusyWithImage = imageAction !== null

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImageAction('upload')
    setShowImageMenu(false)
    const formData = new FormData()
    formData.append('imagen', file)

    startTransition(async () => {
      const result = await uploadMealImage(clienteId, meal.id, formData)
      if (result.error) onError(result.error)
      setImageAction(null)
    })
  }

  function handleStockSearch() {
    setImageAction('stock')
    setShowImageMenu(false)
    startTransition(async () => {
      const result = await searchMealStockImage(clienteId, meal.id, meal.nombre)
      if (result.error) onError(result.error)
      setImageAction(null)
    })
  }

  function handleAiGenerate() {
    setImageAction('ai')
    setShowImageMenu(false)
    startTransition(async () => {
      const result = await generateMealImageAI(clienteId, meal.id, meal.nombre, meal.descripcion)
      if (result.error) onError(result.error)
      setImageAction(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]">
      <div className="relative h-32 w-full overflow-hidden bg-white/[0.03]">
        {meal.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagen de storage, sin optimizacion de next/image en este proyecto
          <img src={meal.imagenUrl} alt={meal.nombre} className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => setShowImageMenu((value) => !value)}
            disabled={isBusyWithImage}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#475569] transition hover:text-brand"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px] font-semibold">Añadir foto</span>
          </button>
        )}

        {isBusyWithImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#080C14]/80">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
            <span className="text-[11px] font-semibold text-white">
              {imageAction === 'ai' ? 'Generando con IA...' : imageAction === 'stock' ? 'Buscando foto...' : 'Subiendo...'}
            </span>
          </div>
        )}

        {meal.imagenUrl && !isBusyWithImage && (
          <button
            type="button"
            onClick={() => setShowImageMenu((value) => !value)}
            className="absolute inset-0 flex items-center justify-center bg-[#080C14]/0 opacity-0 transition hover:bg-[#080C14]/50 hover:opacity-100"
          >
            <span className="text-[11px] font-semibold text-white">Cambiar foto</span>
          </button>
        )}

        {showImageMenu && !isBusyWithImage && (
          <div className="absolute inset-0 flex flex-col justify-center gap-1.5 bg-[#080C14]/90 p-3">
            <button
              type="button"
              onClick={handleStockSearch}
              className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-2.5 py-2 text-left text-[11px] font-semibold text-white hover:bg-white/[0.1]"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-brand" />
              Buscar foto libre (gratis)
            </button>
            <button
              type="button"
              onClick={handleAiGenerate}
              className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-2.5 py-2 text-left text-[11px] font-semibold text-white hover:bg-white/[0.1]"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand" />
              Generar con IA
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-2.5 py-2 text-left text-[11px] font-semibold text-white hover:bg-white/[0.1]"
            >
              <Upload className="h-3.5 w-3.5 shrink-0 text-brand" />
              Subir mi foto
            </button>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold text-white">{meal.nombre}</p>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteMeal(clienteId, meal.id)
                if (result.error) onError(result.error)
              })
            }
            className="flex h-8 w-8 items-center justify-center text-[#475569] hover:text-[#F87171] disabled:opacity-50"
            aria-label="Eliminar comida"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <textarea
          defaultValue={meal.descripcion ?? ''}
          onBlur={(event) => {
            startTransition(async () => {
              const result = await updateMeal(clienteId, meal.id, { descripcion: event.target.value || null })
              if (result.error) onError(result.error)
            })
          }}
          placeholder="Ingredientes..."
          className="input-field min-h-14 resize-none py-2 text-xs"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            defaultValue={meal.calorias ?? ''}
            onBlur={(event) => {
              const value = event.target.value ? Number(event.target.value) : null
              startTransition(async () => {
                const result = await updateMeal(clienteId, meal.id, { calorias: value })
                if (result.error) onError(result.error)
              })
            }}
            placeholder="kcal"
            className="input-field py-2 text-xs"
          />
          <input
            type="number"
            defaultValue={meal.proteinaG ?? ''}
            onBlur={(event) => {
              const value = event.target.value ? Number(event.target.value) : null
              startTransition(async () => {
                const result = await updateMeal(clienteId, meal.id, { proteinaG: value })
                if (result.error) onError(result.error)
              })
            }}
            placeholder="proteína g"
            className="input-field py-2 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
