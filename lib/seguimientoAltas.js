import { enviarEmail } from './email'
import { esPago } from './planes'

/**
 * Seguimiento automático de las altas nuevas.
 *
 * Un negocio que se registra y no llega a cargar su primer cliente no
 * vuelve nunca. Esto le manda al dueño UN mail según dónde se trabó,
 * una sola vez por etapa, y firmado por una persona: a esta escala lo
 * que trae respuestas es que conteste alguien, no un newsletter.
 *
 * El primer mail sale la mañana siguiente al alta, no a los días: de los
 * negocios que alguna vez cargaron puntos, el 93% lo hizo en las primeras
 * 48 horas, y pasado ese plazo casi ninguno arranca (análisis de las 93
 * altas hasta el 28/09/2026). Un mail al tercer día llega con la
 * ventana ya cerrada.
 *
 * Corre dentro del cron de cumpleaños (12:00 UTC = 9 AM Argentina), que
 * es buena hora para que un comerciante lea el mail.
 */

const APP = process.env.NEXT_PUBLIC_APP_URL || 'https://www.fielty.app'

// Tope por corrida. El plan gratis de Resend son 100 mails por día y de
// ahí también salen los transaccionales (bienvenida, canjes, campañas),
// así que el seguimiento se queda con una porción chica. Si entran 50
// altas juntas, el resto espera al día siguiente en vez de comerse la
// cuota que necesita el producto para funcionar.
const MAX_POR_CORRIDA = 20

// No mirar más atrás de esto. Sin el techo, la primera corrida le
// escribiría a toda la base histórica de una sentada; y pasadas dos
// semanas, un "¿te doy una mano para arrancar?" ya llega tarde.
const DIAS_MAX = 14

// Horas mínimas desde el alta. Con el cron a las 9 AM, el mail sale la
// primera mañana que caiga al menos 12 horas después: nunca el mismo día
// del alta (ese día todavía está probando) y siempre dentro de las 36
// horas.
const HORAS_MIN = 12

// Un negocio no recibe dos mails de seguimiento en la misma semana,
// aunque cambie de etapa (ej: carga la recompensa al día siguiente).
const DIAS_ENTRE_MAILS = 7

/**
 * Decide qué mail le toca a un negocio. El orden importa: se atiende
 * primero lo que está más roto. La espera desde el alta ya la filtró la
 * consulta, así que acá solo se mira dónde se trabó.
 */
function etapaDe({ clientes, recompensas }) {
  if (recompensas === 0) return 'setup_incompleto'
  if (clientes === 0) return 'sin_clientes'
  return 'primeros_clientes'
}

export async function enviarSeguimientoAltas(supabaseAdmin) {
  const ahora = Date.now()
  const hora = 60 * 60 * 1000
  const dia = 24 * hora

  // Los más nuevos primero: si el tope de la corrida corta la lista, que
  // queden afuera los que tienen menos chance de arrancar.
  const { data: negocios } = await supabaseAdmin
    .from('negocios')
    .select('id, nombre, slug, user_id, created_at, plan')
    .gte('created_at', new Date(ahora - DIAS_MAX * dia).toISOString())
    .lte('created_at', new Date(ahora - HORAS_MIN * hora).toISOString())
    .order('created_at', { ascending: false })

  if (!negocios?.length) return { candidatos: 0, enviados: 0, fallados: 0 }

  const ids = negocios.map(n => n.id)
  const [{ data: clientes }, { data: recompensas }, { data: previos }] = await Promise.all([
    supabaseAdmin.from('clientes').select('negocio_id').in('negocio_id', ids),
    supabaseAdmin.from('recompensas').select('negocio_id').in('negocio_id', ids),
    supabaseAdmin.from('negocio_emails').select('negocio_id, etapa, enviado_at').in('negocio_id', ids),
  ])

  const contar = (filas) => {
    const m = new Map()
    for (const f of filas || []) m.set(f.negocio_id, (m.get(f.negocio_id) || 0) + 1)
    return m
  }
  const porClientes = contar(clientes)
  const porRecompensas = contar(recompensas)

  const etapasUsadas = new Set()
  const ultimoMail = new Map()
  for (const p of previos || []) {
    etapasUsadas.add(`${p.negocio_id}:${p.etapa}`)
    const t = new Date(p.enviado_at).getTime()
    if (t > (ultimoMail.get(p.negocio_id) || 0)) ultimoMail.set(p.negocio_id, t)
  }

  let enviados = 0
  let candidatos = 0
  const fallados = []

  for (const negocio of negocios) {
    if (enviados >= MAX_POR_CORRIDA) break

    // Al que ya paga (o tiene un plan de cortesía) no: casi siempre pasó
    // por Eric antes de pagar, y un "¿pudiste probarlo?" a alguien que
    // acaba de pagar suena a mail automático.
    if (esPago(negocio.plan)) continue

    const datos = {
      clientes: porClientes.get(negocio.id) || 0,
      recompensas: porRecompensas.get(negocio.id) || 0,
    }

    const etapa = etapaDe(datos)
    if (!etapa) continue
    if (etapasUsadas.has(`${negocio.id}:${etapa}`)) continue

    const ultimo = ultimoMail.get(negocio.id)
    if (ultimo && ahora - ultimo < DIAS_ENTRE_MAILS * dia) continue

    candidatos++

    // El mail del dueño vive en auth.users, no en `negocios`.
    const { data: cuenta } = await supabaseAdmin.auth.admin.getUserById(negocio.user_id)
    const email = cuenta?.user?.email
    if (!email) continue

    // Reservar ANTES de mandar: si el insert falla es porque otra
    // corrida ya tomó esta etapa, y entonces el mail no sale.
    const { error: choque } = await supabaseAdmin
      .from('negocio_emails')
      .insert([{ negocio_id: negocio.id, etapa }])
    if (choque) continue

    const { asunto, html, text } = armarMail(etapa, negocio, datos)
    const ok = await enviarEmail({
      from: 'Eric de Fielty <hola@fielty.app>',
      to: email,
      subject: asunto,
      html,
      text,
    })

    if (ok) {
      enviados++
    } else {
      fallados.push(negocio.slug)
      await supabaseAdmin
        .from('negocio_emails')
        .update({ ok: false })
        .eq('negocio_id', negocio.id)
        .eq('etapa', etapa)
    }
  }

  if (fallados.length) console.error('seguimiento altas sin enviar:', fallados)
  return { candidatos, enviados, fallados: fallados.length }
}

// --- Mails ---------------------------------------------------
//
// El saludo, la despedida y la forma de pedir cada cosa los eligió Eric:
// es como él se lo diría a un comerciante. Sin guiones largos ni frases
// de eslogan, porque tienen que leerse como un mail que escribió una
// persona y no como algo generado.

const SALUDO = 'Hola! ¿Cómo andás? Soy Eric, de Fielty.'
const DESPEDIDA = 'Lo que necesites, avisame.'

function armarMail(etapa, negocio, { clientes }) {
  const nombre = escapar(negocio.nombre)
  const link = (url, texto) => `<a href="${url}" style="color:#e0001b">${texto}</a>`
  const caja = `${APP}/c/${negocio.slug}`

  if (etapa === 'setup_incompleto') {
    return plantilla({
      asunto: `Te faltó un paso en ${negocio.nombre}`,
      parrafos: [
        `Vi que creaste ${nombre} pero te faltó cargar la recompensa, que es lo que tus clientes van a canjear con los puntos.`,
        `Se hace en un minuto desde ${link(`${APP}/dashboard`, 'tu panel')}. Lo que mejor funciona es algo que ya regalás igual, tipo un descuento o algo chico de lo que vendés, y que se consiga con 4 o 5 compras.`,
        'Si te trabaste en algo decime y lo vemos juntos.',
      ],
    })
  }

  if (etapa === 'sin_clientes') {
    return plantilla({
      asunto: '¿Pudiste probar Fielty?',
      parrafos: [
        `Vi que creaste ${nombre} pero todavía no cargaste ningún cliente. ¿Pudiste probarlo? Si te trabaste en algo decime y lo vemos juntos.`,
        `Si querés arrancar ya, el primero lo cargás vos desde ${link(caja, 'la caja')}: ponés el nombre y el teléfono y ya tiene su tarjeta.`,
      ],
    })
  }

  const cuantos = clientes === 1 ? 'su primer cliente' : `sus primeros ${clientes} clientes`
  return plantilla({
    asunto: clientes === 1
      ? `${negocio.nombre} ya tiene su primer cliente`
      : `${negocio.nombre} ya tiene ${clientes} clientes`,
    parrafos: [
      `Vimos que ${nombre} ya sumó ${cuantos}. Ahora seguí sumando, que con más clientes es cuando se empieza a notar.`,
      'Hay varias formas:',
    ],
    lista: [
      `Cargarlos vos desde ${link(caja, 'la caja')} cuando te pagan.`,
      `Imprimir ${link(`${APP}/qr/${negocio.slug}`, 'el cartel con el QR')} y dejarlo a la vista donde te pagan, así se anotan solos con el celu.`,
      `Pasarles ${link(`${APP}/registro/${negocio.slug}`, 'tu link de registro')} por WhatsApp o ponerlo en tu Instagram.`,
      'Cada cliente tiene en su tarjeta un link para invitar amigos, y cuando se suma alguien ganan puntos los dos.',
    ],
  })
}

const PIE = 'Te escribo porque creaste una cuenta en Fielty. Si no querés que te escriba más, respondé "baja" y listo.'

/**
 * Con pinta de mail normal, sin logo ni botones: como si Eric lo hubiera
 * escrito desde su casilla. Un mail con diseño de newsletter se lee como
 * automático aunque el texto sea humano, y Gmail suele mandarlo a
 * Promociones.
 */
function plantilla({ asunto, parrafos, lista }) {
  const p = (t) => `<p style="margin:0 0 16px">${t}</p>`

  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">' +
    p(SALUDO) +
    parrafos.map(p).join('') +
    (lista ? `<ul style="margin:0 0 16px;padding-left:20px">${lista.map(i => `<li style="margin-bottom:6px">${i}</li>`).join('')}</ul>` : '') +
    p(DESPEDIDA) +
    '<p style="margin:0">Eric</p>' +
    `<p style="margin:32px 0 0;font-size:12px;color:#999">${PIE}</p>` +
    '</div>'

  const text = [
    SALUDO,
    '',
    ...parrafos.flatMap(t => [sinHtml(t), '']),
    ...(lista ? [...lista.map(i => `• ${sinHtml(i)}`), ''] : []),
    DESPEDIDA,
    '',
    'Eric',
    '',
    PIE,
  ].join('\n')

  return { asunto, html, text }
}

// La versión de texto plano sale del mismo string que el HTML: los links
// pasan a "texto (dirección)" para no perderlos, se sacan las etiquetas y
// se vuelven a poner los caracteres que `escapar` convirtió en entidades,
// o un negocio llamado "A & B" se lee "A &amp; B".
const sinHtml = (t) =>
  t.replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

// El nombre del negocio lo escribe el dueño: puede traer < o &.
const escapar = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
