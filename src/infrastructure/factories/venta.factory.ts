// src/infrastructure/factories/venta.factory.ts
import { AxiosVentaRepository } from '@/infrastructure/adapters/axios-venta.repository'
import { VentaUseCase } from '@/application/use-cases/venta.use-case'

export const ventaUseCase = new VentaUseCase(new AxiosVentaRepository())