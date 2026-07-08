export function formatRelative(date: string | null) {
  if (!date) return 'Sin conexión'

  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.round(hours / 24)
  return `Hace ${days} día${days === 1 ? '' : 's'}`
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
}
