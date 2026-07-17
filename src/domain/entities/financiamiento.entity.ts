// src/domain/entities/financiamiento.entity.ts

export type EstadoFinanciamiento = 'pendiente' | 'activo' | 'pagado' | 'cancelado'

export interface Financiamiento {
  id: number
  venta: number
  cliente_nombre: string | null
  cliente_cedula: string | null
  moto_detalle: string[]
  monto_financiado: string
  /** Nula mientras el financiamiento está 'pendiente': la fija el admin al aprobar. */
  tasa_interes: string | null
  plazo_meses: number
  fecha_inicio: string
  fecha_fin: string
  estado: EstadoFinanciamiento
  cuota_mensual: number | null
}