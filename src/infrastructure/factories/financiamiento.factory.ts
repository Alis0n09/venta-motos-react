// src/infrastructure/factories/financiamiento.factory.ts
import { AxiosFinanciamientoRepository } from '@/infrastructure/adapters/axios-financiamiento.repository'
import { FinanciamientoUseCase } from '@/application/use-cases/financiamiento.use-case'

export const financiamientoUseCase = new FinanciamientoUseCase(new AxiosFinanciamientoRepository())