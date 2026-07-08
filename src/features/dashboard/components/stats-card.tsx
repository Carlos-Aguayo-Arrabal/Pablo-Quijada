import { cn } from '@/shared/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  iconColor?: 'teal' | 'indigo' | 'orange' | 'red'
  trend?: {
    value: number
    label?: string
  }
  progress?: number
  className?: string
  animate?: boolean
}

const iconColorMap = {
  teal: {
    bg: 'bg-[#FF6A00]/10',
    text: 'text-[#FF6A00]',
    border: 'border-[#FF6A00]/20',
    shadow: 'shadow-[#FF6A00]/10',
  },
  indigo: {
    bg: 'bg-[#FFB000]/10',
    text: 'text-[#FFB000]',
    border: 'border-[#FFB000]/20',
    shadow: 'shadow-[#FFB000]/10',
  },
  orange: {
    bg: 'bg-[#FB923C]/10',
    text: 'text-[#FB923C]',
    border: 'border-[#FB923C]/20',
    shadow: 'shadow-[#FB923C]/10',
  },
  red: {
    bg: 'bg-[#F87171]/10',
    text: 'text-[#F87171]',
    border: 'border-[#F87171]/20',
    shadow: 'shadow-[#F87171]/10',
  },
}

export function StatsCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'teal',
  trend,
  progress,
  className,
  animate = true,
}: StatsCardProps) {
  const colors = iconColorMap[iconColor]

  const TrendIcon =
    !trend ? null
    : trend.value > 0 ? TrendingUp
    : trend.value < 0 ? TrendingDown
    : Minus

  const trendColor =
    !trend ? ''
    : trend.value > 0 ? 'text-[#FF6A00]'
    : trend.value < 0 ? 'text-[#F87171]'
    : 'text-[#94A3B8]'

  return (
    <div
      className={cn(
        'glass-card group rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]',
        animate && 'animate-[fadeUp_0.6s_ease-out_forwards]',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border shadow-lg',
            colors.bg,
            colors.border,
            colors.shadow,
          )}
        >
          <Icon className={cn('h-5 w-5', colors.text)} strokeWidth={1.8} />
        </div>

        {/* Trend badge */}
        {trend && TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend.value > 0 ? 'bg-[#FF6A00]/10 text-[#FF6A00]' :
              trend.value < 0 ? 'bg-[#F87171]/10 text-[#F87171]' :
              'bg-white/5 text-[#94A3B8]'
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <div className="flex items-baseline gap-1.5">
          <span className={cn('text-3xl font-bold tracking-tight', colors.text)}>
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-[#94A3B8]">{unit}</span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-[#94A3B8]">{title}</p>
      </div>

      {/* Progress bar */}
      {typeof progress === 'number' && (
        <div className="mt-3">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-[#475569]">
            {progress}% del objetivo
          </p>
        </div>
      )}

      {/* Trend label */}
      {trend?.label && (
        <p className={cn('mt-2 text-xs', trendColor)}>
          {trend.label}
        </p>
      )}
    </div>
  )
}
