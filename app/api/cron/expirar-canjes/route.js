import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'

// Cron diario (ver vercel.json): expira los canjes pendientes
// vencidos y devuelve los puntos, aunque el cliente nunca vuelva
// a abrir su tarjeta. Vercel manda Authorization: Bearer CRON_SECRET.
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

    return NextResponse.json({ ok: true, expirados })
  } catch (error) {
    console.error('cron expirar-canjes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
