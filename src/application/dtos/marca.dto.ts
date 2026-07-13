// src/application/dtos/marca.dto.ts

export interface CrearMarcaDto {
  nombre: string
  pais_origen: string | null
  activa: boolean
}

export type ActualizarMarcaDto = Partial<CrearMarcaDto>