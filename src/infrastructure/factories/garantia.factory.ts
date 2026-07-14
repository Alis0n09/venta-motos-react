import { AxiosGarantiaRepository } from '@/infrastructure/adapters/axios-garantia.repository'
import { GarantiaUseCase } from '@/application/use-cases/garantia.use-case'

export const garantiaUseCase = new GarantiaUseCase(new AxiosGarantiaRepository())