import type { HistorialPrecioRepository, HistorialPrecioFilters } from '@/domain/ports/historial-precio.repository'

export class HistorialPrecioUseCase {
  private readonly repo: HistorialPrecioRepository

  constructor(repo: HistorialPrecioRepository) {
    this.repo = repo
  }

  getAll(filters: HistorialPrecioFilters) {
    return this.repo.getAll(filters)
  }

  getStats() {
    return this.repo.getStats()
  }
}