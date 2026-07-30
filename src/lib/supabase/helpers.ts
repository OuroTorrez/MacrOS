// Convierte INTERVAL de Postgres a segundos para el cliente.
export function intervalToSeg(interval: string): number {
  const clean = interval.split('.')[0]
  const parts = clean.split(':').map(Number)
  if (parts.length === 3) {
    const [h, m, s] = parts
    return h * 3600 + m * 60 + s
  }
  return 0
}

// Convierte segundos al formato INTERVAL que entiende Postgres.
export function segToInterval(seg: number): string {
  const h = Math.floor(seg / 3600)
  const m = Math.floor((seg % 3600) / 60)
  const s = seg % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10)
}
