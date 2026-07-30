import type {
  ApiResult,
  CrearSerieDTO,
  CrearSesionDTO,
  CrearUsuarioDTO,
  Ejercicio,
  FinalizarSesionDTO,
  Serie,
  Sesion,
  Usuario,
} from '@/types'

// ─── Helper genérico ──────────────────────────────────────────────────────────
async function post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

async function patch<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  return res.json()
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────
export const crearUsuario = (dto: CrearUsuarioDTO) =>
  post<Usuario>('/api/usuarios', dto)

export const getUsuario = async (): Promise<ApiResult<Usuario>> => {
  const res = await fetch('/api/usuarios')
  return res.json()
}

// ─── Sesiones ─────────────────────────────────────────────────────────────────
export const crearSesion = (dto: CrearSesionDTO) =>
  post<Sesion>('/api/sesiones', dto)

export const getSesiones = async (limit = 30): Promise<ApiResult<Sesion[]>> => {
  const res = await fetch(`/api/sesiones?limit=${limit}`)
  return res.json()
}

export const finalizarSesion = (dto: FinalizarSesionDTO) =>
  patch<Sesion>('/api/sesiones', dto)

export const getEjercicios = async (): Promise<ApiResult<Ejercicio[]>> => {
  const res = await fetch('/api/ejercicios')
  return res.json()
}

// ─── Series ───────────────────────────────────────────────────────────────────
export const crearSerie = (dto: CrearSerieDTO) =>
  post<Serie & { es_pr: boolean }>('/api/series', dto)

export const finalizarSerie = (serieId: number, finalizadoEn: string, notas?: string) =>
  patch<Serie>('/api/series', { serie_id: serieId, finalizado_en: finalizadoEn, notas })

export const getSeries = async (sesionId: number): Promise<ApiResult<Serie[]>> => {
  const res = await fetch(`/api/series?sesion_id=${sesionId}`)
  return res.json()
}
