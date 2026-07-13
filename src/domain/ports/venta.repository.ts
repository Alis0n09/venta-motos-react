// src/domain/ports/venta.repository.ts

import type { Venta } from '../entities/venta.entity'
import type { ComprarDto } from '@/application/dtos/comprar.dto'
import type {
  CrearVentaDto, ActualizarVentaDto, CrearDetalleVentaDto,
} from '@/application/dtos/venta.dto'

export interface VentaRepository {
  /** Autocompra del cliente logueado (POST /ventas/comprar/). */
  comprar(dto: ComprarDto): Promise<Venta>
  /** Historial de compras del cliente logueado (GET /ventas/mis-compras/). */
  listarMisCompras(): Promise<Venta[]>
  /** Listado completo, para admin/vendedor (GET /ventas/). */
  listarTodas(): Promise<Venta[]>
  crear(dto: CrearVentaDto): Promise<Venta>
  actualizar(id: number, dto: ActualizarVentaDto): Promise<Venta>
  eliminar(id: number): Promise<void>
  agregarDetalle(dto: CrearDetalleVentaDto): Promise<void>
}