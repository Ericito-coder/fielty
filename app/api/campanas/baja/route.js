import { getSupabaseAdmin } from '@/lib/server'

// Link de baja de los emails de campaña. Marca acepta_marketing=false
// y muestra una confirmación simple.
export async function GET(request) {
  const clienteId = new URL(request.url).searchParams.get('c')

  let mensaje = 'El link no es válido.'
  if (clienteId) {
    try {
      const supabaseAdmin = getSupabaseAdmin()
      const { data } = await supabaseAdmin
        .from('clientes')
        .update({ acepta_marketing: false })
        .eq('id', clienteId)
        .select('id')
      mensaje = data?.length
        ? 'Listo, no vas a recibir más emails promocionales. Tus puntos siguen activos.'
        : 'El link no es válido.'
    } catch {
      mensaje = 'Hubo un error, intentá de nuevo más tarde.'
    }
  }

  return new Response(`<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fielty</title></head>
<body style="font-family: sans-serif; background: #f0f2f7; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
  <div style="background: white; border-radius: 24px; padding: 40px 32px; max-width: 380px; text-align: center;">
    <div style="font-size: 40px; margin-bottom: 16px;">✅</div>
    <div style="font-size: 16px; font-weight: 700; color: #0e0e0e; margin-bottom: 8px;">${mensaje}</div>
    <a href="https://www.fielty.app/mi-tarjeta" style="font-size: 13px; color: #666;">Ver mi tarjeta</a>
  </div>
</body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
