// src/domain/ports/marca.repository.ts

import type { Marca } from '../entities/marca.entity'
import type { CrearMarcaDto, ActualizarMarcaDto } from '@/application/dtos/marca.dto'

export interface MarcaRepository {
  listar(): Promise<Marca[]>
  crear(dto: CrearMarcaDto): Promise<Marca>
  actualizar(id: number, dto: ActualizarMarcaDto): Promise<Marca>
  eliminar(id: number): Promise<void>
}