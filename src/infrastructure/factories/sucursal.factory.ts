// src/infrastructure/factories/sucursal.factory.ts
import { AxiosSucursalRepository } from '@/infrastructure/adapters/axios-sucursal.repository'

/**
 * Instancia única del repositorio de Sucursal. El resto de la app importa
 * `sucursalRepository` y nunca instancia AxiosSucursalRepository directamente.
 */
export const sucursalRepository = new AxiosSucursalRepository()
