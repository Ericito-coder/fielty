import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/server'

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

// Crea la clase del negocio si no existe todavía (idempotente).
async function asegurarClase(cfg, token, negocio) {
  const id = classId(cfg, negocio.id)
  const existe = await fetch(`${API}/loyaltyClass/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (existe.ok) return id

  const clase = {
    id,
    issuerName: 'Fielty',
    programName: negocio.nombre,
    programLogo: { sourceUri: { uri: negocio.logo_url || `${APP_URL}/icons/icon-512.png` } },
    hexBackgroundColor: negocio.color || '#e0001b',
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
    accountId: cliente.id,
    accountName: cliente.nombre,
    ...camposDinamicos({ puntos: cliente.puntos, puntosHistoricos: cliente.puntos_historicos, recompensas }),
    barcode: {
      type: 'QR_CODE',
      value: `${APP_URL}/tarjeta/${cliente.id}`,
      alternateText: `FLT-${cliente.id.slice(0, 5).toUpperCase()}`,
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
 * acreditar o canjear. Fire-and-forget: si el cliente nunca agregó el
 * pase (404) o Wallet no está configurado, no pasa nada. Recalcula los
 * campos leyendo el estado actual del cliente y sus recompensas.
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
    // Wallet es feature del plan Business
    if (cliente.negocio?.plan !== 'business') return

    const { data: recompensas } = await supabaseAdmin
      .from('recompensas')
      .select('nombre, puntos_necesarios')
      .eq('negocio_id', cliente.negocio_id)
      .eq('activa', true)

    const token = await getAccessToken(cfg.sa)
    await fetch(`${API}/loyaltyObject/${objectId(cfg, clienteId)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(camposDinamicos({
        puntos: cliente.puntos,
        puntosHistoricos: cliente.puntos_historicos,
        recompensas: recompensas || [],
      })),
    })
  } catch (error) {
    console.error('wallet update error:', error?.message)
  }
}
