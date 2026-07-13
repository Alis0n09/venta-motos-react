// src/infrastructure/factories/inventario.factory.ts
import { AxiosInventarioRepository } from '@/infrastructure/adapters/axios-inventario.repository'

/**
 * Instancia única del repositorio de Inventario. El resto de la app importa
 * `inventarioRepository` y nunca instancia AxiosInventarioRepository directamente.
 */
export const inventarioRepository = new AxiosInventarioRepository()
