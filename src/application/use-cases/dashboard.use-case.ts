// src/application/use-cases/dashboard.use-case.ts

import type { DashboardRepository } from '@/domain/ports/dashboard.repository'

export class DashboardUseCase {
  private readonly repo: DashboardRepository

  constructor(repo: DashboardRepository) {
    this.repo = repo
  }

  getStats() {
    return this.repo.getStats()
  }
}