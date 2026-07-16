// src/domain/entities/resena.entity.ts

export interface Resena {
  id: number
  moto: number
  moto_nombre: string
  cliente: number
  cliente_nombre: string
  rating: number
  comentario: string
  fecha: string
}