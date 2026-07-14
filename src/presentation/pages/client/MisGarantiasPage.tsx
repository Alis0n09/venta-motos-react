// src/presentation/pages/client/MisGarantiasPage.tsx

import { useState, useEffect } from 'react'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Chip, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, IconButton, Divider,
} from '@mui/material'
import { Shield, CalendarMonth, Close, Receipt } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { garantiaUseCase } from '@/infrastructure/factories/garantia.factory'
import { formatDateShort } from '@/presentation/utils/formatters'
import type { Garantia } from '@/domain/entities/garantia.entity'

interface GarantiaConVenta extends Garantia {
  ventaId: number
}

function estadoGarantia(fechaFin: string): { label: string, color: string } {
  const hoy = new Date()
  const fin = new Date(fechaFin)
  const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (diasRestantes < 0) return { label: 'Vencida', color: colors.error }
  if (diasRestantes <= 30) return { label: `Vence en ${diasRestantes} días`, color: colors.warning }
  return { label: 'Vigente', color: colors.success }
}

function DetalleModal({ garantia, open, onClose }: {
  garantia: GarantiaConVenta | null
  open: boolean
  onClose: () => void
}) {
  if (!garantia) return null
  const estado = estadoGarantia(garantia.fecha_fin)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield sx={{ color: colors.accent }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Detalle de Garantía
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            {garantia.tipo}
          </Typography>
          <Chip
            label={estado.label}
            sx={{ bgcolor: `${estado.color}20`, color: estado.color, fontWeight: 700 }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Venta asociada
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Receipt sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                Venta #{garantia.venta}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Fecha de inicio
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CalendarMonth sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                {formatDateShort(garantia.fecha_inicio)}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Fecha de vencimiento
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CalendarMonth sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                {formatDateShort(garantia.fecha_fin)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            p: 2, borderRadius: 2,
            bgcolor: `${estado.color}10`,
            border: `1px solid ${estado.color}30`,
          }}>
            <Typography variant="body2" sx={{ color: estado.color, fontWeight: 600 }}>
              {estado.label === 'Vigente'
                ? '✓ Tu garantía está activa y vigente.'
                : estado.label === 'Vencida'
                  ? '✗ Esta garantía ha vencido.'
                  : `⚠ Tu garantía está próxima a vencer.`
              }
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default function MisGarantiasPage() {
  const [garantias, setGarantias] = useState<GarantiaConVenta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<GarantiaConVenta | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const ventas = await ventaUseCase.listarMisCompras()
        const resultados = await Promise.all(
          ventas.map((v) =>
            garantiaUseCase.getByVenta(v.id).then((gs) =>
              gs.map((g) => ({ ...g, ventaId: v.id }))
            )
          )
        )
        setGarantias(resultados.flat())
      } catch {
        setError('No se pudieron cargar tus garantías.')
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress sx={{ color: colors.accent }} />
    </Box>
  )

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{
            color: colors.accent, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', display: 'block', mb: 1,
          }}>
            Mi cuenta
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            Mis Garantías
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            {garantias.length} garantía{garantias.length !== 1 ? 's' : ''} registrada{garantias.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {garantias.length === 0 && !error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Shield sx={{ fontSize: 64, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
            <Typography sx={{ color: colors.textSecondary }}>
              No tienes garantías registradas aún.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {garantias.map((g) => {
              const estado = estadoGarantia(g.fecha_fin)
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={g.id}>
                  <Card
                    onClick={() => setSelected(g)}
                    sx={{
                      borderRadius: 3, border: `1px solid ${colors.border}`,
                      height: '100%', cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Shield sx={{ color: colors.accent }} />
                          <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                            {g.tipo}
                          </Typography>
                        </Box>
                        <Chip
                          label={estado.label}
                          size="small"
                          sx={{ bgcolor: `${estado.color}20`, color: estado.color, fontWeight: 700 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: colors.textSecondary }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Inicio: <b>{formatDateShort(g.fecha_inicio)}</b>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: colors.textSecondary }} />
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Vence: <b>{formatDateShort(g.fecha_fin)}</b>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Receipt sx={{ fontSize: 16, color: colors.textSecondary }} />
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            Venta #{g.venta}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 600, mt: 2, display: 'block' }}>
                        Ver detalle →
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Container>

      <DetalleModal
        garantia={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </Box>
  )
}