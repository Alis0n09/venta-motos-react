// src/application/use-cases/marca.use-case.ts

import type { MarcaRepository } from '@/domain/ports/marca.repository'
import type { Marca } from '@/domain/entities/marca.entity'
import type { CrearMarcaDto, ActualizarMarcaDto } from '../dtos/marca.dto'

export class MarcaUseCase {
  private readonly repo: MarcaRepository

  constructor(repo: MarcaRepository) {
    this.repo = repo
  }

  listar(): Promise<Marca[]> {
    return this.repo.listar()
  }

  crear(dto: CrearMarcaDto): Promise<Marca> {
    return this.repo.crear(dto)
  }

  actualizar(id: number, dto: ActualizarMarcaDto): Promise<Marca> {
    return this.repo.actualizar(id, dto)
  }

  eliminar(id: number): Promise<void> {
    return this.repo.eliminar(id)
  }
}