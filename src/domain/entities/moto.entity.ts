// src/domain/entities/moto.entity.ts

export interface Moto {
  id: number
  marca: number
  marca_nombre: string
  categoria: number | null
  categoria_nombre: string | null
  modelo: string
  anio: number
  color: string
  precio: string
  stock: number
  cilindraje: number
  estado: 'disponible' | 'vendida' | 'reservada'
  imagen_url: string | null
}

export interface Marca {
  id: number
  nombre: string
  pais_origen?: string
  activa?: boolean
}

export interface Categoria {
  id: number
  nombre: string
  descripcion?: string
}