import { AxiosHistorialPrecioRepository } from '@/infrastructure/adapters/axios-historial-precio.repository'
import { HistorialPrecioUseCase } from '@/application/use-cases/historial-precio.use-case'

export const historialPrecioUseCase = new HistorialPrecioUseCase(new AxiosHistorialPrecioRepository())