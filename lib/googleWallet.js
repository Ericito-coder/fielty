import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/server'
import { puedeUsarWallet } from '@/lib/planes'
import { codigoCliente } from '@/lib/clientes'

/**
 * Integración con Google Wallet (pases de fidelidad).
 * Solo servidor: usa la clave privada de la cuenta de servicio.
 *
 * Modelo: una LoyaltyClass por negocio y un LoyaltyObject por
 * cliente. El cliente agrega el pase con un link "Save to Google
 * Wallet" (JWT firmado) y el saldo se actualiza vía PATCH cada vez
 * que suma o canjea puntos.
 */

const API = 'https://walletobjects.googleapis.com/walletobjects/v1'
const APP_URL = 'https://www.fielty.app'

function getConfig() {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT
  if (!issuerId || !raw) return null
  try {
    return { issuerId, sa: JSON.parse(raw) }
  } catch {
    return null
  }
}

export function walletDisponible() {
  return getConfig() !== null
}

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function firmarJwt(payload, sa) {
  const header = { alg: 'RS256', typ: 'JWT' }
  const cuerpo = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`
  const firma = crypto.createSign('RSA-SHA256').update(cuerpo).sign(sa.private_key)
  return `${cuerpo}.${firma.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
}

async function getAccessToken(sa) {
  const ahora = Math.floor(Date.now() / 1000)
  const jwt = firmarJwt({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
    aud: 'https://oauth2.googleapis.com/token',
    iat: ahora,
    exp: ahora + 3600,
  }, sa)

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  })
  const data = await res.json()
  if (!data.access_token) {
    throw new Error('Sin token de Wallet: ' + JSON.stringify(data).slice(0, 200))
  }
  return data.access_token
}

const classId = (cfg, negocioId) => `${cfg.issuerId}.fielty-${negocioId}`
const objectId = (cfg, clienteId) => `${cfg.issuerId}.cliente-${clienteId}`

// Nivel del cliente según puntos históricos (mismo criterio que la tarjeta web).
function nivelDe(puntosHistoricos = 0) {
  if (puntosHistoricos >= 5000) return 'Oro'
  if (puntosHistoricos >= 1000) return 'Plata'
  return 'Bronce'
}

// Texto motivador de la próxima recompensa alcanzable.
function proximaRecompensaTexto(puntos = 0, recompensas = []) {
  const proxima = recompensas
    .filter(r => r.puntos_necesarios > puntos)
    .sort((a, b) => a.puntos_necesarios - b.puntos_necesarios)[0]
  if (!proxima) {
    return recompensas.length ? '¡Ya podés canjear tus premios!' : null
  }
  return `Te faltan ${proxima.puntos_necesarios - puntos} pts para: ${proxima.nombre}`
}

// Campos del pase que dependen del saldo (se recalculan al acreditar/canjear).
function camposDinamicos({ puntos, puntosHistoricos, recompensas }) {
  const campos = {
    loyaltyPoints: { label: 'Puntos', balance: { int: puntos || 0 } },
    secondaryLoyaltyPoints: { label: 'Nivel', balance: { string: nivelDe(puntosHistoricos) } },
  }
  const texto = proximaRecompensaTexto(puntos, recompensas)
  if (texto) {
    campos.textModulesData = [{ id: 'proxima', header: 'Tu próximo premio', body: texto }]
  }
  return campos
}

// Lo único de la clase que el negocio puede cambiar después de crearla:
// su nombre, su logo y su color de marca.
function camposPresentacion(negocio) {
  return {
    programName: negocio.nombre,
    programLogo: { sourceUri: { uri: negocio.logo_url || `${APP_URL}/icons/icon-512.png` } },
    hexBackgroundColor: negocio.color || '#e0001b',
  }
}

function presentacionCambio(actual, deseada) {
  return actual.programName !== deseada.programName
    || actual.hexBackgroundColor !== deseada.hexBackgroundColor
    || actual.programLogo?.sourceUri?.uri !== deseada.programLogo.sourceUri.uri
}

// Crea la clase del negocio si no existe, y si ya existe le sincroniza la
// marca (idempotente).
async function asegurarClase(cfg, token, negocio) {
  const id = classId(cfg, negocio.id)
  const presentacion = camposPresentacion(negocio)

  const existe = await fetch(`${API}/loyaltyClass/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (existe.ok) {
    // Si el negocio se renombró, cambió su color o subió un logo, la clase
    // tiene que reflejarlo: sin este PATCH el pase de todos sus clientes
    // queda congelado con los datos del día que se creó. Como la clase es
    // compartida, un solo PATCH actualiza el pase de todos.
    //
    // El `reviewStatus: UNDER_REVIEW` es obligatorio aunque no queramos
    // tocar ese campo. Google valida el recurso resultante del merge, y una
    // clase ya aprobada lo deja en `APPROVED`, que no es un valor válido de
    // entrada: el PATCH sin este campo devuelve 400 con
    // "Invalid review status APPROVED. Use UNDER_REVIEW instead".
    //
    // Mandarlo no reintroduce el prefijo "[SOLO PARA PRUEBAS]": ese prefijo
    // depende del acceso a producción de la cuenta emisora, no del
    // reviewStatus de la clase. Verificado con un negocio nuevo, cuya clase
    // nació en UNDER_REVIEW y aun así emitió el pase sin prefijo.
    try {
      const actual = await existe.json()
      if (presentacionCambio(actual, presentacion)) {
        const res = await fetch(`${API}/loyaltyClass/${id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...presentacion, reviewStatus: 'UNDER_REVIEW' }),
        })
        if (!res.ok) {
          console.error(`wallet class patch error (${res.status}) negocio ${negocio.id}:`, (await res.text()).slice(0, 300))
        }
      }
    } catch (error) {
      // Que no se caiga el link de "agregar a Wallet" por no poder
      // refrescar la marca: el pase sirve igual con los datos viejos.
      console.error('wallet class patch error:', error?.message)
    }
    return id
  }

  const clase = {
    id,
    issuerName: 'Fielty',
    ...presentacion,
    reviewStatus: 'UNDER_REVIEW',
    countryCode: 'AR',
  }
  const res = await fetch(`${API}/loyaltyClass`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(clase),
  })
  if (!res.ok) {
    throw new Error('No se pudo crear la clase: ' + (await res.text()).slice(0, 300))
  }
  return id
}

/**
 * Genera el link "Agregar a Google Wallet" para un cliente.
 * cliente: { id, nombre, puntos, puntos_historicos } — negocio: { id, nombre, color, logo_url }
 * recompensas: [{ nombre, puntos_necesarios }] activas del negocio (opcional)
 */
export async function generarLinkWallet(cliente, negocio, recompensas = []) {
  const cfg = getConfig()
  if (!cfg) return null

  const token = await getAccessToken(cfg.sa)
  const idClase = await asegurarClase(cfg, token, negocio)

  const objeto = {
    id: objectId(cfg, cliente.id),
    classId: idClase,
    state: 'ACTIVE',
    // El "ID de miembro" que ve el cliente en el pase: el código corto,
    // no el UUID. Es el mismo que figura debajo del QR de su tarjeta.
    accountId: codigoCliente(cliente.id),
    accountName: cliente.nombre,
    ...camposDinamicos({ puntos: cliente.puntos, puntosHistoricos: cliente.puntos_historicos, recompensas }),
    barcode: {
      type: 'QR_CODE',
      value: `${APP_URL}/tarjeta/${cliente.id}`,
      alternateText: codigoCliente(cliente.id),
    },
    linksModuleData: {
      uris: [{ uri: `${APP_URL}/tarjeta/${cliente.id}`, description: 'Ver mi tarjeta completa' }],
    },
  }

  const saveJwt = firmarJwt({
    iss: cfg.sa.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [APP_URL],
    payload: { loyaltyObjects: [objeto] },
  }, cfg.sa)

  return `https://pay.google.com/gp/v/save/${saveJwt}`
}

/**
 * Actualiza el pase del cliente (saldo, nivel y próximo premio) tras
 * acreditar o canjear. Si el cliente nunca agregó el pase (404) o
 * Wallet no está configurado, no pasa nada. Recalcula los campos
 * leyendo el estado actual del cliente y sus recompensas.
 *
 * IMPORTANTE: llamarla siempre dentro de `after()` de next/server. Sin
 * eso la función serverless se congela al mandar la respuesta y la
 * llamada a Google queda a mitad de camino: el pase nunca se entera.
 */
export async function actualizarPuntosWallet(clienteId) {
  const cfg = getConfig()
  if (!cfg) return
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('puntos, puntos_historicos, negocio_id, negocio:negocios(plan)')
      .eq('id', clienteId)
      .single()
    if (!cliente) return
    // Misma regla de gating que usa /api/wallet/save-link, para que el
    // pase no quede creado pero sin actualizarse nunca.
    if (!puedeUsarWallet(cliente.negocio?.plan)) return

    const { data: recompensas } = await supabaseAdmin
      .from('recompensas')
      .select('nombre, puntos_necesarios')
      .eq('negocio_id', cliente.negocio_id)
      .eq('activa', true)

    const token = await getAccessToken(cfg.sa)
    const res = await fetch(`${API}/loyaltyObject/${objectId(cfg, clienteId)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(camposDinamicos({
        puntos: cliente.puntos,
        puntosHistoricos: cliente.puntos_historicos,
        recompensas: recompensas || [],
      })),
    })

    // 404 es lo normal en la mayoría de los clientes: nunca agregaron el
    // pase a Wallet. Cualquier otro error sí hay que verlo, porque antes
    // la respuesta se descartaba y un fallo real pasaba inadvertido.
    if (!res.ok && res.status !== 404) {
      console.error(`wallet update error (${res.status}) cliente ${clienteId}:`, (await res.text()).slice(0, 300))
    }
  } catch (error) {
    console.error('wallet update error:', error?.message)
  }
}
