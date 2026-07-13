// src/application/dtos/categoria.dto.ts

export interface CrearCategoriaDto {
  nombre: string
  descripcion: string | null
}

export type ActualizarCategoriaDto = Partial<CrearCategoriaDto>