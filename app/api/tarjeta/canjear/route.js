import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/server'
import { actualizarPuntosWallet } from '@/lib/googleWallet'
import { rateLimit } from '@/lib/rateLimit'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generarCodigo() {
  const bytes = crypto.randomBytes(6)
  let codigo = ''
  for (let i = 0; i < 3; i++) codigo += CHARS[bytes[i] % CHARS.length]
  codigo += '-'
  for (let i = 3; i < 6; i++) codigo += CHARS[bytes[i] % CHARS.length]
  return codigo
}

// Canjear una recompensa desde la tarjeta del cliente. La validación
// de saldo y el descuento de puntos ocurren en fn_canjear (atómico).
export async function POST(request) {
  try {
    const { clienteId, recompensaId } = await request.json()
    if (!clienteId || !recompensaId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { ok } = await rateLimit({ key: `canjear:${clienteId}`, maxAttempts: 10, windowMs: 60 * 1000 })
    if (!ok) return NextResponse.json({ error: 'Demasiados intentos. Esperá un momento.' }, { status: 429 })

    const supabaseAdmin = getSupabaseAdmin()
    const codigo = generarCodigo()
    const expiraAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin.rpc('fn_canjear', {
      p_cliente_id: clienteId,
      p_recompensa_id: recompensaId,
      p_codigo: codigo,
      p_expira_at: expiraAt,
    })

    if (error) {
      const msg = error.message || ''
      if (msg.includes('puntos_insuficientes')) {
        return NextResponse.json({ error: 'No te alcanzan los puntos para esta recompensa' }, { status: 400 })
      }
      if (msg.includes('recompensa_no_disponible')) {
        return NextResponse.json({ error: 'Esta recompensa ya no está disponible' }, { status: 404 })
      }
      if (msg.includes('cliente_no_encontrado')) {
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
      }
      console.error('fn_canjear error:', error)
      return NextResponse.json({ error: 'No se pudo generar el canje, intentá de nuevo' }, { status: 500 })
    }

    actualizarPuntosWallet(clienteId).catch(() => {})

    return NextResponse.json({ ok: true, codigo, expira_at: expiraAt, puntos: data?.puntos })
  } catch (error) {
    console.error('canjear error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
