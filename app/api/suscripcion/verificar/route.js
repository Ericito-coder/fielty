import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { sincronizarSuscripcion } from '@/lib/mp'

/**
 * Verificación activa del pago. La llama el dashboard al volver del
 * checkout de Mercado Pago y el botón "Ya pagué, verificar". Consulta
 * la API de MP y activa el plan si hay una suscripción autorizada —
 * así el pago impacta aunque el webhook no haya llegado.
 */
export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId } = await request.json()
    if (!negocioId) return NextResponse.json({ error: 'Falta negocioId' }, { status: 400 })

    const { data: negocio } = await supabaseAdmin
      .from('negocios').select('id, user_id').eq('id', negocioId).single()
    if (!negocio || negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const resultado = await sincronizarSuscripcion(supabaseAdmin, negocioId)
    if (resultado.error) return NextResponse.json({ error: resultado.error }, { status: 404 })

    return NextResponse.json({
      ok: true,
      plan: resultado.plan,
      cambio: resultado.cambio,
      encontradas: resultado.suscripcionesEncontradas,
    })
  } catch (error) {
    console.error('suscripcion/verificar error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
