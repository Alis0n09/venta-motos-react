// src/infrastructure/factories/vendedor.factory.ts
import { AxiosVendedorRepository } from '@/infrastructure/adapters/axios-vendedor.repository'
import { VendedorUseCase } from '@/application/use-cases/vendedor.use-case'

export const vendedorUseCase = new VendedorUseCase(new AxiosVendedorRepository())