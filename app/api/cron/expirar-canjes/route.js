import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { sincronizarSuscripcion } from '@/lib/mp'

export const maxDuration = 60

// Cron diario (ver vercel.json): expira los canjes pendientes
// vencidos y devuelve los puntos, aunque el cliente nunca vuelva
// a abrir su tarjeta. Vercel manda Authorization: Bearer CRON_SECRET.
//
// Aprovecha la misma corrida para sincronizar las suscripciones con
// Mercado Pago (el plan Hobby permite solo 2 crons): así los pagos
// que el webhook no procesó y las bajas sin avisar se corrigen solos.
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: vencidos } = await supabaseAdmin
      .from('canjes')
      .select('id')
      .eq('estado', 'pendiente')
      .lte('expira_at', new Date().toISOString())
      .limit(500)

    let expirados = 0
    for (const canje of vencidos || []) {
      const { data: ok } = await supabaseAdmin.rpc('fn_expirar_canje', { p_canje_id: canje.id })
      if (ok) expirados++
    }

    const suscripciones = await sincronizarSuscripciones(supabaseAdmin)

    return NextResponse.json({ ok: true, expirados, suscripciones })
  } catch (error) {
    console.error('cron expirar-canjes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Deja el plan de cada negocio igual a lo que dice Mercado Pago.
async function sincronizarSuscripciones(supabaseAdmin) {
  try {
    const [{ data: conIntento }, { data: conPlan }] = await Promise.all([
      supabaseAdmin.from('suscripciones').select('negocio_id'),
      supabaseAdmin.from('negocios').select('id').or('mp_plan_id.not.is.null,plan.neq.gratis'),
    ])

    const ids = [...new Set([
      ...(conIntento || []).map(s => s.negocio_id),
      ...(conPlan || []).map(n => n.id),
    ])]

    const cambios = []
    for (const id of ids) {
      const r = await sincronizarSuscripcion(supabaseAdmin, id).catch(() => null)
      if (r?.cambio) cambios.push({ negocioId: id, plan: r.plan })
    }
    return { revisados: ids.length, cambios }
  } catch (error) {
    console.error('sincronizar suscripciones error:', error)
    return { error: true }
  }
}
