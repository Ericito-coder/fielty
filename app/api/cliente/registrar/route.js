import { NextResponse, after } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { enviarEmail } from '@/lib/email'
import { verificarGoogleToken } from '@/lib/googleToken'
import { actualizarPuntosWallet } from '@/lib/googleWallet'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, dni, telefono, password, slug, referidoPor, fechaNacimiento, googleToken } = body

    // Con Google el email sale del token verificado (nunca del formulario)
    // y la cuenta no tiene contraseña. Sin Google, email + contraseña son
    // obligatorios como siempre.
    let email = body.email
    let passwordHash = null
    let viaGoogle = false

    if (googleToken) {
      const google = await verificarGoogleToken(googleToken)
      if (!google) {
        return NextResponse.json({ error: 'No pudimos verificar tu cuenta de Google. Probá de nuevo o registrate con tu email.' }, { status: 401 })
      }
      email = google.email
      viaGoogle = true
    } else {
      if (!email || !password) {
        return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
      }
      if (password.length < 8) {
        return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
      }
      passwordHash = await bcrypt.hash(password, 10)
    }

    // El DNI solo es obligatorio en el registro con contraseña: ahí es el
    // usuario del login. Con Google la identidad es el email verificado,
    // así que pedirlo sería fricción sin contrapartida.
    if (!nombre || !slug || (!viaGoogle && !dni)) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Buscar negocio
    const { data: negocio, error: negocioError } = await supabaseAdmin
      .from('negocios').select('*').eq('slug', slug).single()

    if (negocioError || !negocio) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Validar referidor: debe ser un cliente real del mismo negocio
    let referidoPorValidado = null
    if (referidoPor) {
      const { data: referrer } = await supabaseAdmin
        .from('clientes').select('id').eq('id', referidoPor).eq('negocio_id', negocio.id).maybeSingle()
      if (referrer) referidoPorValidado = referidoPor
    }

    // Verificar límite del plan
    const { count } = await supabaseAdmin
      .from('clientes').select('*', { count: 'exact', head: true }).eq('negocio_id', negocio.id)

    if (negocio.plan === 'gratis' && count >= 50) {
      return NextResponse.json({ error: 'No se pudo completar el registro. Contactá al negocio para más información.' }, { status: 403 })
    }

    // Verificar duplicados
    if (dni) {
      const { data: porDni } = await supabaseAdmin
        .from('clientes').select('id').eq('negocio_id', negocio.id).eq('dni', dni).limit(1)
      if (porDni?.length > 0) {
        return NextResponse.json({ error: 'Ya tenés una tarjeta en este negocio registrada con ese DNI. ¡Pedile al empleado que te busque!' }, { status: 409 })
      }
    }

    if (telefono) {
      const { data: porTelefono } = await supabaseAdmin
        .from('clientes').select('id').eq('negocio_id', negocio.id).eq('telefono', telefono).limit(1)
      if (porTelefono?.length > 0) {
        return NextResponse.json({ error: 'Ya tenés una tarjeta en este negocio registrada con ese WhatsApp. ¡Pedile al empleado que te busque!' }, { status: 409 })
      }
    }

    const { data: porEmail } = await supabaseAdmin
      .from('clientes').select('id').eq('negocio_id', negocio.id).eq('email', email).limit(1)
    if (porEmail?.length > 0) {
      return NextResponse.json({ error: 'Ya tenés una tarjeta en este negocio registrada con ese email. ¡Pedile al empleado que te busque!' }, { status: 409 })
    }

    const puntosIniciales = referidoPorValidado ? 0 : (negocio.puntos_bienvenida || 10)

    const { data, error: insertError } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        dni: dni || null,
        telefono: telefono || null,
        email,
        negocio_id: negocio.id,
        puntos: puntosIniciales,
        puntos_historicos: puntosIniciales,
        fecha_nacimiento: fechaNacimiento || null,
        referido_por: referidoPorValidado || null,
        password_hash: passwordHash,
        via_google: viaGoogle,
      }])
      .select()

    if (insertError) {
      console.error('Error insertando cliente:', insertError)
      return NextResponse.json({ error: 'Hubo un error, intentá de nuevo' }, { status: 500 })
    }

    const nuevoCliente = data[0]

    // Notificar límite (no bloqueante, pero dentro de after() para que
    // la función no se congele antes de que salga el pedido)
    if (negocio.plan === 'gratis') {
      after(() => fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notificar-limite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({ negocioId: negocio.id }),
      }).catch(() => {}))
    }

    // Lógica de referidos
    if (referidoPorValidado) {
      const ptsEmisor = negocio.puntos_referido_emisor || 100
      const ptsReceptor = negocio.puntos_referido_receptor || 50

      const { data: emisor } = await supabaseAdmin
        .from('clientes').select('puntos, puntos_historicos, referidos_count')
        .eq('id', referidoPorValidado).single()

      if (emisor) {
        await supabaseAdmin.from('clientes').update({
          puntos: emisor.puntos + ptsEmisor,
          puntos_historicos: emisor.puntos_historicos + ptsEmisor,
          referidos_count: (emisor.referidos_count || 0) + 1
        }).eq('id', referidoPorValidado)

        await supabaseAdmin.from('transacciones').insert([{
          cliente_id: referidoPorValidado,
          negocio_id: negocio.id,
          tipo: 'referido',
          puntos: ptsEmisor,
          descripcion: `Referido exitoso: ${nombre} se registró con tu link`
        }])

        await supabaseAdmin.from('clientes').update({
          puntos: ptsReceptor,
          puntos_historicos: ptsReceptor
        }).eq('id', nuevoCliente.id)

        await supabaseAdmin.from('transacciones').insert([{
          cliente_id: nuevoCliente.id,
          negocio_id: negocio.id,
          tipo: 'referido',
          puntos: ptsReceptor,
          descripcion: `Bonus por registrarte con un link de amigo`
        }])

        // El que invitó sumó puntos: su pase de Wallet tiene que reflejarlo.
        // (El recién registrado todavía no tiene pase, se crea cuando lo agrega.)
        after(() => actualizarPuntosWallet(referidoPorValidado))
      }
    }

    // Email de bienvenida al cliente (fire-and-forget)
    if (nuevoCliente.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'
      const puntosRecibidos = referidoPorValidado
        ? (negocio.puntos_referido_receptor || 50)
        : (negocio.puntos_bienvenida || 10)
      after(() => enviarEmail({
        from: 'Fielty <hola@fielty.app>',
        to: nuevoCliente.email,
        subject: `Bienvenido a ${negocio.nombre} — tu tarjeta está lista`,
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
            <div style="margin-bottom: 28px;">
              <span style="font-size: 20px; font-weight: 900; color: #0e0e0e; letter-spacing: -0.5px;">● fielty</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0e0e0e; margin-bottom: 8px;">
              Bienvenido a ${negocio.nombre}
            </h1>
            <p style="font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 28px;">
              Hola <strong>${nuevoCliente.nombre.split(' ')[0]}</strong>, tu tarjeta de puntos fue creada con <strong>${puntosRecibidos} puntos de regalo</strong>. Empezá a acumular en cada compra y canjealos por premios.
            </p>
            <a href="${appUrl}/mi-tarjeta" style="display: inline-block; background: #e0001b; color: white; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none; margin-bottom: 32px;">
              Ver mi tarjeta
            </a>
            <p style="font-size: 12px; color: #aaa; padding-top: 24px; border-top: 1px solid #e8eaf0; margin: 0;">
              Fielty · <a href="${appUrl}" style="color: #aaa; text-decoration: none;">fielty.app</a>
            </p>
          </div>
        `,
      }).catch(() => {}))
    }

    return NextResponse.json({
      ok: true,
      clienteId: nuevoCliente.id,
    })

  } catch (error) {
    console.error('registrar error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
