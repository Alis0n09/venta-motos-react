// src/presentation/pages/admin/AdminMarcasPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container, Button, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, Chip, Alert, Skeleton,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { marcaUseCase } from '@/infrastructure/factories/marca.factory'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { Marca } from '@/domain/entities/marca.entity'
import type { CrearMarcaDto } from '@/application/dtos/marca.dto'

const FORM_VACIO: CrearMarcaDto = { nombre: '', pais_origen: '', activa: true }

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Marca | null>(null)
  const [form, setForm] = useState<CrearMarcaDto>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setLoading(true)
    marcaUseCase.listar()
      .then(setMarcas)
      .catch(() => setError('No se pudieron cargar las marcas.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setFormError(null)
    setDialogOpen(true)
  }

  function abrirEditar(marca: Marca) {
    setEditando(marca)
    setForm({ nombre: marca.nombre, pais_origen: marca.pais_origen, activa: marca.activa })
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleGuardar() {
    setGuardando(true)
    setFormError(null)
    try {
      if (editando) {
        await marcaUseCase.actualizar(editando.id, form)
      } else {
        await marcaUseCase.crear(form)
      }
      setDialogOpen(false)
      cargar()
    } catch (err) {
      setFormError(parseApiError(err).detail)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(marca: Marca) {
    if (!confirm(`¿Eliminar la marca "${marca.nombre}"?`)) return
    try {
      await marcaUseCase.eliminar(marca.id)
      cargar()
    } catch (err) {
      setError(parseApiError(err).detail)
    }
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '70vh', py: 6 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            Gestión de Marcas
          </Typography>
          <Button
            variant="contained" startIcon={<Add />} onClick={abrirCrear}
            sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
          >
            Nueva marca
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Skeleton variant="rounded" height={300} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>País de origen</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marcas.map((marca) => (
                <TableRow key={marca.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{marca.nombre}</TableCell>
                  <TableCell>{marca.pais_origen || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={marca.activa ? 'Activa' : 'Inactiva'}
                      size="small"
                      sx={{
                        bgcolor: marca.activa ? `${colors.success}20` : `${colors.error}20`,
                        color: marca.activa ? colors.success : colors.error,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => abrirEditar(marca)}><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleEliminar(marca)} sx={{ color: colors.error }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {marcas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                    No hay marcas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{editando ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Nombre" fullWidth required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <TextField
              label="País de origen" fullWidth
              value={form.pais_origen ?? ''}
              onChange={(e) => setForm({ ...form, pais_origen: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.activa}
                  onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                />
              }
              label="Marca activa"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              variant="contained" disabled={guardando || !form.nombre.trim()}
              onClick={handleGuardar}
              sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}