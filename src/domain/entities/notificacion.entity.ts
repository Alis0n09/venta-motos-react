// src/domain/entities/notificacion.entity.ts

export type TipoNotificacion = 'compra' | 'mantenimiento' | 'garantia' | 'financiamiento' | 'pago' | string

export interface Notificacion {
  id: number
  cliente: number
  tipo: TipoNotificacion
  mensaje: string
  leido: boolean
  fecha: string
}