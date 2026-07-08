'use server'

import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { getDemoDashboardSummary } from '@/features/demo/data'
import { isDemoSession } from '@/features/demo/server'

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.round(hours / 24)
  return `Hace ${days} día${days === 1 ? '' : 's'}`
}

export async function getDashboardSummary() {
  if (await isDemoSession()) return getDemoDashboardSummary()

  const supabase = await createSupabaseClient()

  const [
    { data: clientes },
    { data: planes },
    { count: pendingCheckinsCount },
    { data: pendingCheckinRows },
    { data: mensajesRows },
    { data: checkinsRows },
    { data: pagosRows },
  ] = await Promise.all([
    supabase.from('clientes').select('id, nombre, estado, adherencia, notas, riesgos, ingresos'),
    supabase.from('planes_entrenamiento').select('id, clientes_asignados'),
    supabase.from('checkins').select('id', { count: 'exact', head: true }).eq('estado', 'Pendiente'),
    supabase
      .from('checkins')
      .select('id, comentario, estado, creado_en, clientes(id, nombre)')
      .eq('estado', 'Pendiente')
      .order('creado_en', { ascending: false })
      .limit(3),
    supabase
      .from('mensajes')
      .select('id, contenido, creado_en, remitente, leido_en, cliente_id, clientes(nombre)')
      .order('creado_en', { ascending: false })
      .limit(5),
    supabase
      .from('checkins')
      .select('id, comentario, creado_en, cliente_id, clientes(nombre)')
      .order('creado_en', { ascending: false })
      .limit(5),
    supabase
      .from('pagos')
      .select('id, concepto, monto, moneda, estado, cliente_id, clientes(nombre)')
      .neq('estado', 'Pagado')
      .order('creado_en', { ascending: false })
      .limit(3),
  ])

  const clients = clientes ?? []
  if (clients.length === 0) return getDemoDashboardSummary()

  const activeClients = clients.filter((c) => c.estado === 'Activo').length
  const riskCount = clients.filter((c) => c.estado === 'Riesgo').length
  const mrr = clients.reduce((sum, c) => sum + (Number.parseFloat(c.ingresos ?? '0') || 0), 0)
  const avgAdherence = clients.length
    ? Math.round(clients.reduce((sum, c) => sum + c.adherencia, 0) / clients.length)
    : 0

  const unreadThreadIds = new Set(
    (mensajesRows ?? [])
      .filter((m) => m.remitente === 'cliente' && !m.leido_en)
      .map((m) => m.cliente_id)
  )

  const riskClients = clients
    .filter((c) => c.estado === 'Riesgo')
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      name: c.nombre,
      problem: c.riesgos?.[0] ?? 'Necesita seguimiento',
      detail: c.notas || 'Revisa su actividad reciente y contacta si hace falta.',
      metric: `${c.adherencia}%`,
    }))

  const pendingCheckIns = (pendingCheckinRows ?? []).map((row) => {
    const cliente = row.clientes as unknown as { id: string; nombre: string } | null
    return {
      clientId: cliente?.id ?? '',
      client: cliente?.nombre ?? 'Cliente',
      result: row.comentario || 'Check-in enviado',
      status: 'Pendiente de revisión',
    }
  })

  const activityFromCheckins = (checkinsRows ?? []).map((row) => {
    const cliente = row.clientes as unknown as { nombre: string } | null
    return {
      type: 'checkin' as const,
      text: `${cliente?.nombre ?? 'Cliente'} envió un check-in`,
      time: formatRelative(row.creado_en),
      href: `/dashboard/clients/${row.cliente_id}`,
      createdAt: row.creado_en,
    }
  })

  const activityFromMessages = (mensajesRows ?? []).map((row) => {
    const cliente = row.clientes as unknown as { nombre: string } | null
    return {
      type: 'message' as const,
      text: `${cliente?.nombre ?? 'Cliente'}: ${row.contenido}`,
      time: formatRelative(row.creado_en),
      href: '/dashboard/messages',
      createdAt: row.creado_en,
    }
  })

  const recentActivity = [...activityFromCheckins, ...activityFromMessages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((item) => ({
      type: item.type,
      text: item.text,
      time: item.time,
      href: item.href,
    }))

  const pendingPayments = (pagosRows ?? []).map((row) => {
    const cliente = row.clientes as unknown as { nombre: string } | null
    return {
      id: row.id,
      client: cliente?.nombre ?? 'Cliente',
      concept: row.concepto,
      amount: new Intl.NumberFormat('es-ES', { style: 'currency', currency: row.moneda }).format(row.monto),
      status: row.estado,
      clientId: row.cliente_id,
    }
  })

  return {
    stats: { activeClients, mrr, avgAdherence, riskCount },
    pendingCheckinsCount: pendingCheckinsCount ?? 0,
    unreadThreadsCount: unreadThreadIds.size,
    totalWorkoutPlans: (planes ?? []).length,
    riskClients,
    pendingCheckIns,
    recentActivity,
    pendingPayments,
  }
}
