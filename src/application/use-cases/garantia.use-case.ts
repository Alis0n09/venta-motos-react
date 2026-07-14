import type { GarantiaRepository } from '@/domain/ports/garantia.repository'
import type { CreateGarantiaDto, UpdateGarantiaDto } from '../dtos/garantia.dto'

export class GarantiaUseCase {
  private readonly repo: GarantiaRepository

  constructor(repo: GarantiaRepository) {
    this.repo = repo
  }

  getAll() {
    return this.repo.getAll()
  }

  getByVenta(ventaId: number) {
    return this.repo.getByVenta(ventaId)
  }

  create(dto: CreateGarantiaDto) {
    return this.repo.create(dto)
  }

  update(id: number, dto: UpdateGarantiaDto) {
    return this.repo.update(id, dto)
  }

  delete(id: number) {
    return this.repo.delete(id)
  }
}