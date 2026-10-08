import { NextResponse, after } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'
import { enviarEmail } from '@/lib/email'
import { emailValido } from '@/lib/clientes'
import { actualizarPuntosWallet } from '@/lib/googleWallet'
import { enviarSeguimientoAltas } from '@/lib/seguimientoAltas'

export const maxDuration = 60

// Cron diario (ver vercel.json): acredita los puntos de cumpleaños
// a los clientes que cumplen años hoy y les avisa por mail. Toda la
// lógica de la acreditación (matching de fecha, anti-duplicado, suma
// atómica) vive en fn_acreditar_cumpleanos.
//
// Aprovecha la misma corrida para el seguimiento de las altas nuevas
// (lib/seguimientoAltas.js): las 12:00 UTC son las 9 AM en Argentina,
// buena hora para que le entre un mail a un comerciante.
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
    let avisos = 0
    if (acreditados > 0) {
      const { data: recientes } = await supabaseAdmin
        .from('transacciones')
        .select('cliente_id, puntos')
        .eq('tipo', 'cumpleanos')
        .gte('created_at', desde)

      // Sin el mail el regalo pasaba sin que nadie se enterara: los puntos
      // aparecían en la tarjeta y el cliente no tenía por qué abrirla justo
      // ese día. Igual que con el seguimiento, un mail que falla no puede
      // tumbar la acreditación.
      avisos = await avisarCumpleanos(supabaseAdmin, recientes || []).catch(error => {
        console.error('aviso cumpleanos error:', error)
        return 0
      })

      after(async () => {
        for (const t of recientes || []) {
          await actualizarPuntosWallet(t.cliente_id)
        }
      })
    }

    // Los mails nunca pueden tumbar la acreditación de puntos: si el
    // seguimiento falla se loguea y la corrida sigue siendo un éxito.
    const seguimiento = await enviarSeguimientoAltas(supabaseAdmin).catch(error => {
      console.error('seguimiento altas error:', error)
      return { error: true }
    })

    return NextResponse.json({ ok: true, acreditados, avisos, seguimiento })
  } catch (error) {
    console.error('cron cumpleanos error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// Le avisa por mail a cada cliente que acaba de recibir sus puntos de
// cumpleaños. Devuelve cuántos mails aceptó Resend.
//
// No mira `acepta_marketing`: es el aviso de un movimiento en su cuenta,
// igual que el mail de "sumaste puntos", y no una promoción.
async function avisarCumpleanos(supabaseAdmin, recientes) {
  const puntosPorCliente = new Map(recientes.map(t => [t.cliente_id, t.puntos]))
  if (!puntosPorCliente.size) return 0

  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, email, puntos, negocio:negocios(nombre)')
    .in('id', [...puntosPorCliente.keys()])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
  let enviados = 0

  // De a uno: son pocos por día y así no se compite con el tope de
  // pedidos por segundo de Resend, que comparte toda la cuenta.
  for (const cliente of clientes || []) {
    if (!emailValido(cliente.email) || !cliente.negocio) continue

    const pts = puntosPorCliente.get(cliente.id)
    const nombre = escapar(cliente.nombre.split(' ')[0])
    const negocio = escapar(cliente.negocio.nombre)

    const ok = await enviarEmail({
      from: 'Fielty <hola@fielty.app>',
      to: cliente.email,
      subject: `¡Feliz cumpleaños! ${cliente.negocio.nombre} te regaló ${pts} puntos 🎂`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

          <div style="margin-bottom: 28px;">
            <span style="font-size: 20px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
          </div>

          <div style="background: linear-gradient(135deg, #1a1a2e, #0f3460); border-radius: 20px; padding: 28px; text-align: center; margin-bottom: 28px;">
            <div style="font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Regalo de cumpleaños</div>
            <div style="font-size: 60px; font-weight: 900; color: #00b96b; font-family: monospace; line-height: 1; margin-bottom: 8px;">+${pts}</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.5);">puntos en ${negocio}</div>
          </div>

          <p style="font-size: 16px; color: #0e0e0e; margin: 0 0 10px;">
            Hola <strong>${nombre}</strong>, ¡feliz cumpleaños!
          </p>
          <p style="font-size: 15px; color: #555; line-height: 1.7; margin: 0 0 28px;">
            ${negocio} te regaló <strong>${pts} puntos</strong> para festejarlo.
            Ahora tenés <strong>${cliente.puntos} puntos</strong> en total.
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
    if (ok) enviados++
  }

  return enviados
}

// Los nombres los escriben el cliente y el dueño: pueden traer < o &.
const escapar = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
