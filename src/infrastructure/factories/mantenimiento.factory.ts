// src/infrastructure/factories/mantenimiento.factory.ts
import { AxiosMantenimientoRepository } from '@/infrastructure/adapters/axios-mantenimiento.repository'

/**
 * Instancia única del repositorio de Mantenimiento. El resto de la app
 * importa `mantenimientoRepository` y nunca instancia
 * AxiosMantenimientoRepository directamente.
 */
export const mantenimientoRepository = new AxiosMantenimientoRepository()
