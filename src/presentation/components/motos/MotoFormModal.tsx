// src/presentation/components/motos/MotoFormModal.tsx

import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, Alert, IconButton, Typography,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import type { Moto, Marca, Categoria } from '@/domain/entities/moto.entity'

interface MotoFormModalProps {
  open: boolean
  onClose: () => void
  moto?: Moto | null  // si viene moto = editar, si no = crear
  onSuccess: () => void
}

interface FormState {
  marca: string
  categoria: string
  modelo: string
  anio: string
  color: string
  precio: string
  cilindraje: string
  estado: string
  imagen_url: string
}

const EMPTY_FORM: FormState = {
  marca: '',
  categoria: '',
  modelo: '',
  anio: String(new Date().getFullYear()),
  color: '',
  precio: '',
  cilindraje: '',
  estado: 'disponible',
  imagen_url: '',
}

export default function MotoFormModal({ open, onClose, moto, onSuccess }: MotoFormModalProps) {
  const isEditing = !!moto

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar marcas y categorías
  useEffect(() => {
    motoUseCase.getMarcas().then(setMarcas).catch(() => {})
    motoUseCase.getCategorias().then(setCategorias).catch(() => {})
  }, [])

  // Precargar datos si es edición
  useEffect(() => {
    if (moto) {
      setForm({
        marca: String(moto.marca),
        categoria: moto.categoria ? String(moto.categoria) : '',
        modelo: moto.modelo,
        anio: String(moto.anio),
        color: moto.color,
        precio: moto.precio,
        cilindraje: String(moto.cilindraje),
        estado: moto.estado,
        imagen_url: moto.imagen_url ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
  }, [moto, open])

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value as string }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const dto = {
        marca: Number(form.marca),
        categoria: form.categoria ? Number(form.categoria) : null,
        modelo: form.modelo,
        anio: Number(form.anio),
        color: form.color,
        precio: Number(form.precio),
        cilindraje: Number(form.cilindraje),
        estado: form.estado as 'disponible' | 'vendida' | 'reservada',
        imagen_url: form.imagen_url || null,
      }

      if (isEditing && moto) {
        await motoUseCase.update(moto.id, dto)
      } else {
        await motoUseCase.create(dto)
      }

      onSuccess()
      onClose()
    } catch (err) {
      const apiErr = err as { detail?: string; fieldErrors?: Record<string, string[]> }
      if (apiErr.fieldErrors && Object.keys(apiErr.fieldErrors).length > 0) {
        const messages = Object.entries(apiErr.fieldErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join(' | ')
        setError(messages)
      } else {
        setError(apiErr.detail ?? 'Error al guardar la moto')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = form.marca && form.modelo && form.anio && form.color && form.precio && form.cilindraje

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.textPrimary }}>
          {isEditing ? 'Editar moto' : 'Nueva moto'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} component="form" id="moto-form" onSubmit={handleSubmit}>

          <Grid size={6}>
            <FormControl fullWidth required>
              <InputLabel>Marca</InputLabel>
              <Select
                value={form.marca}
                label="Marca"
                onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))}
              >
                {marcas.map((m) => (
                  <MenuItem key={m.id} value={String(m.id)}>{m.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={form.categoria}
                label="Categoría"
                onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
              >
                <MenuItem value="">Sin categoría</MenuItem>
                {categorias.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth required
              label="Modelo"
              placeholder="MT-03"
              value={form.modelo}
              onChange={handleChange('modelo')}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth required
              label="Año"
              type="number"
              value={form.anio}
              onChange={handleChange('anio')}
              slotProps={{ htmlInput: { min: 1990, max: 2030 } }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth required
              label="Cilindraje (cc)"
              type="number"
              value={form.cilindraje}
              onChange={handleChange('cilindraje')}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth required
              label="Color"
              placeholder="Negro mate"
              value={form.color}
              onChange={handleChange('color')}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth required
              label="Precio (USD)"
              type="number"
              value={form.precio}
              onChange={handleChange('precio')}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
          </Grid>

          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={form.estado}
                label="Estado"
                onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
              >
                <MenuItem value="disponible">Disponible</MenuItem>
                <MenuItem value="reservada">Reservada</MenuItem>
                <MenuItem value="vendida">Vendida</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="URL de imagen"
              placeholder="https://..."
              value={form.imagen_url}
              onChange={handleChange('imagen_url')}
            />
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: colors.textSecondary, fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          type="submit"
          form="moto-form"
          variant="contained"
          disabled={isLoading || !isValid}
          sx={{
            bgcolor: colors.primary, color: colors.textOnPrimary,
            fontWeight: 700, borderRadius: 3,
            border: `1.5px solid ${colors.accent}`,
            '&:hover': { bgcolor: colors.primaryDark },
            '&:disabled': { opacity: 0.6 },
          }}
        >
          {isLoading
            ? <CircularProgress size={20} sx={{ color: colors.textOnPrimary }} />
            : isEditing ? 'Guardar cambios' : 'Crear moto'
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}