import { createOpenRouter, type OpenRouterProvider } from '@openrouter/ai-sdk-provider'

// Instanciación perezosa: evita que el build necesite OPENROUTER_API_KEY (Next
// evalúa los módulos de las rutas al recolectar datos de página), igual que
// el cliente admin de Supabase.
let cached: OpenRouterProvider | null = null

export function getOpenRouter() {
  if (!cached) {
    cached = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })
  }
  return cached
}

export const MODELS = {
  fast: 'anthropic/claude-haiku-4.5',
  balanced: 'anthropic/claude-sonnet-5',
  powerful: 'anthropic/claude-opus-4.8',
} as const

export type ModelKey = keyof typeof MODELS
