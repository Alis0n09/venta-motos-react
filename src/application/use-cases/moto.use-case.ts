// src/application/use-cases/moto.use-case.ts

import type { MotoRepository, MotoFilters } from '@/domain/ports/moto.repository'

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

  create(formData: FormData) {
    return this.motoRepository.create(formData)
  }

  update(id: number, formData: FormData) {
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

  listarDisponibles() {
    return this.motoRepository.getAll({ page_size: 100, estado: 'disponible' })
      .then((res) => res.results)
  }

  listarTodas() {
    return this.motoRepository.getAll({ page_size: 200 })
      .then((res) => res.results)
  }
}