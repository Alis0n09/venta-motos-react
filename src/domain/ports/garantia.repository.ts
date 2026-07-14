import type { Garantia } from '../entities/garantia.entity'
import type { CreateGarantiaDto, UpdateGarantiaDto } from '@/application/dtos/garantia.dto'
import type { PaginatedResponse } from '../entities/pagination.entity'

export interface GarantiaRepository {
  getAll(): Promise<PaginatedResponse<Garantia>>
  getByVenta(ventaId: number): Promise<Garantia[]>
  create(dto: CreateGarantiaDto): Promise<Garantia>
  update(id: number, dto: UpdateGarantiaDto): Promise<Garantia>
  delete(id: number): Promise<void>
}