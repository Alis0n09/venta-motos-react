// src/infrastructure/factories/resena.factory.ts

import { AxiosResenaRepository } from '@/infrastructure/adapters/axios-resena.repository'
import { ResenaUseCase } from '@/application/use-cases/resena.use-case'

export const resenaUseCase = new ResenaUseCase(new AxiosResenaRepository())