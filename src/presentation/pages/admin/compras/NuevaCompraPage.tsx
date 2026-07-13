// src/presentation/pages/admin/compras/NuevaCompraPage.tsx

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, TextField, MenuItem, Autocomplete, CircularProgress,
  Button, IconButton, Alert, Paper, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import { Add, Delete, ArrowBack } from '@mui/icons-material'
import { compraRepository, detalleCompraRepository } from '@/infrastructure/factories/compra.factory'
import { proveedorRepository } from '@/infrastructure/factories/proveedor.factory'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import { motoRepository } from '@/infrastructure/factories/moto.factory'
import { compraFormSchema, compraLineSchema } from '@/application/dtos/compra.dto'
import type { Proveedor } from '@/domain/entities/proveedor.entity'
import type { Sucursal } from '@/domain/entities/sucursal.entity'
import type { MotoOption } from '@/domain/ports/moto.repository'
import { ApiException } from '@/domain/exceptions/api.exception'
import { colors } from '@/presentation/theme/colors'
import { formatPrice } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'

const MOTO_SEARCH_DEBOUNCE_MS = 400

interface CompraLineRow {
  key: string
  moto: MotoOption
  cantidad: number
  precioCosto: number
}

export default function NuevaCompraPage() {
  const navigate = useNavigate()

  // ── Cabecera ──────────────────────────────────────────────────────────────
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [proveedorId, setProveedorId] = useState(0)
  const [sucursalId, setSucursalId] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([
      proveedorRepository.list({ page: 1, pageSize: 100 }),
      sucursalRepository.list({ page: 1, pageSize: 100 }),
    ])
      .then(([proveedoresResult, sucursalesResult]) => {
        if (!active) return
        setProveedores(proveedoresResult.results)
        setSucursales(sucursalesResult.results)
      })
      .finally(() => { if (active) setOptionsLoading(false) })
    return () => { active = false }
  }, [])

  // ── Líneas ────────────────────────────────────────────────────────────────
  const [lineas, setLineas] = useState<CompraLineRow[]>([])

  const [motoOptions, setMotoOptions] = useState<MotoOption[]>([])
  const [motoInput, setMotoInput] = useState('')
  const [motoSelected, setMotoSelected] = useState<MotoOption | null>(null)
  const [motoLoading, setMotoLoading] = useState(false)
  const [cantidadInput, setCantidadInput] = useState('')
  const [precioCostoInput, setPrecioCostoInput] = useState('')
  const [lineError, setLineError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleMotoInputChange(value: string) {
    setMotoInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setMotoOptions([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setMotoLoading(true)
      try {
        setMotoOptions(await motoRepository.search(value))
      } finally {
        setMotoLoading(false)
      }
    }, MOTO_SEARCH_DEBOUNCE_MS)
  }

  function handleAddLinea() {
    const parsed = compraLineSchema.safeParse({
      moto: motoSelected?.id ?? 0,
      cantidad: cantidadInput,
      precio_costo: precioCostoInput,
    })
    if (!parsed.success) {
      setLineError(parsed.error.issues[0]?.message ?? 'Revisa los datos de la línea')
      return
    }
    setLineas((prev) => [...prev, {
      key: crypto.randomUUID(),
      moto: motoSelected as MotoOption,
      cantidad: parsed.data.cantidad,
      precioCosto: parsed.data.precio_costo,
    }])
    setMotoSelected(null)
    setMotoInput('')
    setMotoOptions([])
    setCantidadInput('')
    setPrecioCostoInput('')
    setLineError(null)
  }

  function handleRemoveLinea(key: string) {
    setLineas((prev) => prev.filter((l) => l.key !== key))
    setSavedLineKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const total = lineas.reduce((sum, l) => sum + l.cantidad * l.precioCosto, 0)

  // ── Guardado ──────────────────────────────────────────────────────────────
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [createdCompraId, setCreatedCompraId] = useState<number | null>(null)
  const [savedLineKeys, setSavedLineKeys] = useState<Set<string>>(new Set())

  async function handleGuardar() {
    const parsed = compraFormSchema.safeParse({
      proveedor: proveedorId,
      sucursal_destino: sucursalId,
      lineas: lineas.map((l) => ({ moto: l.moto.id, cantidad: l.cantidad, precio_costo: l.precioCosto })),
    })

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0])
        if (!nextErrors[key]) nextErrors[key] = issue.message
      }
      setFormErrors(nextErrors)
      return
    }
    setFormErrors({})
    setSaveError(null)
    setFailedKey(null)
    setIsSaving(true)

    try {
      let compraId = createdCompraId
      if (compraId === null) {
        const compra = await compraRepository.create({
          proveedor: parsed.data.proveedor,
          sucursal_destino: parsed.data.sucursal_destino,
          total: total.toFixed(2),
        })
        compraId = compra.id
        setCreatedCompraId(compraId)
      }

      for (const linea of lineas) {
        if (savedLineKeys.has(linea.key)) continue
        try {
          await detalleCompraRepository.create({
            compra: compraId,
            moto: linea.moto.id,
            cantidad: linea.cantidad,
            precio_costo: linea.precioCosto.toFixed(2),
          })
          setSavedLineKeys((prev) => new Set(prev).add(linea.key))
        } catch (err) {
          const apiErr = err as ApiException
          setFailedKey(linea.key)
          setSaveError(
            `La línea "${linea.moto.marca_nombre} ${linea.moto.modelo}" no se pudo guardar: ${apiErr.detail}. ` +
            'Quítala y agrégala de nuevo con datos corregidos, luego presiona "Guardar compra" otra vez — las demás líneas no se pierden.',
          )
          setIsSaving(false)
          return
        }
      }

      navigate(`/admin/compras/${compraId}`)
    } catch (err) {
      const apiErr = err as ApiException
      setSaveError(apiErr.detail ?? 'No se pudo crear la compra')
      setIsSaving(false)
    }
  }

  const headerLocked = createdCompraId !== null

  return (
    <CrudPageLayout title="Nueva Compra">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/compras')}
        sx={{ mb: 2, color: colors.textSecondary }}
      >
        Volver a Compras
      </Button>

      {saveError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {saveError}
        </Alert>
      )}

      {headerLocked && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          La compra #{createdCompraId} ya fue creada. Al volver a guardar solo se enviarán las líneas pendientes.
        </Alert>
      )}

      {/* ── Cabecera ── */}
      <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 2 }}>
          Datos de la compra
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
          <TextField
            select
            label="Proveedor"
            required
            disabled={optionsLoading || headerLocked}
            value={proveedorId}
            onChange={(e) => setProveedorId(Number(e.target.value))}
            error={Boolean(formErrors.proveedor)}
            helperText={formErrors.proveedor}
            sx={{ flex: 1, minWidth: 240 }}
          >
            <MenuItem value={0} disabled>
              {optionsLoading ? 'Cargando...' : 'Selecciona un proveedor'}
            </MenuItem>
            {proveedores.map((proveedor) => (
              <MenuItem key={proveedor.id} value={proveedor.id}>{proveedor.empresa}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sucursal destino"
            required
            disabled={optionsLoading || headerLocked}
            value={sucursalId}
            onChange={(e) => setSucursalId(Number(e.target.value))}
            error={Boolean(formErrors.sucursal_destino)}
            helperText={formErrors.sucursal_destino}
            sx={{ flex: 1, minWidth: 240 }}
          >
            <MenuItem value={0} disabled>
              {optionsLoading ? 'Cargando...' : 'Selecciona una sucursal'}
            </MenuItem>
            {sucursales.map((sucursal) => (
              <MenuItem key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* ── Líneas ── */}
      <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 2 }}>
          Líneas de compra
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
          <Autocomplete
            options={motoOptions}
            loading={motoLoading}
            filterOptions={(options) => options}
            getOptionLabel={(option) => `${option.marca_nombre} ${option.modelo} (${option.anio})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={motoSelected}
            inputValue={motoInput}
            onInputChange={(_, value) => handleMotoInputChange(value)}
            onChange={(_, value) => setMotoSelected(value)}
            noOptionsText={motoInput.trim() ? 'Sin resultados' : 'Escribe para buscar una moto'}
            sx={{ flex: 2, minWidth: 260 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Moto"
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    endAdornment: (
                      <>
                        {motoLoading ? <CircularProgress size={16} /> : null}
                        {params.slotProps.input.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />

          <TextField
            type="number"
            label="Cantidad"
            value={cantidadInput}
            onChange={(e) => setCantidadInput(e.target.value)}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            sx={{ width: 140 }}
          />

          <TextField
            type="number"
            label="Precio Costo"
            value={precioCostoInput}
            onChange={(e) => setPrecioCostoInput(e.target.value)}
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            sx={{ width: 160 }}
          />

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddLinea}
            disabled={!motoSelected}
            sx={{
              bgcolor: colors.primary,
              color: colors.textOnPrimary,
              fontWeight: 700,
              borderRadius: 3,
              height: 56,
              '&:hover': { bgcolor: colors.primaryDark },
              '&:disabled': { opacity: 0.6 },
            }}
          >
            Agregar
          </Button>
        </Box>

        {lineError && (
          <Typography variant="caption" sx={{ color: colors.error, display: 'block', mt: 1 }}>
            {lineError}
          </Typography>
        )}

        {formErrors.lineas && (
          <Typography variant="caption" sx={{ color: colors.error, display: 'block', mt: 1 }}>
            {formErrors.lineas}
          </Typography>
        )}

        <TableContainer sx={{ mt: 3, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background }}>
                <TableCell sx={{ fontWeight: 700, color: colors.textPrimary }}>Moto</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Cantidad</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Precio Costo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>Subtotal</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {lineas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', py: 3 }}>
                      Agrega al menos una línea
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                lineas.map((linea) => (
                  <TableRow
                    key={linea.key}
                    hover
                    sx={failedKey === linea.key ? { bgcolor: colors.accentLight } : undefined}
                  >
                    <TableCell>
                      {linea.moto.marca_nombre} {linea.moto.modelo} ({linea.moto.anio})
                      {failedKey === linea.key && (
                        <Chip label="Error al guardar" size="small" sx={{ ml: 1, bgcolor: colors.error, color: colors.textOnPrimary }} />
                      )}
                      {headerLocked && savedLineKeys.has(linea.key) && (
                        <Chip label="Guardada" size="small" sx={{ ml: 1, bgcolor: colors.success, color: colors.textOnPrimary }} />
                      )}
                    </TableCell>
                    <TableCell align="right">{linea.cantidad}</TableCell>
                    <TableCell align="right">{formatPrice(linea.precioCosto)}</TableCell>
                    <TableCell align="right">{formatPrice(linea.cantidad * linea.precioCosto)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveLinea(linea.key)}
                        disabled={savedLineKeys.has(linea.key)}
                        sx={{ color: colors.error }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: colors.accent }}>
            Total: {formatPrice(total)}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={() => navigate('/admin/compras')} disabled={isSaving} sx={{ color: colors.textSecondary }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          disabled={isSaving}
          sx={{
            bgcolor: colors.primary,
            color: colors.textOnPrimary,
            fontWeight: 700,
            borderRadius: 3,
            px: 4,
            '&:hover': { bgcolor: colors.primaryDark },
            '&:disabled': { opacity: 0.6 },
          }}
        >
          {isSaving ? <CircularProgress size={20} sx={{ color: colors.textOnPrimary }} /> : 'Guardar Compra'}
        </Button>
      </Box>
    </CrudPageLayout>
  )
}
