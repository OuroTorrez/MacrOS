import { NextResponse } from 'next/server'
import { getUsuarioActual } from '@/lib/supabase/server'
import type { ApiResult, CrearSerieDTO, PR, Serie } from '@/types'

function noAutorizado() {
  return NextResponse.json<ApiResult<never>>({ error: 'No autenticado o perfil incompleto' }, { status: 401 })
}

export async function POST(req: Request) {
  let body: CrearSerieDTO
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }

  const { sesion_id, ejercicio_id, numero_serie, repeticiones, peso_kg } = body
  if (!sesion_id || !ejercicio_id || !numero_serie || !repeticiones || !Number.isFinite(peso_kg) || peso_kg < 0) {
    return NextResponse.json<ApiResult<never>>({ error: 'Datos de serie inválidos' }, { status: 400 })
  }

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()

  const { data: sesion } = await supabase
    .from('sesiones')
    .select('sesion_id')
    .eq('sesion_id', sesion_id)
    .eq('usuario_id', usuario.usuario_id)
    .maybeSingle()
  if (!sesion) return NextResponse.json<ApiResult<never>>({ error: 'Sesión no encontrada' }, { status: 404 })

  const { data: serie, error: errorSerie } = await supabase
    .from('series')
    .insert({ sesion_id, ejercicio_id, numero_serie, repeticiones, peso_kg, notas: body.notas ?? null })
    .select()
    .single()
  if (errorSerie) return NextResponse.json<ApiResult<never>>({ error: errorSerie.code === '23505' ? `La serie ${numero_serie} de este ejercicio ya existe en esta sesión` : errorSerie.message }, { status: errorSerie.code === '23505' ? 409 : 500 })

  const { data: prActual } = await supabase
    .from('prs')
    .select('peso_kg')
    .eq('usuario_id', usuario.usuario_id)
    .eq('ejercicio_id', ejercicio_id)
    .order('peso_kg', { ascending: false })
    .limit(1)
    .maybeSingle()
  const esPr = !prActual || peso_kg > prActual.peso_kg

  if (esPr) {
    const nuevoPR: Omit<PR, 'pr_id'> = { usuario_id: usuario.usuario_id, ejercicio_id, serie_id: serie.serie_id, sesion_id, peso_kg, repeticiones, fecha: new Date().toISOString().slice(0, 10) }
    const { error } = await supabase.from('prs').insert(nuevoPR)
    if (error) console.error('[POST /api/series] PR insert failed:', error)
  }

  return NextResponse.json<ApiResult<Serie & { es_pr: boolean }>>({ data: { ...serie, es_pr: esPr } }, { status: 201 })
}

export async function PATCH(req: Request) {
  let body: { serie_id: number; finalizado_en: string; notas?: string }
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }
  if (!body.serie_id || !body.finalizado_en) return NextResponse.json<ApiResult<never>>({ error: 'serie_id y finalizado_en son requeridos' }, { status: 400 })

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()
  const { data: serie } = await supabase.from('series').select('sesion_id').eq('serie_id', body.serie_id).maybeSingle()
  if (!serie) return NextResponse.json<ApiResult<never>>({ error: 'Serie no encontrada' }, { status: 404 })

  const { data: sesion } = await supabase.from('sesiones').select('sesion_id').eq('sesion_id', serie.sesion_id).eq('usuario_id', usuario.usuario_id).maybeSingle()
  if (!sesion) return NextResponse.json<ApiResult<never>>({ error: 'No autorizado' }, { status: 403 })

  const { data, error } = await supabase.from('series').update({ finalizado_en: body.finalizado_en, notas: body.notas ?? null }).eq('serie_id', body.serie_id).select().single()
  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<Serie>>({ data })
}

export async function GET(req: Request) {
  const sesionId = Number(new URL(req.url).searchParams.get('sesion_id'))
  if (!Number.isInteger(sesionId) || sesionId < 1) return NextResponse.json<ApiResult<never>>({ error: 'sesion_id es requerido' }, { status: 400 })

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return noAutorizado()
  const { data: sesion } = await supabase.from('sesiones').select('sesion_id').eq('sesion_id', sesionId).eq('usuario_id', usuario.usuario_id).maybeSingle()
  if (!sesion) return NextResponse.json<ApiResult<never>>({ error: 'Sesión no encontrada' }, { status: 404 })

  const { data, error } = await supabase.from('series').select('*, ejercicios (nombre, grupo_muscular_id)').eq('sesion_id', sesionId).order('ejercicio_id').order('numero_serie')
  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })
  return NextResponse.json<ApiResult<typeof data>>({ data })
}
