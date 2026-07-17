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
  /** Financiamiento parcial opcional: si se envía, deben ir los 2 juntos.
   * La tasa de interés NO la elige el cliente — la fija el admin al aprobar. */
  monto_a_financiar?: number
  plazo_meses?: number
}