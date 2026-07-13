// src/domain/ports/categoria.repository.ts

import type { Categoria } from '../entities/categoria.entity'
import type { CrearCategoriaDto, ActualizarCategoriaDto } from '@/application/dtos/categoria.dto'

export interface CategoriaRepository {
  listar(): Promise<Categoria[]>
  crear(dto: CrearCategoriaDto): Promise<Categoria>
  actualizar(id: number, dto: ActualizarCategoriaDto): Promise<Categoria>
  eliminar(id: number): Promise<void>
}