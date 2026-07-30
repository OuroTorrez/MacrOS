// =============================================================================
// GYM TRACKER — TIPOS TYPESCRIPT
// =============================================================================
// Convenciones:
//   • Todos los IDs son number (INT en Postgres)
//   • usuario_uuid es string (UUID) — solo para enlace con Supabase Auth
//   • Timestamps como string ISO 8601
//   • Fechas puras como string YYYY-MM-DD
//   • Pesos siempre en kg internamente — el frontend convierte al mostrar
//   • descanso_seg: número de segundos — el Route Handler convierte a/desde INTERVAL
// =============================================================================


// ─── Unidades ─────────────────────────────────────────────────────────────────
export type Unidad = 'kg' | 'lbs'


// ─── Grupos musculares ────────────────────────────────────────────────────────
export interface GrupoMuscular {
  grupo_muscular_id: number
  nombre:            string
  descripcion?:      string
}


// ─── Ejercicio ────────────────────────────────────────────────────────────────
export interface Ejercicio {
  ejercicio_id:      number
  grupo_muscular_id: number
  usuario_id?:       number       // null = catálogo de la app
  nombre:            string
  descripcion?:      string
  imagen_forma?:     string
  creado_en:         string
  actualizado_en?:   string
  eliminado_en?:     string       // soft delete
}


// ─── Split ────────────────────────────────────────────────────────────────────
export interface Split {
  split_id:       number
  usuario_id?:    number          // null = plantilla de la app
  nombre:         string
  descripcion?:   string
  notas?:         string
  creado_en:      string
  actualizado_en?: string
  eliminado_en?:  string
}


// ─── SplitEjercicio ───────────────────────────────────────────────────────────
// descanso_seg: el Route Handler convierte INTERVAL de Postgres → segundos
export interface SplitEjercicio {
  split_ejercicio_id: number
  split_id:           number
  ejercicio_id:       number
  orden:              number
  series_objetivo:    number
  reps_objetivo:      number
  descanso_seg:       number      // segundos — viene convertido desde INTERVAL
  notas?:             string
}


// ─── Usuario ──────────────────────────────────────────────────────────────────
export interface Usuario {
  usuario_uuid:     string        // UUID — enlace con Supabase Auth
  usuario_id:       number        // llave de negocio interna
  nombre:           string
  apellido_paterno: string
  apellido_materno?: string
  imagen_perfil?:   string
  racha_actual:     number
  racha_maxima:     number
}


// ─── Sesion ───────────────────────────────────────────────────────────────────
export interface Sesion {
  sesion_id:      number
  usuario_id:     number
  split_id?:      number          // null = entrenamiento libre
  iniciado_en:    string
  finalizado_en?: string
  duracion?:      string          // INTERVAL como string de Postgres — solo lectura
  notas?:         string
}


// ─── Serie ────────────────────────────────────────────────────────────────────
export interface Serie {
  serie_id:       number
  sesion_id:      number
  ejercicio_id:   number
  numero_serie:   number
  repeticiones:   number
  peso_kg:        number          // siempre en kg
  notas?:         string
  iniciado_en:    string
  finalizado_en?: string
}


// ─── PR ───────────────────────────────────────────────────────────────────────
// Tabla histórica — cada fila es un PR roto, no solo el vigente.
// Para PR actual: MAX(peso_kg) o fila más reciente por usuario/ejercicio.
export interface PR {
  pr_id:        number
  usuario_id:   number
  ejercicio_id: number
  serie_id:     number
  sesion_id:    number
  peso_kg:      number
  repeticiones: number
  fecha:        string            // DATE como YYYY-MM-DD
}


// =============================================================================
// DTOs — lo que el cliente envía al API
// =============================================================================
// Sin IDs generados por Postgres ni campos calculados

export type CrearUsuarioDTO = Pick<Usuario,
  'nombre' | 'apellido_paterno' | 'apellido_materno' | 'imagen_perfil'
>

export type CrearSplitDTO = Pick<Split,
  'nombre' | 'descripcion' | 'notas'
>

export type CrearSplitEjercicioDTO = Pick<SplitEjercicio,
  'split_id' | 'ejercicio_id' | 'orden' | 'series_objetivo' | 'reps_objetivo' | 'descanso_seg' | 'notas'
>

export type CrearEjercicioDTO = Pick<Ejercicio,
  'grupo_muscular_id' | 'nombre' | 'descripcion' | 'imagen_forma'
>

export type CrearSesionDTO = Pick<Sesion,
  'split_id' | 'notas'
>

export type CrearSerieDTO = Pick<Serie,
  'sesion_id' | 'ejercicio_id' | 'numero_serie' | 'repeticiones' | 'peso_kg' | 'notas'
>

export type FinalizarSesionDTO = {
  sesion_id:    number
  finalizado_en: string
  notas?:        string
}

export type ActualizarRachaDTO = {
  usuario_id:   number
  racha_actual: number
  racha_maxima: number
}


// =============================================================================
// Respuestas de API
// =============================================================================
export interface ApiResponse<T> { data: T;      error?: never }
export interface ApiError       { data?: never; error: string  }
export type ApiResult<T>        = ApiResponse<T> | ApiError
