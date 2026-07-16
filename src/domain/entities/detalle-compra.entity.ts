// src/domain/entities/detalle-compra.entity.ts

export interface DetalleCompra {
  id: number
  compra: number
  moto: number
  cantidad: number
  /** Decimal serializado como string por el backend. */
  precio_costo: string
}
