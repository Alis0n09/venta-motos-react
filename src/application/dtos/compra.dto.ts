// src/application/dtos/compra.dto.ts

import { z } from 'zod'

/**
 * Valida una línea de compra: mismas reglas que el backend en
 * /api/detalle-compras/ (cantidad entero > 0, precio_costo decimal > 0).
 */
export const compraLineSchema = z.object({
  moto: z.number({ message: 'Selecciona una moto' }).int().positive('Selecciona una moto'),
  cantidad: z.coerce
    .number({ message: 'La cantidad es obligatoria' })
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),
  precio_costo: z.coerce
    .number({ message: 'El precio costo es obligatorio' })
    .positive('El precio costo debe ser mayor a 0'),
})

/**
 * Valida la compra completa antes de enviarla: cabecera (proveedor,
 * sucursal destino) + al menos una línea válida.
 */
export const compraFormSchema = z.object({
  proveedor: z.number({ message: 'Selecciona un proveedor' }).int().positive('Selecciona un proveedor'),
  sucursal_destino: z.number({ message: 'Selecciona una sucursal' }).int().positive('Selecciona una sucursal'),
  lineas: z.array(compraLineSchema).min(1, 'Agrega al menos una línea de compra'),
})

export type CompraLineValues = z.infer<typeof compraLineSchema>
export type CompraFormValues = z.infer<typeof compraFormSchema>
