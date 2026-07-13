// src/infrastructure/factories/cliente.factory.ts
import { AxiosClienteRepository } from '@/infrastructure/adapters/axios-cliente.repository'

/**
 * Instancia única del repositorio de Cliente (solo lectura). El resto de la
 * app importa `clienteRepository` y nunca instancia AxiosClienteRepository
 * directamente.
 */
export const clienteRepository = new AxiosClienteRepository()
