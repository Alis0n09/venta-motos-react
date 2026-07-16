// src/application/use-cases/notificacion.use-case.ts

import type { NotificacionRepository } from '@/domain/ports/notificacion.repository'
import type { Notificacion } from '@/domain/entities/notificacion.entity'

export class NotificacionUseCase {
  private readonly repo: NotificacionRepository

  constructor(repo: NotificacionRepository) {
    this.repo = repo
  }

  listar(): Promise<Notificacion[]> {
    return this.repo.misNotificaciones()
  }

  marcarLeida(id: number): Promise<void> {
    return this.repo.marcarLeida(id)
  }

  async marcarTodasLeidas(items: Notificacion[]): Promise<void> {
    const pendientes = items.filter((n) => !n.leido)
    await Promise.all(pendientes.map((n) => this.repo.marcarLeida(n.id)))
  }
}