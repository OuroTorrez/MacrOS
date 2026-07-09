import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { CrearSetDTO, ApiResult, Set, PR } from '@/types'

// POST /api/sets
// Body: CrearSetDTO
// Detecta PR comparando contra el mejor peso histórico del ejercicio.
export async function POST(req: Request) {
  let body: CrearSetDTO

  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ApiResult<never>>(
      { error: 'Body inválido' },
      { status: 400 }
    )
  }

  const { sesion_id, ejercicio_id, reps, peso_kg } = body

  if (!sesion_id || !ejercicio_id || !reps || peso_kg == null) {
    return NextResponse.json<ApiResult<never>>(
      { error: 'sesion_id, ejercicio_id, reps y peso_kg son requeridos' },
      { status: 400 }
    )
  }

  // ── Detectar PR ────────────────────────────────────────────────────────────
  // Buscamos el PR vigente para este ejercicio en Supabase.
  const { data: prActual } = await supabase
    .from('prs')
    .select('peso_kg')
    .eq('ejercicio_id', ejercicio_id)
    .order('peso_kg', { ascending: false })
    .limit(1)
    .maybeSingle()

  const esPr = !prActual || peso_kg > prActual.peso_kg

  // ── Insertar set ───────────────────────────────────────────────────────────
  const nuevoSet: Set = {
    id:           crypto.randomUUID(),
    sesion_id,
    ejercicio_id,
    numero_set:   body.numero_set ?? 1,
    reps,
    peso_kg,
    notas:        body.notas,
    es_pr:        esPr,
    creado_en:    new Date().toISOString(),
  }

  const { data: setInsertado, error: errorSet } = await supabase
    .from('sets')
    .insert(nuevoSet)
    .select()
    .single()

  if (errorSet) {
    console.error('[POST /api/sets]', errorSet)
    return NextResponse.json<ApiResult<never>>(
      { error: errorSet.message },
      { status: 500 }
    )
  }

  // ── Registrar PR si aplica ─────────────────────────────────────────────────
  if (esPr) {
    const nuevoPR: PR = {
      id:           crypto.randomUUID(),
      ejercicio_id,
      peso_kg,
      reps,
      sesion_id,
      set_id:       nuevoSet.id,
      fecha:        new Date().toISOString().slice(0, 10),
    }

    const { error: errorPR } = await supabase.from('prs').insert(nuevoPR)

    if (errorPR) {
      // ponytail: el set ya se guardó — logueamos pero no revertimos.
      // Si el PR falla, el set sigue siendo válido.
      console.error('[POST /api/sets] PR insert failed:', errorPR)
    }
  }

  return NextResponse.json<ApiResult<Set>>({ data: setInsertado }, { status: 201 })
}

// GET /api/sets?sesion_id=xxx
// Devuelve todos los sets de una sesión, ordenados por creado_en
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sesionId = searchParams.get('sesion_id')

  if (!sesionId) {
    return NextResponse.json<ApiResult<never>>(
      { error: 'sesion_id es requerido' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('sets')
    .select()
    .eq('sesion_id', sesionId)
    .order('creado_en', { ascending: true })

  if (error) {
    return NextResponse.json<ApiResult<never>>(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json<ApiResult<Set[]>>({ data })
}