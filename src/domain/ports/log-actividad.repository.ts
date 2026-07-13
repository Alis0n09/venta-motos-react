// src/domain/ports/log-actividad.repository.ts

import type { LogActividad } from '../entities/log-actividad.entity'
import type { ListParams, PaginatedResult } from './crud.repository'

/**
 * Filtros adicionales soportados por LogsActividadFilter en el backend
 * (moto/filters.py), más allá de la paginación y el buscador de texto libre.
 */
export interface LogActividadListParams extends ListParams {
  entidad?: string
  accion?: string
  fechaDesde?: string
  fechaHasta?: string
}

/**
 * Contrato de acceso a datos de LogActividad. Solo lectura: los logs los
 * genera el sistema automáticamente (LogActividadMixin), esta parte del
 * sistema únicamente los consulta para auditoría.
 * Implementado por infrastructure/adapters/axios-log-actividad.repository.ts
 */
export interface LogActividadRepository {
  list(params: LogActividadListParams): Promise<PaginatedResult<LogActividad>>
}
