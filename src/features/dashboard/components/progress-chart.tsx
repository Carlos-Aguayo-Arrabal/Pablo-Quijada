import { cn } from '@/shared/lib/utils'

interface WeeklyProgressChartProps {
  data: { day: string; value: number; target?: number }[]
  label?: string
  unit?: string
  color?: 'teal' | 'indigo' | 'orange'
  className?: string
}

const colorMap = {
  teal: {
    bar: 'bg-gradient-to-t from-[#FFB000] to-[#FF6A00]',
    barBg: 'bg-[#FF6A00]/10',
    text: 'text-[#FF6A00]',
    shadow: 'shadow-[#FF6A00]/30',
  },
  indigo: {
    bar: 'bg-gradient-to-t from-[#6366F1] to-[#FFB000]',
    barBg: 'bg-[#FFB000]/10',
    text: 'text-[#FFB000]',
    shadow: 'shadow-[#FFB000]/30',
  },
  orange: {
    bar: 'bg-gradient-to-t from-[#ea580c] to-[#FB923C]',
    barBg: 'bg-[#FB923C]/10',
    text: 'text-[#FB923C]',
    shadow: 'shadow-[#FB923C]/30',
  },
}

export function WeeklyProgressChart({
  data,
  label = 'Progreso semanal',
  unit = 'min',
  color = 'teal',
  className,
}: WeeklyProgressChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const c = colorMap[color]
  const today = new Date().getDay()
  const todayAbbr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][today]

  const total = data.reduce((acc, d) => acc + d.value, 0)
  const avg = data.length > 0 ? Math.round(total / data.filter((d) => d.value > 0).length || 1) : 0

  return (
    <div className={cn('glass-card rounded-2xl p-5', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{label}</h3>
          <p className="text-xs text-[#94A3B8]">Esta semana</p>
        </div>
        <div className="text-right">
          <span className={cn('text-2xl font-bold', c.text)}>{total}</span>
          <span className="ml-1 text-xs text-[#94A3B8]">{unit}</span>
          <p className="text-xs text-[#475569]">Promedio: {avg} {unit}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-1.5 h-28">
        {data.map((item) => {
          const heightPct = item.value > 0 ? (item.value / maxValue) * 100 : 4
          const isToday = item.day === todayAbbr

          return (
            <div
              key={item.day}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              {/* Tooltip on hover */}
              <div className="relative flex-1 flex items-end w-full">
                {/* Target line */}
                {item.target && (
                  <div
                    className="absolute w-full border-t border-dashed border-white/20"
                    style={{ bottom: `${(item.target / maxValue) * 100}%` }}
                  />
                )}

                {/* Bar background */}
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500',
                    item.value === 0 ? 'h-1 bg-white/5' : '',
                    c.barBg,
                    'absolute inset-x-0 bottom-0 h-full'
                  )}
                />

                {/* Bar fill */}
                <div
                  className={cn(
                    'relative w-full rounded-t-lg transition-all duration-700 ease-out',
                    item.value > 0 ? c.bar : 'bg-white/5',
                    isToday && item.value > 0 && 'shadow-md ' + c.shadow
                  )}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day label */}
              <span
                className={cn(
                  'text-xs font-medium shrink-0',
                  isToday ? c.text : 'text-[#475569]'
                )}
              >
                {item.day}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-1.5">
          <div className={cn('h-2.5 w-2.5 rounded-full', c.bar)} />
          <span className="text-xs text-[#94A3B8]">Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 border-t border-dashed border-white/30" />
          <span className="text-xs text-[#94A3B8]">Objetivo</span>
        </div>
      </div>
    </div>
  )
}
