'use client'

import { useMemo, useState } from 'react'
import { FolderPlus, Plus, Search } from 'lucide-react'
import {
  exerciseFilterOptions,
  exerciseLibraryItems,
  type ExerciseLibraryItem,
} from '@/features/periodization/data'
import { cn } from '@/shared/lib/utils'

type ExerciseTab = 'Todos' | 'Míos' | 'Institucionales'
type FilterKey = keyof typeof exerciseFilterOptions

const filterLabels: Record<FilterKey, string> = {
  category: 'Categoría',
  member: 'Miembro',
  laterality: 'Lateralidad',
  movementPattern: 'Patrón',
  region: 'Región',
  posture: 'Postura',
  instability: 'Inestabilidad',
  contractionType: 'Contracción',
  resistance: 'Resistencia',
  equipment: 'Equipamiento',
}

const itemKeyMap: Record<FilterKey, keyof ExerciseLibraryItem> = {
  category: 'category',
  member: 'member',
  laterality: 'laterality',
  movementPattern: 'movementPattern',
  region: 'region',
  posture: 'posture',
  instability: 'instability',
  contractionType: 'contractionType',
  resistance: 'resistance',
  equipment: 'equipment',
}

export function ExerciseLibrary() {
  const [items, setItems] = useState(exerciseLibraryItems)
  const [tab, setTab] = useState<ExerciseTab>('Todos')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    category: [],
    member: [],
    laterality: [],
    movementPattern: [],
    region: [],
    posture: [],
    instability: [],
    contractionType: [],
    resistance: [],
    equipment: [],
  })
  const [draft, setDraft] = useState({
    name: 'Nuevo ejercicio',
    category: 'Fuerza',
    folder: 'General',
    equipment: 'Mancuernas',
  })

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return items.filter((item) => {
      const matchesTab =
        tab === 'Todos' ||
        (tab === 'Míos' && item.ownership === 'mine') ||
        (tab === 'Institucionales' && item.ownership === 'institutional')
      const matchesQuery =
        normalized.length === 0 ||
        [item.name, item.category, item.folder, item.equipment, item.movementPattern].join(' ').toLowerCase().includes(normalized)
      const matchesFilters = (Object.keys(filters) as FilterKey[]).every((key) => {
        const selected = filters[key]
        if (selected.length === 0) return true
        return selected.includes(String(item[itemKeyMap[key]]))
      })

      return matchesTab && matchesQuery && matchesFilters
    })
  }, [filters, items, query, tab])

  function updateFilter(key: FilterKey, values: string[]) {
    setFilters((current) => ({ ...current, [key]: values }))
  }

  function createExercise() {
    const next: ExerciseLibraryItem = {
      id: `exercise-${Date.now()}`,
      name: draft.name,
      ownership: 'mine',
      category: draft.category,
      member: 'Superior',
      laterality: 'Bilateral',
      movementPattern: 'Push',
      region: 'Torso',
      posture: 'De pie',
      instability: 'Estable',
      contractionType: 'Dinámica',
      resistance: 'Carga externa',
      equipment: draft.equipment,
      folder: draft.folder,
    }
    setItems((current) => [next, ...current])
    setShowForm(false)
  }

  return (
    <div className="mx-auto max-w-7xl p-5 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#FF6A00]">Biblioteca</p>
          <h1 className="mt-1 text-3xl font-black text-white">Ejercicios</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">Taxonomía, carpetas y filtros para construir programas con precisión.</p>
        </div>
        <button type="button" onClick={() => setShowForm((value) => !value)} className="btn-primary w-fit px-4 py-2 text-sm">
          <Plus className="h-4 w-4" />
          Nuevo ejercicio
        </button>
      </div>

      {showForm && (
        <section className="glass-card mb-6 rounded-2xl p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <Input label="Nombre" value={draft.name} onChange={(value) => setDraft((current) => ({ ...current, name: value }))} />
            <Input label="Categoría" value={draft.category} onChange={(value) => setDraft((current) => ({ ...current, category: value }))} />
            <Input label="Equipamiento" value={draft.equipment} onChange={(value) => setDraft((current) => ({ ...current, equipment: value }))} />
            <Input label="Carpeta" value={draft.folder} onChange={(value) => setDraft((current) => ({ ...current, folder: value }))} />
          </div>
          <button type="button" onClick={createExercise} className="btn-secondary mt-4 px-4 py-2 text-xs">
            <FolderPlus className="h-4 w-4" />
            Guardar en carpeta
          </button>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="glass-card h-fit rounded-2xl p-4">
          <h2 className="mb-4 text-sm font-bold text-white">Filtros</h2>
          <div className="space-y-3">
            {(Object.keys(exerciseFilterOptions) as FilterKey[]).map((key) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs text-[#94A3B8]">{filterLabels[key]}</span>
                <select
                  multiple
                  value={filters[key]}
                  onChange={(event) => updateFilter(key, Array.from(event.target.selectedOptions).map((option) => option.value))}
                  className="input-field min-h-24 py-2 text-xs"
                >
                  {exerciseFilterOptions[key].map((option) => (
                    <option key={option} className="bg-[#0D1117]" value={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </aside>

        <main>
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="input-field pl-10" placeholder="Buscar ejercicio, patrón o equipamiento..." />
            </div>
            <div className="flex rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
              {(['Todos', 'Míos', 'Institucionales'] as ExerciseTab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={cn('rounded-xl px-3 py-2 text-xs font-bold transition', tab === item ? 'bg-[#FF6A00] text-[#0D1117]' : 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-white')}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
              <span>Ejercicio</span>
              <span>Categoría</span>
              <span>Patrón</span>
              <span>Región</span>
              <span>Carpeta</span>
            </div>
            {visibleItems.map((item) => (
              <article key={item.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] border-t border-white/[0.06] px-4 py-3 text-sm">
                <span>
                  <span className="block font-bold text-white">{item.name}</span>
                  <span className="text-xs text-[#94A3B8]">{item.ownership === 'mine' ? 'Mío' : 'Institucional'} · {item.equipment}</span>
                </span>
                <span className="text-[#C8D2E3]">{item.category}</span>
                <span className="text-[#94A3B8]">{item.movementPattern}</span>
                <span className="text-[#94A3B8]">{item.region}</span>
                <span className="text-[#FFB000]">{item.folder}</span>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[#94A3B8]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="input-field" />
    </label>
  )
}
