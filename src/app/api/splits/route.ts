import { NextResponse } from 'next/server'
import { intervalToSeg, segToInterval } from '@/lib/supabase/helpers'
import { getUsuarioActual } from '@/lib/supabase/server'
import type { ApiResult, CrearSplitConfiguradoDTO, SplitConfigurado } from '@/types'

type FilaSplit = {
  split_ejercicio_id: number
  split_id: number
  ejercicio_id: number
  orden: number
  series_objetivo: number
  reps_objetivo: number
  descanso: string
  notas: string | null
  ejercicios: { ejercicio_id: number; nombre: string } | null
}

type SplitRaw = {
  split_id: number
  usuario_id: number | null
  nombre: string
  descripcion: string | null
  notas: string | null
  creado_en: string
  actualizado_en: string | null
  eliminado_en: string | null
  split_ejercicios: FilaSplit[] | null
}

function respuestaNoAutorizado() {
  return NextResponse.json<ApiResult<never>>({ error: 'No autenticado o perfil incompleto' }, { status: 401 })
}

export async function GET() {
  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return respuestaNoAutorizado()

  const { data, error } = await supabase
    .from('splits')
    .select('*, split_ejercicios (*, ejercicios (ejercicio_id, nombre))')
    .is('eliminado_en', null)
    .or(`usuario_id.is.null,usuario_id.eq.${usuario.usuario_id}`)
    .order('nombre')

  if (error) return NextResponse.json<ApiResult<never>>({ error: error.message }, { status: 500 })

  const splits: SplitConfigurado[] = ((data ?? []) as SplitRaw[]).map(({ split_ejercicios, usuario_id, descripcion, notas, actualizado_en, eliminado_en, ...split }) => ({
    ...split,
    usuario_id: usuario_id ?? undefined,
    descripcion: descripcion ?? undefined,
    notas: notas ?? undefined,
    actualizado_en: actualizado_en ?? undefined,
    eliminado_en: eliminado_en ?? undefined,
    ejercicios: (split_ejercicios ?? [])
      .sort((a, b) => a.orden - b.orden)
      .flatMap(({ descanso, ejercicios, notas, ...fila }) => ejercicios ? [{ ...fila, notas: notas ?? undefined, descanso_seg: intervalToSeg(descanso), ejercicio: ejercicios }] : []),
  }))

  return NextResponse.json<ApiResult<SplitConfigurado[]>>({ data: splits })
}

export async function POST(req: Request) {
  let body: CrearSplitConfiguradoDTO
  try { body = await req.json() } catch { return NextResponse.json<ApiResult<never>>({ error: 'Body inválido' }, { status: 400 }) }

  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : ''
  const descripcion = typeof body?.descripcion === 'string' ? body.descripcion.trim() : null
  const notas = typeof body?.notas === 'string' ? body.notas.trim() : null
  const ejercicios = Array.isArray(body?.ejercicios) ? body.ejercicios : []
  const esFilaValida = (fila: CrearSplitConfiguradoDTO['ejercicios'][number]) =>
    typeof fila === 'object' && fila !== null && Number.isInteger(fila.ejercicio_id) && Number.isInteger(fila.series_objetivo) && fila.series_objetivo > 0 &&
    Number.isInteger(fila.reps_objetivo) && fila.reps_objetivo > 0 && Number.isInteger(fila.descanso_seg) && fila.descanso_seg >= 0

  if (!nombre || nombre.length > 100 || !Array.isArray(ejercicios) || ejercicios.length === 0 || ejercicios.some(fila => !esFilaValida(fila))) {
    return NextResponse.json<ApiResult<never>>({ error: 'Configura un nombre y al menos un ejercicio válido' }, { status: 400 })
  }
  if (new Set(ejercicios.map(fila => fila.ejercicio_id)).size !== ejercicios.length) {
    return NextResponse.json<ApiResult<never>>({ error: 'No repitas ejercicios dentro del split' }, { status: 400 })
  }

  const { supabase, usuario } = await getUsuarioActual()
  if (!usuario) return respuestaNoAutorizado()

  const ids = ejercicios.map(fila => fila.ejercicio_id)
  const { data: ejerciciosVisibles } = await supabase.from('ejercicios').select('ejercicio_id').in('ejercicio_id', ids).is('eliminado_en', null)
  if (ejerciciosVisibles?.length !== ids.length) return NextResponse.json<ApiResult<never>>({ error: 'Uno o más ejercicios no están disponibles' }, { status: 400 })

  const { data: split, error: errorSplit } = await supabase
    .from('splits')
    .insert({ usuario_id: usuario.usuario_id, nombre, descripcion: descripcion || null, notas: notas || null })
    .select()
    .single()
  if (errorSplit) return NextResponse.json<ApiResult<never>>({ error: errorSplit.message }, { status: 500 })

  const { error: errorDetalles } = await supabase.from('split_ejercicios').insert(
    ejercicios.map((fila, index) => ({
      split_id: split.split_id,
      ejercicio_id: fila.ejercicio_id,
      orden: index + 1,
      series_objetivo: fila.series_objetivo,
      reps_objetivo: fila.reps_objetivo,
      descanso: segToInterval(fila.descanso_seg),
      notas: typeof fila.notas === 'string' ? fila.notas.trim() || null : null,
    }))
  )

  if (errorDetalles) {
    await supabase.from('splits').delete().eq('split_id', split.split_id)
    return NextResponse.json<ApiResult<never>>({ error: errorDetalles.message }, { status: 500 })
  }

  return NextResponse.json<ApiResult<typeof split>>({ data: split }, { status: 201 })
}
