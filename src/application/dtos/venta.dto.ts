// src/application/dtos/venta.dto.ts

import type { MetodoPago } from '@/domain/entities/venta.entity'

/** Payload para que admin/vendedor cree una venta manualmente (POST /ventas/). */
export interface CrearVentaDto {
  cliente: number
  vendedor: number | null
  metodo_pago: MetodoPago
}

export interface ActualizarVentaDto {
  metodo_pago?: MetodoPago
  vendedor?: number | null
}

/** Payload para agregar un ítem a una venta ya creada (POST /detalle-ventas/). */
export interface CrearDetalleVentaDto {
  venta: number
  moto: number
  cantidad: number
  precio_unitario: string
}