// src/domain/ports/compra.repository.ts

import type { Compra } from '../entities/compra.entity'
import type { CrudRepository } from './crud.repository'

/** Datos para crear una compra (cabecera). El backend calcula `fecha`. */
export interface CompraInput {
  proveedor: number
  sucursal_destino: number
  total: string
}

/**
 * Contrato de acceso a datos de Compra. No incluye `update`: una compra ya
 * creada solo se puede eliminar completa, no editar parcialmente sus líneas
 * (ver NuevaCompraPage / ComprasPage).
 */
export type CompraRepository = Omit<CrudRepository<Compra, CompraInput, never>, 'update'>
