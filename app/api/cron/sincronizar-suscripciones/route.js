import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { sincronizarSuscripcion } from '@/lib/mp'

export const maxDuration = 60

/**
 * Cron diario: consulta Mercado Pago y deja el plan de cada negocio
 * igual a la realidad. Es la red de seguridad del sistema — atrapa
 * pagos que el webhook no procesó y bajas que nadie avisó, sin
 * depender de ninguna configuración externa.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Negocios que alguna vez intentaron suscribirse o ya tienen plan pago
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

    return NextResponse.json({ ok: true, revisados: ids.length, cambios })
  } catch (error) {
    console.error('cron sincronizar-suscripciones error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
