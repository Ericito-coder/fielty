import { NextResponse } from 'next/server'

// Este endpoint fue reemplazado por /api/cliente/registrar
// que hashea la contraseña de forma segura durante el registro
export async function POST() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
