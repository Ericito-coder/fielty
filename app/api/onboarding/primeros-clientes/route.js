import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'
import { limiteClientes } from '@/lib/planes'
import { prepararPrimerosClientes } from '@/lib/clientes'

// El dueño carga a mano a sus primeros clientes al terminar el alta, con
// nombre y WhatsApp, y después les manda la tarjeta desde su teléfono.
//
// Existe porque el día del alta decide casi todo: de los negocios que ese
// día cargaron dos clientes o más siguió usando Fielty la mitad (16 de
// 31), y de los que no cargaron ninguno, 2 de 33 (base al 07/10/2026).
// La caja no servía para esto: pide el DNI, y el dueño sabe el teléfono
// de un cliente habitual pero no su documento.
//
// Solo el dueño autenticado del negocio. Estos clientes quedan sin DNI,
// sin mail y sin contraseña, igual que los que entran con Google antes de
// completar su perfil: entran a su tarjeta con el link que les llega.
export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId, clientes: filas } = await request.json()
    if (!negocioId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('id, user_id, plan, created_at, puntos_bienvenida')
      .eq('id', negocioId)
      .single()
    if (!negocio || negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { ok } = await rateLimit({ key: `primeros-clientes:${negocio.id}`, maxAttempts: 10, windowMs: 60 * 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un rato.' }, { status: 429 })

    const { clientes, error } = prepararPrimerosClientes(filas)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const { count } = await supabaseAdmin
      .from('clientes').select('*', { count: 'exact', head: true }).eq('negocio_id', negocio.id)
    if ((count || 0) + clientes.length > limiteClientes(negocio)) {
      return NextResponse.json({ error: 'Con estos clientes pasás el límite del plan gratuito.' }, { status: 403 })
    }

    const { data: repetidos } = await supabaseAdmin
      .from('clientes')
      .select('nombre, telefono')
      .eq('negocio_id', negocio.id)
      .in('telefono', clientes.map(c => c.telefono))
    if (repetidos?.length) {
      return NextResponse.json({ error: `Ya tenés un cliente con el WhatsApp ${repetidos[0].telefono} (${repetidos[0].nombre}).` }, { status: 409 })
    }

    const puntos = negocio.puntos_bienvenida ?? 10
    const { data, error: insertError } = await supabaseAdmin
      .from('clientes')
      .insert(clientes.map(c => ({
        nombre: c.nombre,
        telefono: c.telefono,
        negocio_id: negocio.id,
        puntos,
        puntos_historicos: puntos,
      })))
      .select('id, nombre, telefono, puntos')

    if (insertError) {
      console.error('Error cargando primeros clientes:', insertError)
      return NextResponse.json({ error: 'Hubo un error, intentá de nuevo' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, clientes: data })
  } catch (error) {
    console.error('primeros-clientes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
