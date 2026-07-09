'use server'

import { z } from 'zod'
import { generateObject } from 'ai'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isDemoSession } from '@/features/demo/server'
import { getOpenAI, MODELS } from '@/lib/ai/openai'
import type { AiSummary } from '@/features/ai-summary/data'

const summarySchema = z.object({
  estadoGeneral: z.enum(['optimo', 'estable', 'atencion', 'riesgo']),
  resumen: z.string().describe('Resumen del estado general del atleta en 2-3 frases, en español'),
  // Anthropic (vía OpenRouter, structured output estricto) rechaza minItems Y
  // maxItems en arrays del schema — la longitud (2-4) se pide solo en el prompt.
  puntosClave: z.array(z.string()).describe('Puntos clave observados (2 a 4), cada uno una frase corta'),
  recomendacion: z.string().describe('Una recomendación concreta y accionable para el entrenador, en español'),
})

function mapRow(row: {
  id: string
  estado_general: string
  resumen: string
  puntos_clave: string[]
  recomendacion: string
  modelo: string
  generado_en: string
}): AiSummary {
  return {
    id: row.id,
    estadoGeneral: row.estado_general as AiSummary['estadoGeneral'],
    resumen: row.resumen,
    puntosClave: row.puntos_clave,
    recomendacion: row.recomendacion,
    modelo: row.modelo,
    generadoEn: row.generado_en,
  }
}

export async function getLatestSummary(clienteId: string): Promise<AiSummary | null> {
  if (await isDemoSession()) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('resumenes_ia')
    .select('id, estado_general, resumen, puntos_clave, recomendacion, modelo, generado_en')
    .eq('cliente_id', clienteId)
    .order('generado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ? mapRow(data) : null
}

export async function generateClientSummary(clienteId: string) {
  if (await isDemoSession()) {
    return { error: 'El resumen de IA no está disponible en modo demo' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: cliente } = await supabase
    .from('clientes')
    .select('nombre, objetivo, estado, adherencia')
    .eq('id', clienteId)
    .single()
  if (!cliente) return { error: 'Cliente no encontrado' }

  const [{ data: checkins }, { data: bienestar }, { data: tests }, { data: mensajes }] = await Promise.all([
    supabase
      .from('checkins')
      .select('peso, energia, sueno, hambre, adherencia, comentario, creado_en')
      .eq('cliente_id', clienteId)
      .order('creado_en', { ascending: false })
      .limit(5),
    supabase
      .from('cuestionarios_bienestar')
      .select('sueno, estres, dolor, energia, notas, creado_en')
      .eq('cliente_id', clienteId)
      .order('creado_en', { ascending: false })
      .limit(5),
    supabase
      .from('tests_fisicos')
      .select('categoria, nombre, valor, unidad, fecha_test')
      .eq('cliente_id', clienteId)
      .order('fecha_test', { ascending: false })
      .limit(5),
    supabase
      .from('mensajes')
      .select('remitente, contenido, creado_en')
      .eq('cliente_id', clienteId)
      .order('creado_en', { ascending: false })
      .limit(10),
  ])

  const prompt = `Eres un asistente para entrenadores personales. Analiza los datos de este cliente y genera un resumen de su estado general.

Cliente: ${cliente.nombre}
Objetivo: ${cliente.objetivo ?? 'sin especificar'}
Estado del servicio: ${cliente.estado}
Adherencia registrada por el coach: ${cliente.adherencia}%

Check-ins recientes (peso, energía, sueño, hambre, adherencia, comentario):
${JSON.stringify(checkins ?? [], null, 2)}

Cuestionarios de bienestar recientes (sueño, estrés, dolor, energía, notas, escala 1-10):
${JSON.stringify(bienestar ?? [], null, 2)}

Tests físicos recientes:
${JSON.stringify(tests ?? [], null, 2)}

Mensajes recientes con el entrenador:
${JSON.stringify(mensajes ?? [], null, 2)}

Genera un resumen honesto y accionable, con entre 2 y 4 puntos clave. Si no hay suficientes datos, dilo explícitamente en el resumen y usa estadoGeneral "estable" por defecto. Responde siempre en español.`

  try {
    const { object } = await generateObject({
      model: getOpenAI()(MODELS.balanced),
      schema: summarySchema,
      prompt,
      maxOutputTokens: 1000,
    })

    const { error } = await supabase.from('resumenes_ia').insert({
      entrenador_id: user.id,
      cliente_id: clienteId,
      estado_general: object.estadoGeneral,
      resumen: object.resumen,
      puntos_clave: object.puntosClave,
      recomendacion: object.recomendacion,
      modelo: MODELS.balanced,
    })

    if (error) return { error: error.message }

    revalidatePath(`/dashboard/clients/${clienteId}`)
    return { success: true }
  } catch {
    return { error: 'No se pudo generar el resumen. Inténtalo de nuevo en unos minutos.' }
  }
}
