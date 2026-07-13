// src/domain/entities/carrito-item.entity.ts

export interface CarritoItem {
  motoId: number
  modelo: string
  marcaNombre: string
  precio: number
  imagenUrl: string | null
  stockDisponible: number
  cantidad: number
}