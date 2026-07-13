// src/domain/ports/detalle-compra.repository.ts

import type { DetalleCompra } from '../entities/detalle-compra.entity'

/** Datos para crear una línea de compra. */
export interface DetalleCompraInput {
  compra: number
  moto: number
  cantidad: number
  precio_costo: string
}

/**
 * Contrato de acceso a datos de DetalleCompra. No es un CrudRepository
 * genérico: las líneas de compra no tienen listado/paginación propios, solo
 * se consultan agrupadas por compra y se crean una por una al guardar una
 * compra nueva.
 */
export interface DetalleCompraRepository {
  listByCompra(compraId: number | string): Promise<DetalleCompra[]>
  create(dto: DetalleCompraInput): Promise<DetalleCompra>
}
