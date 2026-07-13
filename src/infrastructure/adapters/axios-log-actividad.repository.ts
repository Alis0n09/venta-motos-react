// src/infrastructure/adapters/axios-log-actividad.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { LogActividadRepository, LogActividadListParams } from '@/domain/ports/log-actividad.repository'
import type { PaginatedResult } from '@/domain/ports/crud.repository'
import type { LogActividad } from '@/domain/entities/log-actividad.entity'

export class AxiosLogActividadRepository implements LogActividadRepository {
  async list(params: LogActividadListParams): Promise<PaginatedResult<LogActividad>> {
    try {
      const { data } = await apiClient.get<PaginatedResult<LogActividad>>('/logs-actividad/', {
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          entidad: params.entidad,
          accion: params.accion,
          fecha_desde: params.fechaDesde,
          fecha_hasta: params.fechaHasta,
          ordering: '-fecha',
        },
      })
      return data
    } catch (err) {
      throw parseApiError(err)
    }
  }
}
