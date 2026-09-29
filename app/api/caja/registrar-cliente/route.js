import { NextResponse, after } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin, validarPinCaja, getRequestIp } from '@/lib/server'
import { calcularPuntos } from '@/lib/puntos'
import { emailValido } from '@/lib/clientes'
import { limiteClientes } from '@/lib/planes'

export async function POST(request) {
  try {
    const { negocioId, sucursalId, nombre, dni, email, telefono, monto, pin } = await request.json()

    if (!negocioId || !nombre || !dni || !pin) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }
    // El email es opcional en la caja, pero si se carga tiene que servir:
    // uno mal escrito no recibe los puntos por mail ni puede recuperar la
    // contraseña. Mejor que lo corrija quien lo está cargando, que tiene al
    // cliente adelante.
    if (email && !emailValido(email)) {
      return NextResponse.json({ error: 'El email parece mal escrito. Revisalo o dejalo vacío.' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Valida el PIN del negocio o de la sucursal (puede tener PIN propio)
    const auth = await validarPinCaja(supabaseAdmin, { negocioId, sucursalId, pin, ip: getRequestIp(request) })
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
    const { negocio } = auth

    // Verificar límite del plan
    const { count } = await supabaseAdmin
      .from('clientes').select('*', { count: 'exact', head: true }).eq('negocio_id', negocioId)

    if (count >= limiteClientes(negocio)) {
      return NextResponse.json({ error: 'Límite de clientes alcanzado en el plan gratuito' }, { status: 403 })
    }

    // Verificar duplicado por DNI en este negocio
    const { data: existente } = await supabaseAdmin
      .from('clientes').select('id').eq('negocio_id', negocioId).eq('dni', dni).maybeSingle()

    if (existente) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese DNI en este negocio' }, { status: 409 })
    }

    // Calcular puntos: bienvenida + consumo (si se ingresó monto)
    const puntosBienvenida = negocio.puntos_bienvenida ?? 10
    const ptsConsumo = monto
      ? calcularPuntos(parseInt(monto), negocio.pesos_por_punto, negocio.puntos_por_tramo)
      : 0
    const puntosIniciales = puntosBienvenida + ptsConsumo

    const passwordHash = await bcrypt.hash(String(dni), 10)

    const { data, error: insertError } = await supabaseAdmin
      .from('clientes')
      .insert([{
        nombre,
        dni: String(dni),
        email: email || null,
        telefono: telefono || null,
        negocio_id: negocioId,
        puntos: puntosIniciales,
        puntos_historicos: puntosIniciales,
        password_hash: passwordHash,
        debe_cambiar_password: true,
      }])
      .select()

    if (insertError) {
      console.error('Error insertando cliente desde caja:', insertError)
      return NextResponse.json({ error: 'Error al registrar, intentá de nuevo' }, { status: 500 })
    }

    // Solo los campos que la caja necesita (nunca password_hash)
    const { id, nombre: nombreCliente, dni: dniCliente, telefono: telCliente, puntos, puntos_historicos } = data[0]

    // El aviso de límite también tiene que salir cuando el cliente lo carga
    // el dueño y no solo cuando se registra por QR: un negocio que carga todo
    // desde la caja llegaba al tope sin haber recibido ningún aviso. Mismo
    // pedido que hace /api/cliente/registrar.
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

    return NextResponse.json({
      ok: true,
      cliente: { id, nombre: nombreCliente, dni: dniCliente, telefono: telCliente, puntos, puntos_historicos },
      puntosBienvenida,
      ptsConsumo,
      puntosIniciales,
    })

  } catch (error) {
    console.error('registrar-cliente caja error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
