import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { CrearSesionDTO, ApiResult, Sesion } from '@/types'

// POST /api/sesiones
// Body: CrearSesionDTO — el cliente envía la fecha del día
// Si ya existe una sesión para esa fecha, la devuelve (upsert por fecha).
export async function POST(req: Request) {
  let body: CrearSesionDTO

  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ApiResult<never>>(
      { error: 'Body inválido' },
      { status: 400 }
    )
  }

  if (!body.fecha) {
    return NextResponse.json<ApiResult<never>>(
      { error: 'fecha es requerida' },
      { status: 400 }
    )
  }

  // Busca sesión existente para esa fecha antes de crear
  const { data: existente } = await supabase
    .from('sesiones')
    .select()
    .eq('fecha', body.fecha)
    .maybeSingle()

  if (existente) {
    return NextResponse.json<ApiResult<Sesion>>({ data: existente })
  }

  const { data, error } = await supabase
    .from('sesiones')
    .insert({
      id:        crypto.randomUUID(),
      fecha:     body.fecha,
      creado_en: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/sesiones]', error)
    return NextResponse.json<ApiResult<never>>(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResult<Sesion>>({ data }, { status: 201 })
}

// GET /api/sesiones
// Devuelve las últimas 30 sesiones ordenadas por fecha desc
export async function GET() {
  const { data, error } = await supabase
    .from('sesiones')
    .select()
    .order('fecha', { ascending: false })
    .limit(30)

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResult<Sesion[]>>({ data })
}