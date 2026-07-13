// src/domain/entities/venta.entity.ts

export interface DetalleVenta {
  id: number
  venta: number
  moto: number
  moto_nombre: string | null
  cantidad: number
  precio_unitario: string
  subtotal: string
}

export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito'

export interface Venta {
  id: number
  cliente: number | null
  vendedor: number | null
  fecha_venta: string
  metodo_pago: MetodoPago
  total: string
  cliente_nombre: string | null
  vendedor_nombre: string | null
  detalles: DetalleVenta[]
}