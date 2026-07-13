// src/infrastructure/factories/moto.factory.ts

import { AxiosMotoRepository } from '@/infrastructure/adapters/axios-moto.repository'
import { MotoUseCase } from '@/application/use-cases/moto.use-case'

export const motoUseCase = new MotoUseCase(new AxiosMotoRepository())