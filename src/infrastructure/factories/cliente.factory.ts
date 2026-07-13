// src/infrastructure/factories/cliente.factory.ts
import { AxiosClienteRepository } from '@/infrastructure/adapters/axios-cliente.repository'
import { ClienteUseCase } from '@/application/use-cases/cliente.use-case'

/**
 * Instancia única del repositorio de Cliente. El resto de la app importa
 * `clienteRepository` (acceso directo, usado por Mantenimiento/Direccion) o
 * `clienteUseCase` (capa de caso de uso, usada por Ventas) — ambos comparten
 * la misma instancia. Nunca se instancia AxiosClienteRepository directamente
 * fuera de este archivo.
 */
export const clienteRepository = new AxiosClienteRepository()
export const clienteUseCase = new ClienteUseCase(clienteRepository)
