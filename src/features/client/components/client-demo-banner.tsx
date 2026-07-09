import { Info } from 'lucide-react'

export function ClientDemoBanner() {
  return (
    <div className="mx-auto mb-4 flex max-w-6xl items-center gap-2 rounded-xl border border-[#FFB000]/25 bg-[#FFB000]/10 px-4 py-2.5 text-xs font-medium text-[#FFB000] sm:px-6">
      <Info className="h-3.5 w-3.5 shrink-0" />
      Estás en modo demo: puedes interactuar con todo, pero nada se guarda.
    </div>
  )
}
