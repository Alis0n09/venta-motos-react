// src/domain/ports/dashboard.repository.ts

import type { DashboardStats } from '../entities/dashboard.entity'

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>
}