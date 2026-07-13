// src/application/dtos/moto.dto.ts

export interface CreateMotoDto {
  marca: number
  categoria?: number | null
  modelo: string
  anio: number
  color: string
  precio: number
  estado?: 'disponible' | 'vendida' | 'reservada'
  cilindraje: number
  imagen_url?: string | null
}

export interface UpdateMotoDto extends Partial<CreateMotoDto> {}

export interface MotoFiltersDto {
  search?: string
  marca?: string
  categoria?: string
  estado?: string
  precio_min?: number
  precio_max?: number
  ordering?: string
  page?: number
  page_size?: number
}