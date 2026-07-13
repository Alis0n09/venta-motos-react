// src/domain/entities/moto.entity.ts

export interface Moto {
  id: number
  modelo: string
  precio: string
  estado: string
  imagen_url: string | null
  cilindraje: string
  marca_nombre: string
  categoria_nombre: string | null
  stock: number
  anio?: number
}