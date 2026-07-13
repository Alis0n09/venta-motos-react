// src/presentation/pages/admin/AdminVentasPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container, Button, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Alert, Skeleton, Chip, Divider,
  Autocomplete,
} from '@mui/material'
import { Add, Edit, Delete, Close } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { ventaUseCase } from '@/infrastructure/factories/venta.factory'
import { clienteUseCase } from '@/infrastructure/factories/cliente.factory'
import { vendedorUseCase } from '@/infrastructure/factories/vendedor.factory'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import { formatPrice, formatDate } from '@/presentation/utils/formatters'
import type { Venta, MetodoPago } from '@/domain/entities/venta.entity'
import type { Cliente, Vendedor } from '@/domain/entities/cliente.entity'
import type { Moto } from '@/domain/entities/moto.entity'

const METODOS_PAGO: MetodoPago[] = ['efectivo', 'transferencia', 'tarjeta', 'credito']

function calcularTotalReal(venta: Venta): number {
  return venta.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0)
}

interface ItemNuevo {
  moto: Moto
  cantidad: number
}

export default function AdminVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [motos, setMotos] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editando, setEditando] = useState<Venta | null>(null)
  const [editForm, setEditForm] = useState<{ metodo_pago: MetodoPago; vendedor: number | null }>({
    metodo_pago: 'efectivo', vendedor: null,
  })
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [crearOpen, setCrearOpen] = useState(false)
  const [clienteNuevo, setClienteNuevo] = useState<Cliente | null>(null)
  const [vendedorNuevo, setVendedorNuevo] = useState<Vendedor | null>(null)
  const [metodoNuevo, setMetodoNuevo] = useState<MetodoPago>('efectivo')
  const [itemsNuevos, setItemsNuevos] = useState<ItemNuevo[]>([])
  const [motoSeleccionada, setMotoSeleccionada] = useState<Moto | null>(null)
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1)
  const [creando, setCreando] = useState(false)
  const [crearError, setCrearError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setLoading(true)
    ventaUseCase.listarTodas()
      .then(setVentas)
      .catch(() => setError('No se pudieron cargar las ventas.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    cargar()
    clienteUseCase.listar().then(setClientes)
    vendedorUseCase.listar().then(setVendedores)
    motoUseCase.listarDisponibles().then(setMotos)
  }, [cargar])

  function abrirEditar(venta: Venta) {
    setEditando(venta)
    setEditForm({ metodo_pago: venta.metodo_pago, vendedor: venta.vendedor })
    setFormError(null)
  }

  async function handleGuardarEdicion() {
    if (!editando) return
    setGuardando(true)
    setFormError(null)
    try {
      await ventaUseCase.actualizar(editando.id, editForm)
      setEditando(null)
      cargar()
    } catch (err) {
      setFormError(parseApiError(err).detail)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(venta: Venta) {
    if (!confirm(`¿Eliminar la venta #${venta.id}? Esta acción no se puede deshacer.`)) return
    try {
      await ventaUseCase.eliminar(venta.id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).detail)
    }
  }

  function abrirCrear() {
    setClienteNuevo(null)
    setVendedorNuevo(null)
    setMetodoNuevo('efectivo')
    setItemsNuevos([])
    setMotoSeleccionada(null)
    setCantidadSeleccionada(1)
    setCrearError(null)
    setCrearOpen(true)
  }

  function agregarItemNuevo() {
    if (!motoSeleccionada || cantidadSeleccionada <= 0) return
    setItemsNuevos((prev) => {
      const existente = prev.find((i) => i.moto.id === motoSeleccionada.id)
      if (existente) {
        return prev.map((i) =>
          i.moto.id === motoSeleccionada.id
            ? { ...i, cantidad: i.cantidad + cantidadSeleccionada }
            : i,
        )
      }
      return [...prev, { moto: motoSeleccionada, cantidad: cantidadSeleccionada }]
    })
    setMotoSeleccionada(null)
    setCantidadSeleccionada(1)
  }

  function quitarItemNuevo(motoId: number) {
    setItemsNuevos((prev) => prev.filter((i) => i.moto.id !== motoId))
  }

  const totalNuevo = itemsNuevos.reduce((acc, i) => acc + Number(i.moto.precio) * i.cantidad, 0)

  async function handleCrearVenta() {
    if (!clienteNuevo || itemsNuevos.length === 0) return
    setCreando(true)
    setCrearError(null)
    try {
      const ventaCreada = await ventaUseCase.crear({
        cliente: clienteNuevo.id,
        vendedor: vendedorNuevo?.id ?? null,
        metodo_pago: metodoNuevo,
      })

      for (const item of itemsNuevos) {
        await ventaUseCase.agregarDetalle({
          venta: ventaCreada.id,
          moto: item.moto.id,
          cantidad: item.cantidad,
          precio_unitario: item.moto.precio,
        })
      }

      setCrearOpen(false)
      cargar()
    } catch (err) {
      setCrearError(parseApiError(err).detail)
    } finally {
      setCreando(false)
    }
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            Gestión de Ventas
          </Typography>
          <Button
            variant="contained" startIcon={<Add />} onClick={abrirCrear}
            sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
          >
            Nueva venta
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Skeleton variant="rounded" height={400} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Método de pago</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell>{venta.id}</TableCell>
                  <TableCell>{venta.cliente_nombre ?? '—'}</TableCell>
                  <TableCell>{venta.vendedor_nombre ?? 'Autoservicio'}</TableCell>
                  <TableCell>{formatDate(venta.fecha_venta)}</TableCell>
                  <TableCell>
                    <Chip label={venta.metodo_pago} size="small" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>
                    {venta.detalles.map((d) => `${d.cantidad}x ${d.moto_nombre}`).join(', ') || '—'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: colors.accent }}>
                    {formatPrice(calcularTotalReal(venta))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => abrirEditar(venta)}><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleEliminar(venta)} sx={{ color: colors.error }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {ventas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={!!editando} onClose={() => setEditando(null)} fullWidth maxWidth="xs">
          <DialogTitle>Editar venta #{editando?.id}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select label="Método de pago" fullWidth
              value={editForm.metodo_pago}
              onChange={(e) => setEditForm({ ...editForm, metodo_pago: e.target.value as MetodoPago })}
            >
              {METODOS_PAGO.map((m) => (
                <MenuItem key={m} value={m} sx={{ textTransform: 'capitalize' }}>{m}</MenuItem>
              ))}
            </TextField>
            <Autocomplete
              options={vendedores}
              getOptionLabel={(v) => `${v.nombre} ${v.apellido}`}
              value={vendedores.find((v) => v.id === editForm.vendedor) ?? null}
              onChange={(_, value) => setEditForm({ ...editForm, vendedor: value?.id ?? null })}
              renderInput={(params) => <TextField {...params} label="Vendedor asignado" />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditando(null)}>Cancelar</Button>
            <Button
              variant="contained" disabled={guardando}
              onClick={handleGuardarEdicion}
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={crearOpen} onClose={() => setCrearOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Nueva venta</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {crearError && <Alert severity="error">{crearError}</Alert>}

            <Autocomplete
              options={clientes}
              getOptionLabel={(c) => `${c.nombre} ${c.apellido} · ${c.cedula}`}
              value={clienteNuevo}
              onChange={(_, value) => setClienteNuevo(value)}
              renderInput={(params) => <TextField {...params} label="Cliente" required />}
            />
            <Autocomplete
              options={vendedores}
              getOptionLabel={(v) => `${v.nombre} ${v.apellido}`}
              value={vendedorNuevo}
              onChange={(_, value) => setVendedorNuevo(value)}
              renderInput={(params) => <TextField {...params} label="Vendedor (opcional)" />}
            />
            <TextField
              select label="Método de pago" fullWidth
              value={metodoNuevo}
              onChange={(e) => setMetodoNuevo(e.target.value as MetodoPago)}
            >
              {METODOS_PAGO.map((m) => (
                <MenuItem key={m} value={m} sx={{ textTransform: 'capitalize' }}>{m}</MenuItem>
              ))}
            </TextField>

            <Divider sx={{ my: 1 }} />
            <Typography sx={{ fontWeight: 700 }}>Items de la venta</Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Autocomplete
                sx={{ flexGrow: 1 }}
                options={motos}
                getOptionLabel={(m) => `${m.marca_nombre} ${m.modelo} (stock: ${m.stock})`}
                value={motoSeleccionada}
                onChange={(_, value) => setMotoSeleccionada(value)}
                renderInput={(params) => <TextField {...params} label="Moto" size="small" />}
              />
              <TextField
                type="number" label="Cant." size="small" sx={{ width: 90 }}
                value={cantidadSeleccionada}
                onChange={(e) => setCantidadSeleccionada(Math.max(1, Number(e.target.value)))}
              />
              <Button variant="outlined" onClick={agregarItemNuevo} disabled={!motoSeleccionada}>
                Agregar
              </Button>
            </Box>

            {itemsNuevos.map((item) => (
              <Box key={item.moto.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {item.cantidad}x {item.moto.marca_nombre} {item.moto.modelo}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatPrice(Number(item.moto.precio) * item.cantidad)}
                  </Typography>
                  <IconButton size="small" onClick={() => quitarItemNuevo(item.moto.id)}>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}

            {itemsNuevos.length > 0 && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ fontWeight: 800, color: colors.accent }}>{formatPrice(totalNuevo)}</Typography>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCrearOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={creando || !clienteNuevo || itemsNuevos.length === 0}
              onClick={handleCrearVenta}
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
            >
              {creando ? 'Creando...' : 'Crear venta'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}