// src/domain/entities/marca.entity.ts

export interface Marca {
  id: number
  nombre: string
  pais_origen: string | null
  activa: boolean
}