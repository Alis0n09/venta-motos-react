// src/infrastructure/factories/historial-cliente.factory.ts
import { AxiosHistorialClienteRepository } from '@/infrastructure/adapters/axios-historial-cliente.repository'
import { HistorialClienteUseCase } from '@/application/use-cases/historial-cliente.use-case'

export const historialClienteUseCase = new HistorialClienteUseCase(new AxiosHistorialClienteRepository())