'use client'

import { cn } from '@/shared/lib/utils'

interface GradientBackgroundProps {
  children?: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'normal' | 'strong'
}

export function GradientBackground({
  children,
  className,
  intensity = 'normal',
}: GradientBackgroundProps) {
  const opacityMap = {
    subtle: { teal: 0.06, indigo: 0.06, accent: 0.03 },
    normal: { teal: 0.12, indigo: 0.12, accent: 0.06 },
    strong: { teal: 0.18, indigo: 0.18, accent: 0.10 },
  }

  const op = opacityMap[intensity]

  return (
    <div
      className={cn('relative min-h-screen overflow-hidden bg-[#080C14]', className)}
    >
      {/* Blob 1 — Teal top-left */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[700px] w-[700px] rounded-full blur-[140px]"
        style={{
          background: `rgba(255, 106, 0, ${op.teal})`,
          animation: 'blob 10s ease-in-out infinite',
        }}
      />

      {/* Blob 2 — Indigo top-right */}
      <div
        className="pointer-events-none absolute -right-32 top-1/4 h-[600px] w-[600px] rounded-full blur-[130px]"
        style={{
          background: `rgba(255, 176, 0, ${op.indigo})`,
          animation: 'blob 8s ease-in-out infinite 2s',
        }}
      />

      {/* Blob 3 — Teal bottom-center */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background: `rgba(255, 106, 0, ${op.accent})`,
          animation: 'blob 12s ease-in-out infinite 4s',
        }}
      />

      {/* Mesh grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
