import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { rateLimit } from '@/lib/rateLimit'

// Guarda si el cliente acepta "Quiero recibir novedades y promociones".
// La autorización es la misma que en el resto de /tarjeta: conocer el UUID
// es tener la tarjeta.
//
// La casilla viene marcada en la pantalla de bienvenida del registro, que
// llama acá con el sí apenas se muestra y con el no si el cliente la
// desmarca. O sea que la fecha dice cuándo tuvo la casilla adelante y la
// dejó marcada, no que la haya marcado él. Sirve para separarlo del que
// nunca la vio: `acepta_marketing` nace en true para todos (ver
// migracion-consentimiento.sql).
export async function POST(request) {
  try {
    const { clienteId, acepta } = await request.json()

    if (!clienteId || typeof acepta !== 'boolean') {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { ok } = await rateLimit({ key: `promos:${clienteId}`, maxAttempts: 10, windowMs: 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const { data, error } = await getSupabaseAdmin()
      .from('clientes')
      .update({
        acepta_marketing: acepta,
        acepta_marketing_at: acepta ? new Date().toISOString() : null,
      })
      .eq('id', clienteId)
      .select('id')

    if (error) {
      console.error('Error guardando consentimiento:', error)
      return NextResponse.json({ error: 'Hubo un error, intentá de nuevo' }, { status: 500 })
    }
    if (!data?.length) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('promos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
