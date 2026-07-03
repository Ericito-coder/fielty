import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'

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
    const { data: acreditados, error } = await supabaseAdmin.rpc('fn_acreditar_cumpleanos')

    if (error) {
      console.error('fn_acreditar_cumpleanos error:', error)
      return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, acreditados })
  } catch (error) {
    console.error('cron cumpleanos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
