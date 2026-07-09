export const TEST_CATEGORIES = [
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'resistencia', label: 'Resistencia' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'medidas', label: 'Medidas' },
  { value: 'otro', label: 'Otro' },
] as const

export type TestCategoria = (typeof TEST_CATEGORIES)[number]['value']

export type PerformanceTest = {
  id: string
  categoria: TestCategoria
  nombre: string
  valor: number
  unidad: string
  fechaTest: string
  notas: string | null
}

export function categoriaLabel(categoria: TestCategoria) {
  return TEST_CATEGORIES.find((c) => c.value === categoria)?.label ?? categoria
}
