// src/infrastructure/factories/proveedor.factory.ts
import { AxiosProveedorRepository } from '@/infrastructure/adapters/axios-proveedor.repository'

/**
 * Instancia única del repositorio de Proveedor. El resto de la app importa
 * `proveedorRepository` y nunca instancia AxiosProveedorRepository directamente.
 */
export const proveedorRepository = new AxiosProveedorRepository()
