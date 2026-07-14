// src/application/use-cases/categoria.use-case.ts

import type { CategoriaRepository } from '@/domain/ports/categoria.repository'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { CrearCategoriaDto, ActualizarCategoriaDto } from '../dtos/categoria.dto'

export class CategoriaUseCase {
  private readonly repo: CategoriaRepository

  constructor(repo: CategoriaRepository) {
    this.repo = repo
  }

  listar(): Promise<Categoria[]> {
    return this.repo.listar()
  }

  crear(dto: CrearCategoriaDto): Promise<Categoria> {
    return this.repo.crear(dto)
  }

  actualizar(id: number, dto: ActualizarCategoriaDto): Promise<Categoria> {
    return this.repo.actualizar(id, dto)
  }

  eliminar(id: number): Promise<void> {
    return this.repo.eliminar(id)
  }
}