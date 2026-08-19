import { NextResponse } from 'next/server'
import { getUsuarioActual } from '@/lib/supabase/server'
import { fechaHoy } from '@/lib/supabase/helpers'
import type { ApiResult, CrearSesionDTO, FinalizarSesionDTO, Sesion } from '@/types'

function noAutorizado() {
  return NextResponse.json<ApiResult<never>>({ error: 'No autenticado o perfil incompleto' }, { status: 401 })
}

export async function POST(req: Request) {
  let body: CrearSesionDTO
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()

  if (body.split_id) {
    const { data: split } = await supabase.from('splits').select('split_id').eq('split_id', body.split_id).is('eliminado_en', null).maybeSingle()
    if (!split) return NextResponse.json<ApiResult<never>>({ error: 'Split no encontrado' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('sesiones')
    .insert({ usuario_id: usuario.usuario_id, split_id: body.split_id ?? null, notas: body.notas ?? null })
    .select()
    .single()

  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<Sesion>>({ data }, { status: 201 })
}

export async function GET(req: Request) {
  const limit = Math.min(Math.max(parseInt(new URL(req.url).searchParams.get('limit') ?? '30') || 30, 1), 100)
  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()

  const { data, error } = await supabase
    .from('sesiones')
    .select()
    .eq('usuario_id', usuario.usuario_id)
    .order('iniciado_en', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<Sesion[]>>({ data })
}

export async function PATCH(req: Request) {
  let body: FinalizarSesionDTO
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }
  if (!body.sesion_id || !body.finalizado_en) return NextResponse.json<ApiResult<never>>({ error: 'sesion_id y finalizado_en son requeridos' }, { status: 400 })

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()

  const { count } = await supabase
    .from('series')
    .select('*', { count: 'exact', head: true })
    .eq('sesion_id', body.sesion_id)
    .not('finalizado_en', 'is', null)

  const { data: sesion, error } = await supabase
    .from('sesiones')
    .update({ finalizado_en: body.finalizado_en, notas: body.notas ?? null })
    .eq('sesion_id', body.sesion_id)
    .eq('usuario_id', usuario.usuario_id)
    .select()
    .single()

  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  if ((count ?? 0) > 0) await actualizarRacha(supabase, usuario.usuario_id)
  return NextResponse.json<ApiResult<Sesion>>({ data: sesion })
}

async function actualizarRacha(supabase: Awaited<ReturnType<typeof getUsuarioActual>>['supabase'], usuarioId: number) {
  const { data: sesiones } = await supabase
    .from('sesiones')
    .select('iniciado_en')
    .eq('usuario_id', usuarioId)
    .not('finalizado_en', 'is', null)
    .order('iniciado_en', { ascending: false })
    .limit(2)
  if (!sesiones?.length) return

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('racha_actual, racha_maxima')
    .eq('usuario_id', usuarioId)
    .single()
  if (!usuario) return

  const anterior = sesiones[1]?.iniciado_en.slice(0, 10)
  const diasDesde = anterior ? Math.round((new Date(fechaHoy()).getTime() - new Date(anterior).getTime()) / 86_400_000) : null
  const nuevaRacha = diasDesde === null || diasDesde > 1 ? 1 : diasDesde === 1 ? usuario.racha_actual + 1 : null
  if (nuevaRacha === null) return

  await supabase.from('usuarios').update({ racha_actual: nuevaRacha, racha_maxima: Math.max(nuevaRacha, usuario.racha_maxima) }).eq('usuario_id', usuarioId)
}
