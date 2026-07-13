// src/application/use-cases/venta.use-case.ts

import type { VentaRepository } from '@/domain/ports/venta.repository'
import type { Venta } from '@/domain/entities/venta.entity'
import type { ComprarDto } from '../dtos/comprar.dto'
import type { CrearVentaDto, ActualizarVentaDto, CrearDetalleVentaDto } from '../dtos/venta.dto'

export class VentaUseCase {
  private readonly repo: VentaRepository

  constructor(repo: VentaRepository) {
    this.repo = repo
  }

  comprar(dto: ComprarDto): Promise<Venta> {
    return this.repo.comprar(dto)
  }

  listarMisCompras(): Promise<Venta[]> {
    return this.repo.listarMisCompras()
  }

  listarTodas(): Promise<Venta[]> {
    return this.repo.listarTodas()
  }

  crear(dto: CrearVentaDto): Promise<Venta> {
    return this.repo.crear(dto)
  }

  actualizar(id: number, dto: ActualizarVentaDto): Promise<Venta> {
    return this.repo.actualizar(id, dto)
  }

  eliminar(id: number): Promise<void> {
    return this.repo.eliminar(id)
  }

  agregarDetalle(dto: CrearDetalleVentaDto): Promise<void> {
    return this.repo.agregarDetalle(dto)
  }
}