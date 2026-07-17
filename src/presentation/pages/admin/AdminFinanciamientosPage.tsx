// src/presentation/pages/admin/AdminFinanciamientosPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert, Skeleton, Chip,
  Accordion, AccordionSummary, AccordionDetails, Table, TableHead, TableRow,
  TableCell, TableBody, Autocomplete,
} from '@mui/material'
import { Add, Edit, Delete, ExpandMore, CheckCircle, Cancel } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { financiamientoUseCase } from '@/infrastructure/factories/financiamiento.factory'
import { cuotaPagoUseCase } from '@/infrastructure/factories/cuota-pago.factory'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import type { Financiamiento, EstadoFinanciamiento } from '@/domain/entities/financiamiento.entity'
import type { CuotaPago, EstadoCuota } from '@/domain/entities/cuota-pago.entity'
import type { Venta } from '@/domain/entities/venta.entity'
import type { CrearFinanciamientoDto, AprobarFinanciamientoDto } from '@/application/dtos/financiamiento.dto'

const ESTADOS_FIN: EstadoFinanciamiento[] = ['pendiente', 'activo', 'pagado', 'cancelado']
const ESTADOS_CUOTA: EstadoCuota[] = ['pendiente', 'pagada', 'vencida']

const ESTADO_COLOR: Record<string, string> = {
  pendiente: colors.warning, activo: colors.success, pagado: colors.success,
  cancelado: colors.error, vencida: colors.error,
}

const FORM_VACIO: CrearFinanciamientoDto = {
  venta: 0, monto_financiado: '', tasa_interes: '', plazo_meses: 12,
  fecha_inicio: new Date().toISOString().slice(0, 10),
  fecha_fin: new Date().toISOString().slice(0, 10),
  estado: 'activo',
}

export default function AdminFinanciamientosPage() {
  const [financiamientos, setFinanciamientos] = useState<Financiamiento[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [cuotasPorFin, setCuotasPorFin] = useState<Record<number, CuotaPago[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Financiamiento | null>(null)
  const [form, setForm] = useState<CrearFinanciamientoDto>(FORM_VACIO)
  const [ventaSel, setVentaSel] = useState<Venta | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [cuotaEditando, setCuotaEditando] = useState<CuotaPago | null>(null)
  const [cuotaForm, setCuotaForm] = useState<{ estado: EstadoCuota; fecha_pago: string }>({
    estado: 'pendiente', fecha_pago: '',
  })
  const [procesandoId, setProcesandoId] = useState<number | null>(null)

  const [aprobando, setAprobando] = useState<Financiamiento | null>(null)
  const [tasaAprobacion, setTasaAprobacion] = useState('')
  const [aprobandoError, setAprobandoError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setLoading(true)
    financiamientoUseCase.listarTodos()
      .then(setFinanciamientos)
      .catch(() => setError('No se pudieron cargar los financiamientos.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    cargar()
    ventaUseCase.listarTodas().then(setVentas)
  }, [cargar])

  async function cargarCuotas(financiamientoId: number) {
    const cuotas = await cuotaPagoUseCase.listarPorFinanciamiento(financiamientoId)
    setCuotasPorFin((prev) => ({ ...prev, [financiamientoId]: cuotas.sort((a, b) => a.numero_cuota - b.numero_cuota) }))
  }

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setVentaSel(null)
    setFormError(null)
    setDialogOpen(true)
  }

  function abrirEditar(fin: Financiamiento) {
    setEditando(fin)
    setForm({
      venta: fin.venta,
      monto_financiado: fin.monto_financiado,
      tasa_interes: fin.tasa_interes ?? '',
      plazo_meses: fin.plazo_meses,
      fecha_inicio: fin.fecha_inicio,
      fecha_fin: fin.fecha_fin,
      estado: fin.estado,
    })
    setVentaSel(ventas.find((v) => v.id === fin.venta) ?? null)
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleGuardar() {
    setGuardando(true)
    setFormError(null)
    try {
      const payload = { ...form, venta: ventaSel?.id ?? form.venta }
      if (editando) {
        await financiamientoUseCase.actualizar(editando.id, payload)
      } else {
        await financiamientoUseCase.crear(payload)
      }
      setDialogOpen(false)
      cargar()
    } catch (err) {
      setFormError(parseApiError(err).detail)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(fin: Financiamiento) {
    if (!confirm(`¿Eliminar el financiamiento #${fin.id}?`)) return
    try {
      await financiamientoUseCase.eliminar(fin.id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).detail)
    }
  }

  function abrirAprobar(fin: Financiamiento) {
    setAprobando(fin)
    setTasaAprobacion('')
    setAprobandoError(null)
  }

  async function handleConfirmarAprobar() {
    if (!aprobando) return
    const tasa = Number(tasaAprobacion)
    if (tasaAprobacion.trim() === '' || Number.isNaN(tasa) || tasa < 0) {
      setAprobandoError('Ingresa una tasa de interés anual válida (0 o mayor).')
      return
    }
    setProcesandoId(aprobando.id)
    setAprobandoError(null)
    try {
      const dto: AprobarFinanciamientoDto = { tasa_interes: tasa }
      await financiamientoUseCase.aprobar(aprobando.id, dto)
      setAprobando(null)
      cargar()
    } catch (err) {
      setAprobandoError(parseApiError(err).detail)
    } finally {
      setProcesandoId(null)
    }
  }

  async function handleRechazar(fin: Financiamiento) {
    if (!confirm(`¿Rechazar la solicitud de financiamiento #${fin.id} de ${fin.cliente_nombre}?`)) return
    setProcesandoId(fin.id)
    try {
      await financiamientoUseCase.rechazar(fin.id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).detail)
    } finally {
      setProcesandoId(null)
    }
  }

  function abrirEditarCuota(cuota: CuotaPago) {
    setCuotaEditando(cuota)
    setCuotaForm({ estado: cuota.estado, fecha_pago: cuota.fecha_pago ?? new Date().toISOString().slice(0, 10) })
  }

  async function handleGuardarCuota() {
    if (!cuotaEditando) return
    try {
      await cuotaPagoUseCase.actualizar(cuotaEditando.id, {
        estado: cuotaForm.estado,
        fecha_pago: cuotaForm.estado === 'pagada' ? cuotaForm.fecha_pago : null,
      })
      setCuotaEditando(null)
      cargarCuotas(cuotaEditando.financiamiento)
    } catch (err) {
      setError(parseApiError(err).detail)
    }
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            Gestión de Financiamientos
          </Typography>
          <Button
            variant="contained" startIcon={<Add />} onClick={abrirCrear}
            sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
          >
            Nuevo financiamiento
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Skeleton variant="rounded" height={300} />
        ) : financiamientos.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: colors.textSecondary, py: 6 }}>
            No hay financiamientos registrados.
          </Typography>
        ) : (
          financiamientos.map((fin) => (
            <Accordion
              key={fin.id}
              sx={{ borderRadius: 3, mb: 2, '&:before': { display: 'none' } }}
              onChange={(_, expanded) => { if (expanded && fin.estado !== 'pendiente' && !cuotasPorFin[fin.id]) cargarCuotas(fin.id) }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>
                      #{fin.id} · {fin.cliente_nombre} · {fin.moto_detalle.join(', ')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {formatPrice(Number(fin.monto_financiado))} a {fin.plazo_meses} meses
                      {fin.tasa_interes != null ? ` · ${fin.tasa_interes}% anual` : ' · tasa por asignar'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={fin.estado} size="small"
                      sx={{ bgcolor: `${ESTADO_COLOR[fin.estado]}20`, color: ESTADO_COLOR[fin.estado], fontWeight: 600, textTransform: 'capitalize' }}
                    />
                    {fin.estado === 'pendiente' && (
                      <>
                        <IconButton
                          size="small"
                          disabled={procesandoId === fin.id}
                          onClick={(e) => { e.stopPropagation(); abrirAprobar(fin) }}
                          sx={{ color: colors.success }}
                          title="Aprobar solicitud"
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={procesandoId === fin.id}
                          onClick={(e) => { e.stopPropagation(); handleRechazar(fin) }}
                          sx={{ color: colors.error }}
                          title="Rechazar solicitud"
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); abrirEditar(fin) }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEliminar(fin) }} sx={{ color: colors.error }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {fin.estado === 'pendiente' ? (
                  <Alert severity="warning">
                    Esta solicitud está pendiente de aprobación. El plan de cuotas se generará
                    automáticamente al aprobarla.
                  </Alert>
                ) : !cuotasPorFin[fin.id] ? (
                  <Skeleton variant="rounded" height={100} />
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha de pago</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cuotasPorFin[fin.id].map((cuota) => (
                        <TableRow key={cuota.id}>
                          <TableCell>{cuota.numero_cuota}</TableCell>
                          <TableCell>{formatDateShort(cuota.fecha_vencimiento)}</TableCell>
                          <TableCell>{formatPrice(Number(cuota.monto))}</TableCell>
                          <TableCell>
                            <Chip
                              label={cuota.estado} size="small"
                              sx={{ bgcolor: `${ESTADO_COLOR[cuota.estado] ?? colors.textSecondary}20`, color: ESTADO_COLOR[cuota.estado] ?? colors.textSecondary, fontWeight: 600, textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>{cuota.fecha_pago ? formatDateShort(cuota.fecha_pago) : '—'}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => abrirEditarCuota(cuota)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editando ? `Editar financiamiento #${editando.id}` : 'Nuevo financiamiento'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Autocomplete
              options={ventas}
              getOptionLabel={(v) => `Venta #${v.id} · ${v.cliente_nombre ?? 'Sin cliente'} · ${formatPrice(Number(v.total))}`}
              value={ventaSel}
              disabled={!!editando}
              onChange={(_, value) => setVentaSel(value)}
              renderInput={(params) => <TextField {...params} label="Venta asociada" required />}
            />
            <TextField
              label="Monto financiado" type="number" fullWidth required
              value={form.monto_financiado}
              onChange={(e) => setForm({ ...form, monto_financiado: e.target.value })}
            />
            <TextField
              label="Tasa de interés anual (%)" type="number" fullWidth required
              value={form.tasa_interes}
              onChange={(e) => setForm({ ...form, tasa_interes: e.target.value })}
            />
            <TextField
              label="Plazo (meses)" type="number" fullWidth required
              value={form.plazo_meses}
              onChange={(e) => setForm({ ...form, plazo_meses: Number(e.target.value) })}
            />
            <TextField
              label="Fecha de inicio" type="date" fullWidth required
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            />
            <TextField
              label="Fecha de fin" type="date" fullWidth required
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            />
            <TextField
              select label="Estado" fullWidth
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoFinanciamiento })}
            >
              {ESTADOS_FIN.map((e) => (
                <MenuItem key={e} value={e} sx={{ textTransform: 'capitalize' }}>{e}</MenuItem>
              ))}
            </TextField>
            {!editando && (
              <Alert severity="info">
                Al crear el financiamiento, el plan de cuotas mensuales se genera automáticamente.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained" disabled={guardando || !ventaSel}
              onClick={handleGuardar}
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!aprobando} onClose={() => setAprobando(null)} fullWidth maxWidth="xs">
          <DialogTitle>Aprobar financiamiento #{aprobando?.id}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {aprobandoError && <Alert severity="error">{aprobandoError}</Alert>}
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {aprobando?.cliente_nombre} · {formatPrice(Number(aprobando?.monto_financiado ?? 0))} a {aprobando?.plazo_meses} meses
            </Typography>
            <TextField
              label="Tasa de interés anual (%)" type="number" fullWidth required autoFocus
              value={tasaAprobacion}
              onChange={(e) => setTasaAprobacion(e.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
              helperText="El cliente no elige la tasa; la fijas tú al aprobar la solicitud."
            />
            <Alert severity="info">
              Al aprobar, el plan de cuotas mensuales se genera automáticamente con esta tasa.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAprobando(null)}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={procesandoId === aprobando?.id}
              onClick={handleConfirmarAprobar}
              sx={{ bgcolor: colors.success, '&:hover': { bgcolor: '#237a48' } }}
            >
              {procesandoId === aprobando?.id ? 'Aprobando...' : 'Aprobar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!cuotaEditando} onClose={() => setCuotaEditando(null)} fullWidth maxWidth="xs">
          <DialogTitle>Cuota #{cuotaEditando?.numero_cuota}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select label="Estado" fullWidth
              value={cuotaForm.estado}
              onChange={(e) => setCuotaForm({ ...cuotaForm, estado: e.target.value as EstadoCuota })}
            >
              {ESTADOS_CUOTA.map((e) => (
                <MenuItem key={e} value={e} sx={{ textTransform: 'capitalize' }}>{e}</MenuItem>
              ))}
            </TextField>
            {cuotaForm.estado === 'pagada' && (
              <TextField
                label="Fecha de pago" type="date" fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={cuotaForm.fecha_pago}
                onChange={(e) => setCuotaForm({ ...cuotaForm, fecha_pago: e.target.value })}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCuotaEditando(null)}>Cancelar</Button>
            <Button
              variant="contained" onClick={handleGuardarCuota}
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}