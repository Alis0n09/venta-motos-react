// src/domain/entities/compra.entity.ts

export interface Compra {
  id: number
  proveedor: number
  sucursal_destino: number
  /** La pone el backend al crear; no se envía. */
  fecha: string
  /** Decimal serializado como string por el backend. */
  total: string
}
