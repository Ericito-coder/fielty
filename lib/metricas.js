import { getSupabaseAdmin } from './server'

/**
 * Prueba social del landing: números reales contados contra la base.
 *
 * OJO: este módulo importa lib/server.js, que usa la service role key. Todo lo
 * que hay acá corre en el servidor y el resultado ya viene listo para pintar —
 * el componente de cliente recibe strings y no importa nada de este archivo.
 */

/**
 * PISO: abajo de esto la sección no se muestra. Un número chico es peor que
 * ningún número — "12 negocios" invita a pensar "¿solo 12?" y le da al visitante
 * una razón para desconfiar que no tenía antes. Cuando el negocio crezca la
 * sección aparece sola: no hay que tocar el landing, solo este valor.
 *
 * Al 19/08/2026 había 27 negocios registrados y 12 con al menos una venta
 * cargada. Con el piso en 50 la sección todavía NO se muestra, que es la
 * recomendación. Bajalo a 25 si la querés prender ya.
 */
export const PISO_NEGOCIOS = 50

/**
 * Redondea para abajo y devuelve "50+".
 *
 * Que quede por debajo del número real es a propósito: si alguien cuenta, la
 * web se quedó corta y no larga. Un número exacto además envejece mal, queda
 * viejo al día siguiente de publicarlo.
 */
function redondearAbajo(n) {
  if (typeof n !== 'number' || n < 10) return null
  const paso = n >= 1000 ? 100 : 10
  return `${Math.floor(n / paso) * paso}+`
}

/**
 * Devuelve { negocios, clientes } ya redondeados y listos para mostrar, o null
 * si los números no llegan al piso o si la consulta falla. La prueba social no
 * es motivo para romper la home: ante cualquier duda, no se muestra nada.
 *
 * Se llama desde el server component del landing, que revalida cada 6 horas:
 * no es una consulta por visita. `head: true` hace que Postgres devuelva solo
 * el conteo, sin filas.
 */
export async function pruebaSocial() {
  try {
    const supabase = getSupabaseAdmin()

    const [negocios, clientes] = await Promise.all([
      supabase.from('negocios').select('id', { count: 'exact', head: true }),
      supabase.from('clientes').select('id', { count: 'exact', head: true }),
    ])

    if (negocios.error || clientes.error) return null
    if (typeof negocios.count !== 'number') return null
    if (negocios.count < PISO_NEGOCIOS) return null

    // Si el piso quedara abajo de 10, redondearAbajo devuelve null y la frase
    // saldría sin número. Antes que mostrarla rota, no se muestra.
    const negociosTexto = redondearAbajo(negocios.count)
    if (!negociosTexto) return null

    return { negocios: negociosTexto, clientes: redondearAbajo(clientes.count) }
  } catch {
    return null
  }
}
