// src/infrastructure/adapters/axios-notificacion.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { NotificacionRepository } from '@/domain/ports/notificacion.repository'
import type { Notificacion } from '@/domain/entities/notificacion.entity'

export class AxiosNotificacionRepository implements NotificacionRepository {

  async misNotificaciones(): Promise<Notificacion[]> {
    try {
      const { data } = await apiClient.get('/notificaciones-cliente/mis-notificaciones/?page_size=100')
      return Array.isArray(data) ? data : data.results ?? []
    } catch (err) {
      throw parseApiError(err)
    }
  }

  async marcarLeida(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notificaciones-cliente/${id}/marcar-leida/`)
    } catch (err) {
      throw parseApiError(err)
    }
  }
}