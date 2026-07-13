// src/infrastructure/factories/compra.factory.ts
import { AxiosCompraRepository } from '@/infrastructure/adapters/axios-compra.repository'
import { AxiosDetalleCompraRepository } from '@/infrastructure/adapters/axios-detalle-compra.repository'

/**
 * Instancias únicas de los repositorios de Compra y DetalleCompra. El resto
 * de la app importa `compraRepository` / `detalleCompraRepository` y nunca
 * instancia los Axios*Repository directamente.
 */
export const compraRepository = new AxiosCompraRepository()
export const detalleCompraRepository = new AxiosDetalleCompraRepository()
