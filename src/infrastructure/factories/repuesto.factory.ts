// src/infrastructure/factories/repuesto.factory.ts
import { AxiosRepuestoRepository } from '@/infrastructure/adapters/axios-repuesto.repository'

/**
 * Instancia única del repositorio de Repuesto. El resto de la app importa
 * `repuestoRepository` y nunca instancia AxiosRepuestoRepository directamente.
 */
export const repuestoRepository = new AxiosRepuestoRepository()
