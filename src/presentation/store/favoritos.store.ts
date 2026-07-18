// src/presentation/store/favoritos.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FavoritoItem } from '@/domain/entities/favorito-item.entity'
import type { Moto } from '@/domain/entities/moto.entity'

interface FavoritosState {
  items: FavoritoItem[]
}

interface FavoritosActions {
  /** Agrega o quita del corazón según el estado actual. Devuelve el nuevo estado (true = quedó guardada). */
  toggleFavorito(moto: Moto): boolean
  esFavorito(motoId: number): boolean
  quitarFavorito(motoId: number): void
  vaciar(): void
}

export const useFavoritosStore = create<FavoritosState & FavoritosActions>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorito(moto) {
        const items = get().items
        const yaExiste = items.some((i) => i.motoId === moto.id)

        if (yaExiste) {
          set({ items: items.filter((i) => i.motoId !== moto.id) })
          return false
        }

        const nuevoItem: FavoritoItem = {
          motoId: moto.id,
          modelo: moto.modelo,
          marcaNombre: moto.marca_nombre,
          precio: Number(moto.precio),
          imagenUrl: moto.imagen,
          estado: moto.estado,
          stock: moto.stock,
        }
        set({ items: [...items, nuevoItem] })
        return true
      },

      esFavorito(motoId) {
        return get().items.some((i) => i.motoId === motoId)
      },

      quitarFavorito(motoId) {
        set({ items: get().items.filter((i) => i.motoId !== motoId) })
      },

      vaciar() {
        set({ items: [] })
      },
    }),
    { name: 'victal_favoritos' },
  ),
)

export const selectFavoritosCount = (state: FavoritosState) => state.items.length