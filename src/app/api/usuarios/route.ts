import { NextResponse } from 'next/server'
import { getUsuarioActual } from '@/lib/supabase/server'
import type { ApiResult, CrearUsuarioDTO, Usuario } from '@/types'

// POST /api/usuarios
// La identidad siempre sale de la sesión; el navegador nunca envía el UUID.
export async function POST(req: Request) {
  let body: CrearUsuarioDTO

  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 })
  }

  if (!body.nombre?.trim() || !body.apellido_paterno?.trim()) {
    return NextResponse.json<ApiResult<never>>(
      { error: 'nombre y apellido_paterno son requeridos' },
      { status: 400 }
    )
  }

  const { supabase, authUser, usuario } = await getUsuarioActual()
  if (!authUser) return NextResponse.json<ApiResult<never>>({ error: 'No autenticado' }, { status: 401 })
  if (usuario) return NextResponse.json<ApiResult<Usuario>>({ data: usuario })

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      usuario_uuid: authUser.id,
      nombre: body.nombre.trim(),
      apellido_paterno: body.apellido_paterno.trim(),
      apellido_materno: body.apellido_materno?.trim() || null,
      imagen_perfil: body.imagen_perfil ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/usuarios]', error)
    return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  }

  return NextResponse.json<ApiResult<Usuario>>({ data }, { status: 201 })
}

// GET /api/usuarios
// Devuelve únicamente el perfil de la sesión autenticada.
export async function GET() {
  const { authUser, usuario } = await getUsuarioActual()
  if (!authUser) return NextResponse.json<ApiResult<never>>({ error: 'No autenticado' }, { status: 401 })
  if (!usuario) return NextResponse.json<ApiResult<never>>({ error: 'Usuario no encontrado' }, { status: 404 })
  return NextResponse.json<ApiResult<Usuario>>({ data: usuario })
}
