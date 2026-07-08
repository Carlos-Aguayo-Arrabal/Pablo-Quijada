interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-sm text-[#94A3B8]">{description}</p>
    </div>
  )
}
