// src/domain/ports/notificacion.repository.ts

import type { Notificacion } from '../entities/notificacion.entity'

export interface NotificacionRepository {
  misNotificaciones(): Promise<Notificacion[]>
  marcarLeida(id: number): Promise<void>
}