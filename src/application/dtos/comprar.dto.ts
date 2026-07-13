// src/application/dtos/comprar.dto.ts

import type { MetodoPago } from '@/domain/entities/venta.entity'

export interface ComprarItemDto {
  moto_id: number
  cantidad: number
}

/** Payload enviado a POST /ventas/comprar/ (autocompra del cliente). */
export interface ComprarDto {
  metodo_pago: MetodoPago
  items: ComprarItemDto[]
  /** Financiamiento parcial opcional: si se envía, deben ir los 3 juntos. */
  monto_a_financiar?: number
  tasa_interes?: number
  plazo_meses?: number
}