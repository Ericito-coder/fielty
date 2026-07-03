import { NextResponse } from 'next/server'
import { getSupabaseAdmin, NEGOCIO_CAMPOS_PUBLICOS } from '@/lib/server'

// Info pública de un negocio por slug, para las páginas de registro
// y QR. Solo expone campos seguros (nunca pin_caja ni user_id).
export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'Falta slug' }, { status: 400 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: negocio } = await supabaseAdmin
      .from('negocios')
      .select(NEGOCIO_CAMPOS_PUBLICOS)
      .eq('slug', slug)
      .single()

    if (!negocio) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

    return NextResponse.json({ negocio })
  } catch (error) {
    console.error('negocio-publico error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
