import { createOpenAI, type OpenAIProvider } from '@ai-sdk/openai'

// Instanciación perezosa: evita que el build necesite OPENAI_API_KEY (Next
// evalúa los módulos de las rutas al recolectar datos de página), igual que
// el cliente admin de Supabase.
let cached: OpenAIProvider | null = null

export function getOpenAI() {
  if (!cached) {
    cached = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
  }
  return cached
}

export const MODELS = {
  fast: 'gpt-4o-mini',
  balanced: 'gpt-4o',
  powerful: 'gpt-4o',
} as const

export type ModelKey = keyof typeof MODELS
