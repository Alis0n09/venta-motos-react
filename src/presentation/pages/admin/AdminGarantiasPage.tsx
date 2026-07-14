// src/presentation/pages/admin/AdminGarantiasPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container, Button, Alert,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Skeleton, Divider,
} from '@mui/material'
import { Add, Edit, Delete, Close, Shield, CalendarMonth, Receipt } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { garantiaUseCase } from '@/infrastructure/factories/garantia.factory'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { formatDateShort } from '@/presentation/utils/formatters'
import type { Garantia } from '@/domain/entities/garantia.entity'
import type { Venta } from '@/domain/entities/venta.entity'
import type { CreateGarantiaDto } from '@/application/dtos/garantia.dto'

const EMPTY_FORM: CreateGarantiaDto = {
  fecha_inicio: '',
  fecha_fin: '',
  tipo: '',
  venta: 0,
}

function estadoGarantia(fechaFin: string) {
  const hoy = new Date()
  const fin = new Date(fechaFin)
  const dias = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return { label: 'Vencida', color: colors.error }
  if (dias <= 30) return { label: 'Por vencer', color: colors.warning }
  return { label: 'Vigente', color: colors.success }
}

// ─── Modal Detalle ────────────────────────────────────────────────────────────

function DetalleModal({ garantia, open, onClose, onEditar }: {
  garantia: Garantia | null
  open: boolean
  onClose: () => void
  onEditar: (g: Garantia) => void
}) {
  if (!garantia) return null
  const estado = estadoGarantia(garantia.fecha_fin)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield sx={{ color: colors.accent }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Detalle de Garantía</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            {garantia.tipo}
          </Typography>
          <Chip label={estado.label} sx={{ bgcolor: `${estado.color}20`, color: estado.color, fontWeight: 700 }} />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Venta asociada
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Receipt sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Venta #{garantia.venta}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Fecha de inicio
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CalendarMonth sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDateShort(garantia.fecha_inicio)}</Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Fecha de vencimiento
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <CalendarMonth sx={{ fontSize: 16, color: colors.accent }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatDateShort(garantia.fecha_fin)}</Typography>
            </Box>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${estado.color}10`, border: `1px solid ${estado.color}30` }}>
            <Typography variant="body2" sx={{ color: estado.color, fontWeight: 600 }}>
              {estado.label === 'Vigente' ? '✓ Garantía activa y vigente.'
                : estado.label === 'Vencida' ? '✗ Esta garantía ha vencido.'
                  : '⚠ Garantía próxima a vencer.'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontWeight: 600 }}>Cerrar</Button>
        <Button
          onClick={() => { onClose(); onEditar(garantia) }}
          variant="contained"
          sx={{ bgcolor: colors.primary, color: '#fff', fontWeight: 700, borderRadius: 3, border: `1.5px solid ${colors.accent}` }}
        >
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── AdminGarantiasPage ───────────────────────────────────────────────────────

export default function AdminGarantiasPage() {
  const [garantias, setGarantias] = useState<Garantia[]>([])
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [detalleOpen, setDetalleOpen] = useState(false)
  const [editando, setEditando] = useState<Garantia | null>(null)
  const [detalle, setDetalle] = useState<Garantia | null>(null)
  const [form, setForm] = useState<CreateGarantiaDto>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Garantia | null>(null)

  const fetchGarantias = useCallback(async () => {
    setLoading(true)
    try {
      const result = await garantiaUseCase.getAll()
      setGarantias(result.results)
    } catch {
      setError('No se pudieron cargar las garantías.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGarantias()
    ventaUseCase.listarTodas().then(setVentas).catch(() => {})
  }, [fetchGarantias])

  function handleAbrirCrear() {
    setEditando(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  function handleAbrirEditar(g: Garantia) {
    setEditando(g)
    setForm({ fecha_inicio: g.fecha_inicio, fecha_fin: g.fecha_fin, tipo: g.tipo, venta: g.venta })
    setFormError(null)
    setModalOpen(true)
  }

  function handleVerDetalle(g: Garantia) {
    setDetalle(g)
    setDetalleOpen(true)
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editando) {
        await garantiaUseCase.update(editando.id, form)
      } else {
        await garantiaUseCase.create(form)
      }
      setModalOpen(false)
      fetchGarantias()
    } catch (err) {
      const apiErr = err as { detail?: string }
      setFormError(apiErr.detail ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleEliminar() {
    if (!confirmDelete) return
    try {
      await garantiaUseCase.delete(confirmDelete.id)
      setConfirmDelete(null)
      fetchGarantias()
    } catch {
      setError('No se pudo eliminar la garantía.')
    }
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'block' }}>
              Admin
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
              Gestión de Garantías
            </Typography>
          </Box>
          <Button onClick={handleAbrirCrear} variant="contained" startIcon={<Add />}
            sx={{
              bgcolor: colors.primary, color: colors.textOnPrimary,
              fontWeight: 700, borderRadius: 3,
              border: `1.5px solid ${colors.accent}`,
              '&:hover': { bgcolor: colors.primaryDark },
            }}>
            Nueva garantía
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Venta</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Inicio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Vence</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : garantias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Shield sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.3, mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography sx={{ color: colors.textSecondary }}>No hay garantías registradas</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                garantias.map((g) => {
                  const estado = estadoGarantia(g.fecha_fin)
                  return (
                    <TableRow key={g.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleVerDetalle(g)}>
                      <TableCell>#{g.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{g.tipo}</TableCell>
                      <TableCell>Venta #{g.venta}</TableCell>
                      <TableCell>{formatDateShort(g.fecha_inicio)}</TableCell>
                      <TableCell>{formatDateShort(g.fecha_fin)}</TableCell>
                      <TableCell>
                        <Chip label={estado.label} size="small"
                          sx={{ bgcolor: `${estado.color}20`, color: estado.color, fontWeight: 700 }} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => handleAbrirEditar(g)} sx={{ color: colors.accent }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setConfirmDelete(g)} sx={{ color: colors.error }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Modal crear/editar ── */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {editando ? 'Editar garantía' : 'Nueva garantía'}
            </Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small"><Close /></IconButton>
          </DialogTitle>

          <DialogContent dividers>
            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
            <Box component="form" id="garantia-form" onSubmit={handleGuardar}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>

              <TextField fullWidth required label="Tipo de garantía"
                placeholder="Ej: General, Motor, Eléctrica"
                value={form.tipo}
                onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
              />

              <TextField select fullWidth required label="Venta"
                value={form.venta || ''}
                onChange={(e) => setForm((p) => ({ ...p, venta: Number(e.target.value) }))}
              >
                <MenuItem value="">Selecciona una venta</MenuItem>
                {ventas.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    #{v.id} — {v.cliente_nombre ?? 'Sin cliente'} · {formatDateShort(v.fecha_venta)} · ${v.total}
                  </MenuItem>
                ))}
              </TextField>

              <TextField fullWidth required label="Fecha de inicio" type="date"
                value={form.fecha_inicio}
                onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField fullWidth required label="Fecha de vencimiento" type="date"
                value={form.fecha_fin}
                onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={() => setModalOpen(false)} sx={{ color: colors.textSecondary, fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button type="submit" form="garantia-form" variant="contained" disabled={saving}
              sx={{
                bgcolor: colors.primary, color: colors.textOnPrimary,
                fontWeight: 700, borderRadius: 3,
                border: `1.5px solid ${colors.accent}`,
              }}>
              {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : editando ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Modal detalle ── */}
        <DetalleModal
          garantia={detalle}
          open={detalleOpen}
          onClose={() => setDetalleOpen(false)}
          onEditar={(g) => { handleAbrirEditar(g) }}
        />

        {/* ── Confirmar eliminar ── */}
        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
          slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>¿Eliminar garantía?</DialogTitle>
          <DialogContent>
            <Typography>
              Vas a eliminar la garantía <b>{confirmDelete?.tipo}</b> de la Venta #{confirmDelete?.venta}. Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={() => setConfirmDelete(null)} sx={{ color: colors.textSecondary, fontWeight: 600 }}>
              Cancelar
            </Button>
            <Button onClick={handleEliminar} variant="contained"
              sx={{ bgcolor: colors.error, color: '#fff', fontWeight: 700, borderRadius: 3 }}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Box>
  )
}