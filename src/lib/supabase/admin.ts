import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service role client — bypasses RLS. Solo usar server-side (API routes, nunca en el cliente).
// Instanciación perezosa: evita que el build necesite la key (Next evalúa los módulos de
// las rutas al recolectar datos de página, así que un cliente creado a nivel de módulo
// exigiría la service role key también en tiempo de build).
let cached: SupabaseClient<Database> | null = null

export function getSupabaseAdmin() {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) as SupabaseClient<Database>
  }
  return cached
}
