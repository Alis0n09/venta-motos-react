// src/infrastructure/adapters/axios-dashboard.repository.ts

import { apiClient } from '@/infrastructure/http/axios-client'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { DashboardRepository } from '@/domain/ports/dashboard.repository'
import type { DashboardStats, VentaStatDetalle, MotoStatDetalle } from '@/domain/entities/dashboard.entity'

export class AxiosDashboardRepository implements DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    try {
      const [ventasRes, motosRes, clientesRes, garantiasRes, financiamientosRes] = await Promise.all([
        apiClient.get('/ventas/stats/'),
        apiClient.get('/motos/stats/'),
        apiClient.get('/clientes/stats/'),
        apiClient.get('/garantias/stats/'),
        apiClient.get('/financiamientos/stats/'),
      ])

      const ventas: VentaStatDetalle[] = ventasRes.data.detail ?? []
      const motos: MotoStatDetalle[] = motosRes.data.detail ?? []
      const clientes = clientesRes.data.detail ?? []

      const hoy = new Date()
      const mesActual = hoy.getMonth()
      const anioActual = hoy.getFullYear()
      const mesAnterior = mesActual === 0 ? 11 : mesActual - 1
      const anioAnterior = mesActual === 0 ? anioActual - 1 : anioActual

      const ventasMesActualArr = ventas.filter((v) => {
        const f = new Date(v.fecha_venta)
        return f.getMonth() === mesActual && f.getFullYear() === anioActual
      })
      const ventasMesAnteriorArr = ventas.filter((v) => {
        const f = new Date(v.fecha_venta)
        return f.getMonth() === mesAnterior && f.getFullYear() === anioAnterior
      })

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const ventasPorMes = Array.from({ length: 6 }, (_, i) => {
        const fecha = new Date(anioActual, mesActual - 5 + i, 1)
        const mes = meses[fecha.getMonth()]
        const total = ventas
          .filter((v) => {
            const fv = new Date(v.fecha_venta)
            return fv.getMonth() === fecha.getMonth() && fv.getFullYear() === fecha.getFullYear()
          })
          .reduce((acc, v) => acc + Number(v.total), 0)
        return { mes, total }
      })

      return {
        totalVentas: ventasRes.data.total,
        totalMotos: motosRes.data.total,
        totalClientes: clientesRes.data.total,
        totalGarantias: garantiasRes.data.total_registros,
        totalFinanciamientos: financiamientosRes.data.total_registros,
        financiamientosActivos: financiamientosRes.data.activos,
        ultimasVentas: [...ventas]
          .sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime())
          .slice(0, 5),
        stockBajo: motos.filter((m) => m.stock <= 3 && m.estado === 'disponible').slice(0, 5),
        ventasPorMes,
        ventasMesActual: ventasMesActualArr.reduce((acc, v) => acc + Number(v.total), 0),
        ventasMesAnterior: ventasMesAnteriorArr.reduce((acc, v) => acc + Number(v.total), 0),
        motosMesActual: ventasMesActualArr.length,
        motosMesAnterior: ventasMesAnteriorArr.length,
        clientesMesActual: clientes.length,
      }
    } catch (err) {
      throw parseApiError(err)
    }
  }
}