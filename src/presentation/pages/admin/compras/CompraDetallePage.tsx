// src/presentation/pages/admin/compras/CompraDetallePage.tsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Skeleton, Button, Alert,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { compraRepository, detalleCompraRepository } from '@/infrastructure/factories/compra.factory'
import { proveedorRepository } from '@/infrastructure/factories/proveedor.factory'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import { motoRepository } from '@/infrastructure/factories/moto.factory'
import type { Compra } from '@/domain/entities/compra.entity'
import type { DetalleCompra } from '@/domain/entities/detalle-compra.entity'
import type { MotoOption } from '@/domain/ports/moto.repository'
import { ApiException } from '@/domain/exceptions/api.exception'
import { colors } from '@/presentation/theme/colors'
import { formatPrice, formatDate } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'

function InfoField({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, color: accent ? colors.accent : colors.textPrimary }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function CompraDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [compra, setCompra] = useState<Compra | null>(null)
  const [lineas, setLineas] = useState<DetalleCompra[]>([])
  const [proveedorNombre, setProveedorNombre] = useState('')
  const [sucursalNombre, setSucursalNombre] = useState('')
  const [motoNombres, setMotoNombres] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [compraData, detalleData] = await Promise.all([
          compraRepository.getById(id as string),
          detalleCompraRepository.listByCompra(id as string),
        ])
        if (!active) return
        setCompra(compraData)
        setLineas(detalleData)

        const motoIds = [...new Set(detalleData.map((linea) => linea.moto))]
        const [proveedor, sucursales, motos] = await Promise.all([
          proveedorRepository.getById(compraData.proveedor),
          sucursalRepository.list({ page: 1, pageSize: 100 }),
          Promise.all(motoIds.map((motoId) => motoRepository.getByIdOption(motoId).catch(() => null))),
        ])
        if (!active) return

        setProveedorNombre(proveedor.empresa)
        setSucursalNombre(
          sucursales.results.find((s) => s.id === compraData.sucursal_destino)?.nombre
          ?? `#${compraData.sucursal_destino}`,
        )
        setMotoNombres(
          Object.fromEntries(
            motos
              .filter((moto): moto is MotoOption => moto !== null)
              .map((moto) => [moto.id, `${moto.marca_nombre} ${moto.modelo} (${moto.anio})`]),
          ),
        )
      } catch (err) {
        if (!active) return
        const apiErr = err as ApiException
        setError(apiErr.detail ?? 'No se pudo cargar la compra')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [id])

  return (
    <CrudPageLayout title={compra ? `Compra #${compra.id}` : 'Detalle de Compra'}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/compras')}
        sx={{ mb: 2, color: colors.textSecondary }}
      >
        Volver a Compras
      </Button>

      {isLoading ? (
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
      ) : error || !compra ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error ?? 'Compra no encontrada'}</Alert>
      ) : (
        <>
          <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <InfoField label="Proveedor" value={proveedorNombre} />
              <InfoField label="Sucursal destino" value={sucursalNombre} />
              <InfoField label="Fecha" value={formatDate(compra.fecha)} />
              <InfoField label="Total" value={formatPrice(Number(compra.total))} accent />
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: colors.background }}>
                    <TableCell sx={{ fontWeight: 700, color: colors.textPrimary }}>Moto</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Cantidad</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Precio Costo</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 4 }}>
                          Esta compra no tiene líneas registradas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineas.map((linea) => (
                      <TableRow key={linea.id} hover>
                        <TableCell>{motoNombres[linea.moto] ?? `#${linea.moto}`}</TableCell>
                        <TableCell align="right">{linea.cantidad}</TableCell>
                        <TableCell align="right">{formatPrice(Number(linea.precio_costo))}</TableCell>
                        <TableCell align="right">{formatPrice(linea.cantidad * Number(linea.precio_costo))}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, color: colors.accent }}>
                Total: {formatPrice(Number(compra.total))}
              </Typography>
            </Box>
          </Paper>
        </>
      )}
    </CrudPageLayout>
  )
}
