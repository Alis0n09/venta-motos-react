// src/domain/entities/favorito-item.entity.ts

/**
 * Moto marcada como favorita por el cliente. Vive solo en el navegador
 * (Zustand + localStorage) — no hay modelo de Favorito en el backend.
 */
export interface FavoritoItem {
  motoId: number
  modelo: string
  marcaNombre: string
  precio: number
  imagenUrl: string | null
  estado: string
  stock: number
}