// src/presentation/pages/catalog/CarritoPage.tsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Typography, Container, Card, CardContent, IconButton,
  TextField, Button, Divider, Alert, MenuItem, Grid,
  FormControlLabel, Switch,
} from '@mui/material'
import { Delete, Add, Remove, ShoppingCartOutlined } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { formatPrice } from '@/presentation/utils/formatters'
import {
  useCarritoStore, selectCarritoTotal,
} from '@/presentation/store/carrito.store'
import { useNotificacionesStore } from '@/presentation/store/notificaciones.store'
import type { MetodoPago } from '@/domain/entities/venta.entity'
import type { ComprarDto } from '@/application/dtos/comprar.dto'

const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'credito', label: 'Crédito / Financiamiento' },
]

const PLAZOS_MESES = [6, 12, 18, 24, 36, 48]

export default function CarritoPage() {
  const navigate = useNavigate()
  const items = useCarritoStore((s) => s.items)
  const total = useCarritoStore(selectCarritoTotal)
  const actualizarCantidad = useCarritoStore((s) => s.actualizarCantidad)
  const quitarItem = useCarritoStore((s) => s.quitarItem)
  const vaciar = useCarritoStore((s) => s.vaciar)

  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo')

  const [quiereFinanciar, setQuiereFinanciar] = useState(false)
  const [montoAFinanciar, setMontoAFinanciar] = useState('')
  const [tasaInteres, setTasaInteres] = useState('12')
  const [plazoMeses, setPlazoMeses] = useState(12)

  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const montoFinanciarNum = Number(montoAFinanciar) || 0
  const montoContado = quiereFinanciar ? Math.max(total - montoFinanciarNum, 0) : total
  const montoInvalido = quiereFinanciar && (montoFinanciarNum <= 0 || montoFinanciarNum > total)

  function handleToggleFinanciar(checked: boolean) {
    setQuiereFinanciar(checked)
    if (checked && !montoAFinanciar) {
      setMontoAFinanciar(total.toFixed(2))
    }
  }

  async function handleFinalizarCompra() {
    if (montoInvalido) return
    setProcesando(true)
    setError(null)
    try {
      const dto: ComprarDto = {
        metodo_pago: metodoPago,
        items: items.map((i) => ({ moto_id: i.motoId, cantidad: i.cantidad })),
      }
      if (quiereFinanciar && montoFinanciarNum > 0) {
        dto.monto_a_financiar = montoFinanciarNum
        dto.tasa_interes = Number(tasaInteres) || 0
        dto.plazo_meses = plazoMeses
      }

      const venta = await ventaUseCase.comprar(dto)

      // El backend genera la notificación real (por señal) al crear la Venta
      // y el Financiamiento; solo refrescamos la campanita para mostrarla.
      useNotificacionesStore.getState().cargar()

      vaciar()
      navigate('/mis-compras', { state: { ventaCreada: venta.id } })
    } catch (err) {
      setError(parseApiError(err).detail)
    } finally {
      setProcesando(false)
    }
  }

  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <ShoppingCartOutlined sx={{ fontSize: 64, color: colors.accent, opacity: 0.5 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: colors.textPrimary }}>
          Tu carrito está vacío
        </Typography>
        <Button component={Link} to="/catalogo" variant="contained"
          sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}>
          Ir al catálogo
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Mi Carrito
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {items.map((item) => (
          <Card key={item.motoId} sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: 2, bgcolor: colors.border,
                backgroundImage: item.imagenUrl ? `url(${item.imagenUrl})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0,
              }} />

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>{item.marcaNombre}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{item.modelo}</Typography>
                <Typography sx={{ color: colors.accent, fontWeight: 800 }}>{formatPrice(item.precio)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" onClick={() => actualizarCantidad(item.motoId, item.cantidad - 1)}>
                  <Remove fontSize="small" />
                </IconButton>
                <TextField
                  value={item.cantidad}
                  size="small"
                  sx={{ width: 56 }}
                  slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/\D/g, '')) || 1
                    actualizarCantidad(item.motoId, val)
                  }}
                />
                <IconButton
                  size="small"
                  disabled={item.cantidad >= item.stockDisponible}
                  onClick={() => actualizarCantidad(item.motoId, item.cantidad + 1)}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              <IconButton onClick={() => quitarItem(item.motoId)} sx={{ color: colors.error }}>
                <Delete />
              </IconButton>
            </CardContent>
          </Card>
        ))}

        <Card sx={{ borderRadius: 3, mt: 3 }}>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select fullWidth label="Método de pago del contado"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                >
                  {METODOS_PAGO.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total de la compra</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: colors.accent }}>
                  {formatPrice(total)}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={quiereFinanciar}
                  onChange={(e) => handleToggleFinanciar(e.target.checked)}
                />
              }
              label={<Typography sx={{ fontWeight: 700 }}>Financiar parte de mi compra</Typography>}
            />

            {quiereFinanciar && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth type="number" label="Monto a financiar"
                      value={montoAFinanciar}
                      onChange={(e) => setMontoAFinanciar(e.target.value)}
                      error={montoInvalido}
                      helperText={montoInvalido ? `Debe ser mayor a 0 y no más de ${formatPrice(total)}` : ' '}
                      slotProps={{ htmlInput: { min: 0, max: total, step: '0.01' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth type="number" label="Tasa de interés anual (%)"
                      value={tasaInteres}
                      onChange={(e) => setTasaInteres(e.target.value)}
                      slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select fullWidth label="Plazo"
                      value={plazoMeses}
                      onChange={(e) => setPlazoMeses(Number(e.target.value))}
                    >
                      {PLAZOS_MESES.map((p) => (
                        <MenuItem key={p} value={p}>{p} meses</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Box sx={{
                  mt: 2, p: 2, borderRadius: 2, bgcolor: colors.accentLight,
                  display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
                }}>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                    Pagas ahora ({METODOS_PAGO.find((m) => m.value === metodoPago)?.label.toLowerCase()}):{' '}
                    <b>{formatPrice(montoContado)}</b>
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }}>
                    Financias: <b>{formatPrice(montoFinanciarNum)}</b> a {plazoMeses} meses
                  </Typography>
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Tu solicitud de financiamiento quedará pendiente de aprobación. Un asesor la
                  revisará y te notificaremos apenas sea aprobada o rechazada.
                </Alert>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth variant="contained" size="large"
              disabled={procesando || montoInvalido}
              onClick={handleFinalizarCompra}
              sx={{ bgcolor: colors.accent, color: '#fff', fontWeight: 700, py: 1.5, '&:hover': { bgcolor: '#e0265e' } }}
            >
              {procesando ? 'Procesando...' : 'Finalizar compra'}
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}