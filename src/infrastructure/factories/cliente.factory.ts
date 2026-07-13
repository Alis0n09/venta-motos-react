// src/infrastructure/factories/cliente.factory.ts
import { AxiosClienteRepository } from '@/infrastructure/adapters/axios-cliente.repository'
import { ClienteUseCase } from '@/application/use-cases/cliente.use-case'

export const clienteUseCase = new ClienteUseCase(new AxiosClienteRepository())