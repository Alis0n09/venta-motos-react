// src/presentation/pages/client/FinanciamientoClientePage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Card, CardContent, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, Skeleton,
  LinearProgress, Divider, Grid,
} from '@mui/material'
import { AccountBalanceOutlined, DirectionsBikeOutlined, EventOutlined } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { financiamientoUseCase } from '@/infrastructure/factories/financiamiento.factory'
import { cuotaPagoUseCase } from '@/infrastructure/factories/cuota-pago.factory'
import { formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import type { Financiamiento } from '@/domain/entities/financiamiento.entity'
import type { CuotaPago } from '@/domain/entities/cuota-pago.entity'

const ESTADO_LABEL: Record<string, string> = {
  activo: 'Activo',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
}

const ESTADO_COLOR: Record<string, string> = {
  activo: colors.warning,
  pagado: colors.success,
  cancelado: colors.error,
}

const CUOTA_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  vencida: 'Vencida',
}

const CUOTA_COLOR: Record<string, string> = {
  pendiente: colors.textSecondary,
  pagada: colors.success,
  vencida: colors.error,
}

interface FinanciamientoConCuotas extends Financiamiento {
  cuotas: CuotaPago[]
}

function FinanciamientoCard({ fin }: { fin: FinanciamientoConCuotas }) {
  const totalCuotas = fin.cuotas.length
  const cuotasPagadas = fin.cuotas.filter((c) => c.estado === 'pagada').length
  const progreso = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0
  const proximaCuota = fin.cuotas.find((c) => c.estado !== 'pagada')

  return (
    <Card sx={{ borderRadius: 4, mb: 3, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: colors.primary, px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DirectionsBikeOutlined sx={{ color: colors.accent, fontSize: 28 }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>
                Financiamiento de tu compra
              </Typography>
              <Typography sx={{ color: colors.textOnPrimary, fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>
                {fin.moto_detalle.join(', ') || `Venta #${fin.venta}`}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={ESTADO_LABEL[fin.estado] ?? fin.estado}
            size="small"
            sx={{
              bgcolor: `${ESTADO_COLOR[fin.estado] ?? colors.textSecondary}25`,
              color: ESTADO_COLOR[fin.estado] ?? colors.textSecondary,
              fontWeight: 700,
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>Monto financiado</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: colors.textPrimary }}>
              {formatPrice(Number(fin.monto_financiado))}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>Plazo</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: colors.textPrimary }}>
              {fin.plazo_meses} meses
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>Cuota mensual</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: colors.accent }}>
              {fin.cuota_mensual != null ? `${formatPrice(fin.cuota_mensual)} / mes` : '—'}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {cuotasPagadas} de {totalCuotas} cuotas pagadas
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: colors.accent }}>{progreso}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              height: 8, borderRadius: 4, bgcolor: colors.border,
              '& .MuiLinearProgress-bar': { bgcolor: colors.accent, borderRadius: 4 },
            }}
          />
        </Box>

        {proximaCuota && (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, mb: 3,
            bgcolor: colors.accentLight, borderRadius: 2, p: 1.5,
          }}>
            <EventOutlined sx={{ color: colors.accent }} />
            <Typography variant="body2" sx={{ color: colors.textPrimary }}>
              Próxima cuota: <b>#{proximaCuota.numero_cuota}</b> por {formatPrice(Number(proximaCuota.monto))},
              vence el {formatDateShort(proximaCuota.fecha_vencimiento)}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Cuotas mensuales</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vence</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fin.cuotas.map((cuota) => (
              <TableRow key={cuota.id}>
                <TableCell>{cuota.numero_cuota}</TableCell>
                <TableCell>{formatDateShort(cuota.fecha_vencimiento)}</TableCell>
                <TableCell>{formatPrice(Number(cuota.monto))}</TableCell>
                <TableCell>
                  <Chip
                    label={CUOTA_LABEL[cuota.estado] ?? cuota.estado}
                    size="small"
                    sx={{
                      bgcolor: `${CUOTA_COLOR[cuota.estado]}20`,
                      color: CUOTA_COLOR[cuota.estado],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function FinanciamientoClientePage() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoConCuotas[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const ventas = await ventaUseCase.listarMisCompras()

        const resultados: FinanciamientoConCuotas[] = []
        for (const venta of ventas) {
          const financiamientos = await financiamientoUseCase.listarPorVenta(venta.id)
          for (const fin of financiamientos) {
            const cuotas = await cuotaPagoUseCase.listarPorFinanciamiento(fin.id)
            resultados.push({ ...fin, cuotas: cuotas.sort((a, b) => a.numero_cuota - b.numero_cuota) })
          }
        }
        setFinanciamientos(resultados)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Mi Financiamiento
        </Typography>

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={280} sx={{ mb: 3 }} />
          ))
        ) : financiamientos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AccountBalanceOutlined sx={{ fontSize: 64, color: colors.accent, opacity: 0.4 }} />
            <Typography sx={{ color: colors.textSecondary, mt: 2 }}>
              No tienes financiamientos activos.
            </Typography>
          </Box>
        ) : (
          financiamientos.map((fin) => <FinanciamientoCard key={fin.id} fin={fin} />)
        )}
      </Container>
    </Box>
  )
}