// src/presentation/store/notificaciones.store.ts

import { create } from 'zustand'
import { notificacionUseCase } from '@/infrastructure/factories/notificacion.factory'
import type { Notificacion, TipoNotificacion } from '@/domain/entities/notificacion.entity'

export type { Notificacion, TipoNotificacion }

interface NotificacionesState {
  items: Notificacion[]
  loading: boolean
}

interface NotificacionesActions {
  /** Trae las notificaciones del cliente autenticado desde el backend. */
  cargar(): Promise<void>
  marcarLeida(id: number): Promise<void>
  marcarTodasLeidas(): Promise<void>
}

export const useNotificacionesStore = create<NotificacionesState & NotificacionesActions>()((set, get) => ({
  items: [],
  loading: false,

  async cargar() {
    set({ loading: true })
    try {
      const items = await notificacionUseCase.listar()
      set({ items, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  async marcarLeida(id) {
    const anterior = get().items
    // Actualización optimista: se ve al instante en la campanita.
    set({ items: anterior.map((n) => (n.id === id ? { ...n, leido: true } : n)) })
    try {
      await notificacionUseCase.marcarLeida(id)
    } catch {
      set({ items: anterior }) // revertir si falla la petición
    }
  },

  async marcarTodasLeidas() {
    const anterior = get().items
    set({ items: anterior.map((n) => ({ ...n, leido: true })) })
    try {
      await notificacionUseCase.marcarTodasLeidas(anterior)
    } catch {
      set({ items: anterior })
    }
  },
}))

// ─── Selectores ───────────────────────────────────────────────────────────────

export const selectNoLeidas = (state: NotificacionesState) =>
  state.items.filter((n) => !n.leido).length