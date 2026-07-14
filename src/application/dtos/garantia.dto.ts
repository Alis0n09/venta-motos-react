// src/application/dtos/garantia.dto.ts

export interface CreateGarantiaDto {
  fecha_inicio: string
  fecha_fin: string
  tipo: string
  venta: number
}

export interface UpdateGarantiaDto extends Partial<CreateGarantiaDto> {}