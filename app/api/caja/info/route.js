import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/server'

// Info que necesita la pantalla de caja antes de ingresar el PIN.
// Solo campos seguros: el PIN jamás sale del servidor.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const sucursalSlug = searchParams.get('sucursal')
    if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select('id, nombre, slug, color, pesos_por_punto, puntos_por_tramo')
      .eq('slug', slug)
      .single()

    if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    let sucursal = null
    if (sucursalSlug) {
      const { data } = await supabaseAdmin
        .from('sucursales')
        .select('id, nombre, slug')
        .eq('negocio_id', negocio.id)
        .eq('slug', sucursalSlug)
        .single()
      if (!data) return NextResponse.json({ error: 'Sucursal no encontrada' }, { status: 404 })
      sucursal = data
    }

    return NextResponse.json({ negocio, sucursal })
  } catch (error) {
    console.error('caja info error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
