// src/domain/entities/financiamiento.entity.ts

export type EstadoFinanciamiento = 'activo' | 'pagado' | 'cancelado'

export interface Financiamiento {
  id: number
  venta: number
  cliente_nombre: string | null
  cliente_cedula: string | null
  moto_detalle: string[]
  monto_financiado: string
  tasa_interes: string
  plazo_meses: number
  fecha_inicio: string
  fecha_fin: string
  estado: EstadoFinanciamiento
  cuota_mensual: number | null
}