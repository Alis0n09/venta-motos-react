// src/domain/entities/direccion.entity.ts

export interface Direccion {
  id: number
  cliente: number
  calle: string
  ciudad: string
  provincia: string
  principal: boolean
}
