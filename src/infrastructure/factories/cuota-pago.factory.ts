// src/infrastructure/factories/cuota-pago.factory.ts
import { AxiosCuotaPagoRepository } from '@/infrastructure/adapters/axios-cuota-pago.repository'
import { CuotaPagoUseCase } from '@/application/use-cases/cuota-pago.use-case'

export const cuotaPagoUseCase = new CuotaPagoUseCase(new AxiosCuotaPagoRepository())