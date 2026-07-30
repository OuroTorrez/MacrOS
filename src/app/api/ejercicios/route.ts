import { NextResponse } from 'next/server'
import { getUsuarioActual } from '@/lib/supabase/server'
import type { ApiResult, CrearEjercicioDTO, Ejercicio } from '@/types'

export async function GET(req: Request) {
  const grupoMuscularId = new URL(req.url).searchParams.get('grupo_muscular_id')
  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return NextResponse.json<ApiResult<never>>({ error: 'No autenticado o perfil incompleto' }, { status: 401 })

  let query = supabase
    .from('ejercicios')
    .select('*, grupos_musculares (nombre)')
    .is('eliminado_en', null)
    .or(`usuario_id.is.null,usuario_id.eq.${usuario.usuario_id}`)
    .order('nombre')
  if (grupoMuscularId) query = query.eq('grupo_muscular_id', grupoMuscularId)

  const { data, error } = await query
  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<Ejercicio[]>>({ data })
}

export async function POST(req: Request) {
  let body: CrearEjercicioDTO
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }
  if (!body.nombre?.trim() || !body.grupo_muscular_id) return NextResponse.json<ApiResult<never>>({ error: 'nombre y grupo_muscular_id son requeridos' }, { status: 400 })

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return NextResponse.json<ApiResult<never>>({ error: 'No autenticado o perfil incompleto' }, { status: 401 })
  const { data, error } = await supabase
    .from('ejercicios')
    .insert({ usuario_id: usuario.usuario_id, nombre: body.nombre.trim(), grupo_muscular_id: body.grupo_muscular_id, descripcion: body.descripcion ?? null, imagen_forma: body.imagen_forma ?? null })
    .select()
    .single()

  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<Ejercicio>>({ data }, { status: 201 })
}
