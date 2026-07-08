import { Activity } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface BrandMarkProps {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#0D1117] ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFB000] to-[#FF6A00]" />
        <span className="brand-heading relative -skew-x-12 text-2xl font-black leading-none text-white drop-shadow">
          T
        </span>
        <Activity className="absolute bottom-1 left-1 h-3.5 w-3.5 text-white" strokeWidth={3} />
      </div>
      {!compact && (
        <div className="min-w-0">
          <p className="brand-heading truncate text-base font-black italic leading-tight text-white">
            TrainTools
          </p>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.24em] text-[#FF6A00] sm:block">
            Coaching, clientes y progreso
          </p>
        </div>
      )}
    </div>
  )
}
