// src/domain/entities/cuota-pago.entity.ts

export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida'

export interface CuotaPago {
  id: number
  financiamiento: number
  numero_cuota: number
  fecha_vencimiento: string
  fecha_pago: string | null
  monto: string
  estado: EstadoCuota
}