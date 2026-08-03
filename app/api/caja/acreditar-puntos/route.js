import { NextResponse } from 'next/server'
import { enviarEmail } from '@/lib/email'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'
import { actualizarPuntosWallet } from '@/lib/googleWallet'

export async function POST(request) {
  try {
    const { negocioId, clienteId, monto, pin, sucursalId } = await request.json()

    if (!negocioId || !clienteId || !monto || !pin) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const montoNum = parseInt(monto, 10)
    if (!Number.isInteger(montoNum) || montoNum < 100 || montoNum > 100000000) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Valida el PIN del negocio o de la sucursal (puede tener PIN propio)
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin, ip: getRequestIp(request) })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { negocio, sucursal } = auth

    // Validar que el cliente pertenece al negocio
    const { data: cliente, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('id, nombre, email')
      .eq('id', clienteId)
      .eq('negocio_id', negocioId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const pesosPorPunto = negocio.pesos_por_punto || 100
    const puntosPorTramo = negocio.puntos_por_tramo || 1
    const pts = Math.round(montoNum / pesosPorPunto * puntosPorTramo)

    // Suma atómica (evita que dos cajas simultáneas se pisen)
    const { data: resultado, error: rpcError } = await supabaseAdmin
      .rpc('fn_acreditar_visita', { p_cliente_id: clienteId, p_puntos: pts })

    if (rpcError || !resultado?.length) {
      console.error('fn_acreditar_visita error:', rpcError)
      return NextResponse.json({ error: 'No se pudieron acreditar los puntos' }, { status: 500 })
    }
    const { puntos: nuevosPuntos, puntos_historicos: nuevosHistoricos } = resultado[0]

    let descripcion = `Compra $${montoNum.toLocaleString('es-AR')}`
    if (sucursal) descripcion += ` — ${sucursal.nombre}`

    await supabaseAdmin
      .from('transacciones')
      .insert([{
        cliente_id: clienteId,
        negocio_id: negocioId,
        ...(sucursal && { sucursal_id: sucursal.id }),
        tipo: 'suma',
        puntos: pts,
        descripcion
      }])

    // Email y pase de Google Wallet (fire-and-forget, no bloquean la respuesta)
    if (cliente.email) {
      enviarEmailPuntos({ cliente, negocio, pts, nuevosPuntos, montoNum }).catch(() => {})
    }
    actualizarPuntosWallet(clienteId).catch(() => {})

    return NextResponse.json({ ok: true, pts, nuevosPuntos, nuevosHistoricos })

  } catch (error) {
    console.error('acreditar-puntos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function enviarEmailPuntos({ cliente, negocio, pts, nuevosPuntos, montoNum }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
  const montoFormateado = `$${montoNum.toLocaleString('es-AR')}`

  await enviarEmail({
    from: 'Fielty <hola@fielty.app>',
    to: cliente.email,
    subject: `+${pts} puntos en ${negocio.nombre} ⭐`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

        <div style="margin-bottom: 28px;">
          <span style="font-size: 20px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
        </div>

        <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 20px; padding: 28px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Puntos acreditados</div>
          <div style="font-size: 60px; font-weight: 900; color: #00b96b; font-family: monospace; line-height: 1; margin-bottom: 8px;">+${pts}</div>
          <div style="font-size: 14px; color: rgba(255,255,255,0.5);">puntos en ${negocio.nombre}</div>
        </div>

        <p style="font-size: 16px; color: #0e0e0e; margin: 0 0 10px;">
          Hola <strong>${cliente.nombre.split(' ')[0]}</strong>,
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 28px;">
          Acreditamos <strong>${pts} puntos</strong> por tu compra de <strong>${montoFormateado}</strong> en ${negocio.nombre}.
          Ahora tenés <strong>${nuevosPuntos} puntos</strong> en total.
        </p>

        <a href="${appUrl}/tarjeta/${cliente.id}" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 40px;">
          Ver mi tarjeta →
        </a>

        <p style="font-size: 12px; color: #aaa; padding-top: 24px; border-top: 1px solid #e8eaf0; margin: 0;">
          Fielty · <a href="${appUrl}" style="color: #aaa; text-decoration: none;">fielty.app</a>
        </p>
      </div>
    `,
  })
}
