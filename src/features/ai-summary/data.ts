export type EstadoGeneral = 'optimo' | 'estable' | 'atencion' | 'riesgo'

export type AiSummary = {
  id: string
  estadoGeneral: EstadoGeneral
  resumen: string
  puntosClave: string[]
  recomendacion: string
  modelo: string
  generadoEn: string
}

export const ESTADO_LABEL: Record<EstadoGeneral, string> = {
  optimo: 'Óptimo',
  estable: 'Estable',
  atencion: 'Atención',
  riesgo: 'Riesgo',
}

export const ESTADO_TONE: Record<EstadoGeneral, string> = {
  optimo: 'border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]',
  estable: 'border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00]',
  atencion: 'border-[#FFB000]/30 bg-[#FFB000]/10 text-[#FFB000]',
  riesgo: 'border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]',
}
