// src/infrastructure/factories/marca.factory.ts
import { AxiosMarcaRepository } from '@/infrastructure/adapters/axios-marca.repository'
import { MarcaUseCase } from '@/application/use-cases/marca.use-case'

export const marcaUseCase = new MarcaUseCase(new AxiosMarcaRepository())