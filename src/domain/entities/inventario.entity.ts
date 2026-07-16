// src/domain/entities/inventario.entity.ts

export interface Inventario {
  id: number
  moto: number
  /** Nombre calculado por el backend, p. ej. "Yamaha MT-03 (2024)". */
  moto_nombre: string
  sucursal: number
  /** Nombre calculado por el backend. */
  sucursal_nombre: string
  cantidad: number
  ubicacion_bodega: string
}
