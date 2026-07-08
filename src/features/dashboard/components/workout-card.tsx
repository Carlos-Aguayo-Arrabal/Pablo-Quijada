import Link from 'next/link'
import { Clock, Flame, BarChart2, ChevronRight, Play, Lock } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type WorkoutCategory = 'fuerza' | 'cardio' | 'hiit' | 'flexibilidad' | 'full-body'
export type WorkoutDifficulty = 'principiante' | 'intermedio' | 'avanzado'

export interface WorkoutCardProps {
  id: string
  title: string
  category: WorkoutCategory
  difficulty: WorkoutDifficulty
  duration: number // minutes
  calories: number
  exercises: number
  description?: string
  isLocked?: boolean
  isCompleted?: boolean
  completionRate?: number
  className?: string
  animate?: boolean
}

const categoryConfig: Record<WorkoutCategory, { label: string; color: string; bg: string }> = {
  fuerza: { label: 'Fuerza', color: 'text-[#FFB000]', bg: 'bg-[#FFB000]/10' },
  cardio: { label: 'Cardio', color: 'text-[#FB923C]', bg: 'bg-[#FB923C]/10' },
  hiit: { label: 'HIIT', color: 'text-[#F87171]', bg: 'bg-[#F87171]/10' },
  flexibilidad: { label: 'Flexibilidad', color: 'text-[#FF6A00]', bg: 'bg-[#FF6A00]/10' },
  'full-body': { label: 'Full Body', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
}

const difficultyConfig: Record<WorkoutDifficulty, { label: string; dots: number }> = {
  principiante: { label: 'Principiante', dots: 1 },
  intermedio: { label: 'Intermedio', dots: 2 },
  avanzado: { label: 'Avanzado', dots: 3 },
}

export function WorkoutCard({
  id,
  title,
  category,
  difficulty,
  duration,
  calories,
  exercises,
  description,
  isLocked = false,
  isCompleted = false,
  completionRate,
  className,
  animate = true,
}: WorkoutCardProps) {
  const cat = categoryConfig[category]
  const diff = difficultyConfig[difficulty]

  const cardContent = (
    <div
      className={cn(
        'glass-card group relative overflow-hidden rounded-2xl p-5 transition-all duration-300',
        animate && 'animate-[fadeUp_0.6s_ease-out_forwards]',
        !isLocked && 'hover:scale-[1.01] cursor-pointer',
        isLocked && 'opacity-60',
        isCompleted && 'ring-1 ring-[#FF6A00]/20',
        className
      )}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute right-4 top-4 rounded-full bg-[#FF6A00]/20 px-2 py-0.5 text-xs font-semibold text-[#FF6A00]">
          ✓ Completado
        </div>
      )}

      {/* Category + Difficulty */}
      <div className="mb-3 flex items-center gap-2">
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', cat.bg, cat.color)}>
          {cat.label}
        </span>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                dot <= diff.dots ? 'bg-white/60' : 'bg-white/15'
              )}
            />
          ))}
          <span className="ml-1 text-xs text-[#475569]">{diff.label}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-1.5 text-base font-semibold text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mb-3 text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{duration} min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-[#FB923C]" />
          <span>{calories} kcal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5" />
          <span>{exercises} ejercicios</span>
        </div>
      </div>

      {/* Completion bar */}
      {typeof completionRate === 'number' && completionRate > 0 && (
        <div className="mt-3">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Lock className="h-3.5 w-3.5" />
            <span>Requiere Plan Pro</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#FF6A00] group-hover:gap-2 transition-all">
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Abrir plan</span>
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-[#475569] group-hover:text-white transition-colors group-hover:translate-x-0.5" />
      </div>
    </div>
  )

  if (isLocked) return cardContent

  return <Link href={`/dashboard/workouts/${id}`}>{cardContent}</Link>
}
