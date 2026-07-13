// src/infrastructure/factories/log-actividad.factory.ts
import { AxiosLogActividadRepository } from '@/infrastructure/adapters/axios-log-actividad.repository'

/**
 * Instancia única del repositorio de LogActividad (solo lectura). El resto
 * de la app importa `logActividadRepository` y nunca instancia
 * AxiosLogActividadRepository directamente.
 */
export const logActividadRepository = new AxiosLogActividadRepository()
