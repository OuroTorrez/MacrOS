'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Unidad } from '@/types'

// La conversión vive aquí — cualquier componente la importa sin repetir la fórmula.
const KG_A_LBS = 2.20462
const LBS_A_KG = 1 / KG_A_LBS

interface PreferenciasState {
  unidad: Unidad

  // Acciones
  toggleUnidad: () => void
  setUnidad:    (u: Unidad) => void

  // Utilidades — convierten desde kg (el valor canónico interno)
  // hacia la unidad activa del usuario. Úsalas en cualquier componente.
  mostrarPeso:  (kg: number) => number        // devuelve el número convertido
  formatPeso:   (kg: number) => string        // devuelve "80 kg" o "176.4 lbs"
  aKg:          (valor: number) => number     // convierte desde la unidad activa → kg
}

export const usePreferenciasStore = create<PreferenciasState>()(
  // persist guarda el estado en localStorage automáticamente.
  // La próxima vez que el usuario abra la app, recuerda su preferencia.
  persist(
    (set, get) => ({
      unidad: 'kg',

      toggleUnidad: () =>
        set(s => ({ unidad: s.unidad === 'kg' ? 'lbs' : 'kg' })),

      setUnidad: (u) => set({ unidad: u }),

      mostrarPeso: (kg) => {
        const { unidad } = get()
        const valor = unidad === 'lbs' ? kg * KG_A_LBS : kg
        // Redondeamos a 1 decimal para evitar "176.3700048..."
        return Math.round(valor * 10) / 10
      },

      formatPeso: (kg) => {
        const { unidad, mostrarPeso } = get()
        return `${mostrarPeso(kg)} ${unidad}`
      },

      aKg: (valor) => {
        const { unidad } = get()
        return unidad === 'lbs' ? valor * LBS_A_KG : valor
      },
    }),
    {
      name: 'gym-preferencias', // clave en localStorage
    }
  )
)