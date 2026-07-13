// src/infrastructure/factories/moto.factory.ts
import { AxiosMotoRepository } from '@/infrastructure/adapters/axios-moto.repository'

/**
 * Instancia única del repositorio de Moto (solo lectura). El resto de la
 * app importa `motoRepository` y nunca instancia AxiosMotoRepository
 * directamente.
 */
export const motoRepository = new AxiosMotoRepository()
