// src/infrastructure/factories/direccion.factory.ts
import { AxiosDireccionRepository } from '@/infrastructure/adapters/axios-direccion.repository'

/**
 * Instancia única del repositorio de Direccion. El resto de la app importa
 * `direccionRepository` y nunca instancia AxiosDireccionRepository
 * directamente.
 */
export const direccionRepository = new AxiosDireccionRepository()
