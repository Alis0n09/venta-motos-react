// src/presentation/pages/client/MisComprasPage.tsx

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box, Typography, Container, Card, CardContent, Chip,
  Alert, Skeleton, Divider,
} from '@mui/material'
import { ReceiptLong, AccountBalanceOutlined } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { financiamientoUseCase } from '@/infrastructure/factories/financiamiento.factory'
import { formatPrice, formatDate } from '@/presentation/utils/formatters'
import type { Venta } from '@/domain/entities/venta.entity'
import type { Financiamiento } from '@/domain/entities/financiamiento.entity'

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  credito: 'Crédito',
}

function calcularTotalReal(venta: Venta): number {
  return venta.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
}

interface VentaConFinanciamiento extends Venta {
  financiamiento: Financiamiento | null
}

export default function MisComprasPage() {
  const location = useLocation()
  const ventaCreada = (location.state as { ventaCreada?: number } | null)?.ventaCreada

  const [ventas, setVentas] = useState<VentaConFinanciamiento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const base = await ventaUseCase.listarMisCompras()

        const conFinanciamiento = await Promise.all(
          base.map(async (venta) => {
            try {
              const lista = await financiamientoUseCase.listarPorVenta(venta.id)
              return { ...venta, financiamiento: lista[0] ?? null }
            } catch {
              return { ...venta, financiamiento: null }
            }
          }),
        )
        setVentas(conFinanciamiento)
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
          Mis Compras
        </Typography>

        {ventaCreada && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ¡Compra #{ventaCreada} realizada con éxito! Revisa el detalle abajo.
          </Alert>
        )}

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ mb: 2 }} />
          ))
        ) : ventas.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ReceiptLong sx={{ fontSize: 64, color: colors.accent, opacity: 0.4 }} />
            <Typography sx={{ color: colors.textSecondary, mt: 2 }}>
              Todavía no tienes compras registradas.
            </Typography>
          </Box>
        ) : (
          ventas.map((venta) => {
            const total = calcularTotalReal(venta)
            const fin = venta.financiamiento
            const montoContado = fin ? total - Number(fin.monto_financiado) : total

            return (
              <Card key={venta.id} sx={{ borderRadius: 3, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>Compra #{venta.id}</Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        {formatDate(venta.fecha_venta)}
                      </Typography>
                    </Box>
                    <Chip
                      label={METODO_LABEL[venta.metodo_pago] ?? venta.metodo_pago}
                      size="small"
                      sx={{ bgcolor: colors.accentLight, color: colors.accent, fontWeight: 600 }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {venta.detalles.map((d) => (
                    <Box key={d.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{d.cantidad}x {d.moto_nombre}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPrice(Number(d.subtotal))}</Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                    <Typography sx={{ fontWeight: 800, color: colors.accent }}>{formatPrice(total)}</Typography>
                  </Box>

                  {fin && (
                    <Box sx={{
                      mt: 2, p: 1.5, borderRadius: 2, bgcolor: colors.background,
                      display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                      <AccountBalanceOutlined sx={{ color: colors.primary, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                        Pagaste <b>{formatPrice(montoContado)}</b> de contado y financiaste{' '}
                        <b>{formatPrice(Number(fin.monto_financiado))}</b> a {fin.plazo_meses} meses
                        {fin.cuota_mensual != null && ` (${formatPrice(fin.cuota_mensual)}/mes)`}.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </Container>
    </Box>
  )
}