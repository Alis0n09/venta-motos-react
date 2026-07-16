// src/application/dtos/notificacion.dto.ts

import type { TipoNotificacion } from '@/domain/entities/notificacion.entity'

export interface CrearNotificacionDto {
  tipo: TipoNotificacion
  mensaje: string
}