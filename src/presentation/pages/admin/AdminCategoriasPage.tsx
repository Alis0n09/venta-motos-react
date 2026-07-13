// src/presentation/pages/admin/AdminCategoriasPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container, Button, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Skeleton,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { categoriaUseCase } from '@/infrastructure/factories/categoria.factory'
import { parseApiError } from '@/infrastructure/http/parse-api-error'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { CrearCategoriaDto } from '@/application/dtos/categoria.dto'

const FORM_VACIO: CrearCategoriaDto = { nombre: '', descripcion: '' }

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [form, setForm] = useState<CrearCategoriaDto>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setLoading(true)
    categoriaUseCase.listar()
      .then(setCategorias)
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setFormError(null)
    setDialogOpen(true)
  }

  function abrirEditar(categoria: Categoria) {
    setEditando(categoria)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion })
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleGuardar() {
    setGuardando(true)
    setFormError(null)
    try {
      if (editando) {
        await categoriaUseCase.actualizar(editando.id, form)
      } else {
        await categoriaUseCase.crear(form)
      }
      setDialogOpen(false)
      cargar()
    } catch (err) {
      setFormError(parseApiError(err).detail)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(categoria: Categoria) {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return
    try {
      await categoriaUseCase.eliminar(categoria.id)
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
            Gestión de Categorías
          </Typography>
          <Button
            variant="contained" startIcon={<Add />} onClick={abrirCrear}
            sx={{ bgcolor: colors.accent, '&:hover': { bgcolor: '#e0265e' } }}
          >
            Nueva categoría
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
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{categoria.nombre}</TableCell>
                  <TableCell>{categoria.descripcion || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => abrirEditar(categoria)}><Edit fontSize="small" /></IconButton>
                    <IconButton onClick={() => handleEliminar(categoria)} sx={{ color: colors.error }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categorias.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ textAlign: 'center', color: colors.textSecondary }}>
                    No hay categorías registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{editando ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Nombre" fullWidth required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <TextField
              label="Descripción" fullWidth multiline minRows={2}
              value={form.descripcion ?? ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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