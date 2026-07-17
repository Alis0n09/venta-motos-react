// src/presentation/store/carrito.store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CarritoItem } from '@/domain/entities/carrito-item.entity'
import type { Moto } from '@/domain/entities/moto.entity'

interface CarritoState {
  items: CarritoItem[]
}

interface CarritoActions {
  agregarItem(moto: Moto, cantidad?: number): void
  quitarItem(motoId: number): void
  actualizarCantidad(motoId: number, cantidad: number): void
  vaciar(): void
}

export const useCarritoStore = create<CarritoState & CarritoActions>()(
  persist(
    (set, get) => ({
      items: [],

      agregarItem(moto, cantidad = 1) {
        const items = get().items
        const existente = items.find((i) => i.motoId === moto.id)

        if (existente) {
          const nuevaCantidad = Math.min(
            existente.cantidad + cantidad,
            moto.stock || existente.stockDisponible,
          )
          set({
            items: items.map((i) =>
              i.motoId === moto.id ? { ...i, cantidad: nuevaCantidad } : i,
            ),
          })
          return
        }

        const nuevoItem: CarritoItem = {
          motoId: moto.id,
          modelo: moto.modelo,
          marcaNombre: moto.marca_nombre,
          precio: Number(moto.precio),
          imagenUrl: moto.imagen,
          stockDisponible: moto.stock,
          cantidad: Math.max(1, Math.min(cantidad, moto.stock || 1)),
        }
        set({ items: [...items, nuevoItem] })
      },

      quitarItem(motoId) {
        set({ items: get().items.filter((i) => i.motoId !== motoId) })
      },

      actualizarCantidad(motoId, cantidad) {
        if (cantidad <= 0) {
          get().quitarItem(motoId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.motoId === motoId
              ? { ...i, cantidad: Math.min(cantidad, i.stockDisponible || cantidad) }
              : i,
          ),
        })
      },

      vaciar() {
        set({ items: [] })
      },
    }),
    { name: 'victal_carrito' },
  ),
)

// ─── Selectores ───────────────────────────────────────────────────────────────

export const selectCarritoCount = (state: CarritoState) =>
  state.items.reduce((acc, i) => acc + i.cantidad, 0)

export const selectCarritoTotal = (state: CarritoState) =>
  state.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)