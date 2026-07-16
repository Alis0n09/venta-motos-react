// src/domain/entities/mantenimiento.entity.ts

export interface Mantenimiento {
  id: number
  moto: number
  /** Calculado por el backend, p. ej. "Yamaha MT-03 (2024)". */
  moto_detalle: string | null
  cliente: number | null
  /** Calculado por el backend. */
  cliente_nombre: string | null
  cliente_cedula: string | null
  fecha: string
  tipo: string
  /** Decimal serializado como string por el backend. */
  costo: string
}
