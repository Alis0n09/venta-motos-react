// src/infrastructure/factories/notificacion.factory.ts

import { AxiosNotificacionRepository } from '@/infrastructure/adapters/axios-notificacion.repository'
import { NotificacionUseCase } from '@/application/use-cases/notificacion.use-case'

export const notificacionUseCase = new NotificacionUseCase(new AxiosNotificacionRepository())