// src/infrastructure/factories/moto.factory.ts
import { AxiosMotoRepository } from '@/infrastructure/adapters/axios-moto.repository'
import { MotoUseCase } from '@/application/use-cases/moto.use-case'

/**
 * Instancia única del repositorio de Moto. El resto de la app importa
 * `motoRepository` (acceso directo, usado por Inventario/Compras/
 * Mantenimiento) o `motoUseCase` (capa de caso de uso, usada por
 * Ventas/Catálogo) — ambos comparten la misma instancia. Nunca se instancia
 * AxiosMotoRepository directamente fuera de este archivo.
 */
export const motoRepository = new AxiosMotoRepository()
export const motoUseCase = new MotoUseCase(motoRepository)
