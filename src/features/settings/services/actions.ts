'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getHelpResources() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recursos_ayuda')
    .select('manual_url, video_url')
    .limit(1)
    .maybeSingle()

  return {
    manualUrl: data?.manual_url ?? null,
    videoUrl: data?.video_url ?? null,
  }
}

const helpResourcesSchema = z.object({
  manualUrl: z.string().url('URL inválida').or(z.literal('')),
  videoUrl: z.string().url('URL inválida').or(z.literal('')),
})

export async function updateHelpResources(input: { manualUrl: string; videoUrl: string }) {
  const parsed = helpResourcesSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const supabase = await createClient()
  const { data: existing } = await supabase.from('recursos_ayuda').select('id').limit(1).maybeSingle()
  if (!existing) return { error: 'No se encontró la fila de recursos de ayuda' }

  const { error } = await supabase
    .from('recursos_ayuda')
    .update({
      manual_url: parsed.data.manualUrl || null,
      video_url: parsed.data.videoUrl || null,
      actualizado_en: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
