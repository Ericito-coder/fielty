import { NextResponse, after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { actualizarPuntosWallet } from '@/lib/googleWallet'

// Cron diario (ver vercel.json): acredita los puntos de cumpleaños
// a los clientes que cumplen años hoy. Toda la lógica (matching de
// fecha, anti-duplicado, suma atómica) vive en fn_acreditar_cumpleanos.
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    // 10 minutos de colchón: created_at lo pone Postgres con su reloj, y
    // el cron corre una vez por día, así que no puede pescar otra corrida.
    const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: acreditados, error } = await supabaseAdmin.rpc('fn_acreditar_cumpleanos')

    if (error) {
      console.error('fn_acreditar_cumpleanos error:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    // fn_acreditar_cumpleanos devuelve solo el total, así que los clientes
    // que acaban de recibir puntos se sacan de las transacciones que la
    // misma corrida insertó — sin eso su pase de Wallet quedaría atrasado.
    if (acreditados > 0) {
      after(async () => {
        const { data: recientes } = await supabaseAdmin
          .from('transacciones')
          .select('cliente_id')
          .eq('tipo', 'cumpleanos')
          .gte('created_at', desde)
        for (const t of recientes || []) {
          await actualizarPuntosWallet(t.cliente_id)
        }
      })
    }

    return NextResponse.json({ ok: true, acreditados })
  } catch (error) {
    console.error('cron cumpleanos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
