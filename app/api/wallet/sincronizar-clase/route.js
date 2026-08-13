import { NextResponse, after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { sincronizarClaseWallet } from '@/lib/googleWallet'

// El dashboard avisa por acá cuando el dueño cambia el nombre, el logo o
// el color: son los tres campos que viajan en la clase de Wallet y que,
// sin este aviso, quedarían viejos en el pase de todos sus clientes.
//
// Responde sin esperar a Google (`after`): el dueño ya guardó, y que la
// llamada a Wallet tarde no tiene por qué demorarle el guardado.
export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { negocioId } = await request.json()
    if (!negocioId) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: negocio } = await supabaseAdmin
      .from('negocios').select('id, user_id').eq('id', negocioId).single()
    if (!negocio || negocio.user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    after(() => sincronizarClaseWallet(negocioId))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('wallet/sincronizar-clase error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
