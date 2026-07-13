// src/application/use-cases/moto.use-case.ts

import type { MotoRepository, MotoFilters } from '@/domain/ports/moto.repository'
import type { CreateMotoDto, UpdateMotoDto } from '../dtos/moto.dto'

export class MotoUseCase {
  private readonly motoRepository: MotoRepository

  constructor(motoRepository: MotoRepository) {
    this.motoRepository = motoRepository
  }

  getAll(filters: MotoFilters) {
    return this.motoRepository.getAll(filters)
  }

  getById(id: number) {
    return this.motoRepository.getById(id)
  }

  create(dto: CreateMotoDto) {
    const formData = new FormData()
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    return this.motoRepository.create(formData)
  }

  update(id: number, dto: UpdateMotoDto) {
    const formData = new FormData()
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })
    return this.motoRepository.update(id, formData)
  }

  delete(id: number) {
    return this.motoRepository.delete(id)
  }

  getMarcas() {
    return this.motoRepository.getMarcas()
  }

  getCategorias() {
    return this.motoRepository.getCategorias()
  }
}