export type WellnessCheck = {
  id: string
  sueno: number
  estres: number
  dolor: number
  energia: number
  notas: string | null
  creadoEn: string
}

export function toneForStress(estres: number) {
  if (estres >= 8) return 'high' as const
  if (estres >= 5) return 'medium' as const
  return 'low' as const
}

export function toneForPain(dolor: number) {
  if (dolor >= 7) return 'high' as const
  if (dolor >= 4) return 'medium' as const
  return 'low' as const
}
