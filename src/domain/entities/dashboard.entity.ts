// src/domain/entities/dashboard.entity.ts

export interface VentaStatDetalle {
  id: number
  cliente_nombre: string | null
  fecha_venta: string
  metodo_pago: string
  total: string
}

export interface MotoStatDetalle {
  id: number
  marca: string
  modelo: string
  stock: number
  estado: string
}

export interface DashboardStats {
  totalVentas: number
  totalMotos: number
  totalClientes: number
  totalGarantias: number
  totalFinanciamientos: number
  financiamientosActivos: number
  ultimasVentas: VentaStatDetalle[]
  stockBajo: MotoStatDetalle[]
  ventasPorMes: { mes: string, total: number }[]
  ventasMesActual: number
  ventasMesAnterior: number
  motosMesActual: number
  motosMesAnterior: number
  clientesMesActual: number
}