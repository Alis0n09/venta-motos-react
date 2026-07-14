// src/presentation/pages/admin/AdminHistorialPrecioPage.tsx

import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Skeleton, Alert, TextField, MenuItem, Pagination,
  InputAdornment,
} from '@mui/material'
import { Search, TrendingDown, TrendingUp, TrendingFlat } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { historialPrecioUseCase } from '@/infrastructure/factories/historial-precio.factory'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import { formatPrice, formatDate } from '@/presentation/utils/formatters'
import type { HistorialPrecio } from '@/domain/entities/historial-precio.entity'
import type { Moto } from '@/domain/entities/moto.entity'

const PAGE_SIZE = 10

export default function AdminHistorialPrecioPage() {
  const [historial, setHistorial] = useState<HistorialPrecio[]>([])
  const [motos, setMotos] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [motoFilter, setMotoFilter] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<{ total: number } | null>(null)

  const fetchHistorial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await historialPrecioUseCase.getAll({
        page,
        page_size: PAGE_SIZE,
        moto: motoFilter || undefined,
      })
      setHistorial(result.results)
      setTotal(result.count)
    } catch {
      setError('No se pudo cargar el historial de precios.')
    } finally {
      setLoading(false)
    }
  }, [page, motoFilter])

  useEffect(() => { fetchHistorial() }, [fetchHistorial])

  useEffect(() => {
    motoUseCase.getMarcas()
    motoUseCase.getAll({ page_size: 200 }).then((res) => setMotos(res.results)).catch(() => {})
    historialPrecioUseCase.getStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [motoFilter])

  // Filtro local por nombre de moto o usuario
  const filtrados = search.trim()
    ? historial.filter((h) =>
        h.moto_nombre.toLowerCase().includes(search.toLowerCase()) ||
        h.usuario_nombre.toLowerCase().includes(search.toLowerCase())
      )
    : historial

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function tendencia(anterior: string, nuevo: string) {
    const diff = Number(nuevo) - Number(anterior)
    if (diff < 0) return { icon: <TrendingDown sx={{ fontSize: 16 }} />, color: colors.error, label: 'Bajó' }
    if (diff > 0) return { icon: <TrendingUp sx={{ fontSize: 16 }} />, color: colors.success, label: 'Subió' }
    return { icon: <TrendingFlat sx={{ fontSize: 16 }} />, color: colors.textSecondary, label: 'Sin cambio' }
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'block' }}>
            Admin
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
            Historial de Precios
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Registro de todos los cambios de precio en el catálogo
          </Typography>
        </Box>

        {/* ── Stat card ── */}
        {stats && (
        <Typography variant="body2" sx={{ color: colors.textPrimary, mb: 3 }}>
            {stats.total} cambio{stats.total !== 1 ? 's' : ''} de precio registrado{stats.total !== 1 ? 's' : ''}
        </Typography>
        )}

        {/* ── Filtros ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por moto o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select size="small" sx={{ minWidth: 200 }}
            value={motoFilter}
            onChange={(e) => setMotoFilter(e.target.value)}
            label="Filtrar por moto"
          >
            <MenuItem value="">Todas las motos</MenuItem>
            {motos.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                {m.marca_nombre} {m.modelo}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* ── Tabla ── */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background }}>
                <TableCell sx={{ fontWeight: 700 }}>Moto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Precio anterior</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Precio nuevo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Variación</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Modificado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: colors.textSecondary }}>
                      No hay registros de cambios de precio.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((h) => {
                  const t = tendencia(h.precio_anterior, h.precio_nuevo)
                  const diff = Number(h.precio_nuevo) - Number(h.precio_anterior)
                  return (
                    <TableRow key={h.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: colors.textPrimary }}>
                        {h.moto_nombre}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary, textDecoration: 'line-through' }}>
                        {formatPrice(Number(h.precio_anterior))}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: colors.textPrimary }}>
                        {formatPrice(Number(h.precio_nuevo))}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={t.icon}
                          label={`${diff > 0 ? '+' : ''}${formatPrice(diff)}`}
                          size="small"
                          sx={{
                            bgcolor: `${t.color}20`,
                            color: t.color,
                            fontWeight: 700,
                            '& .MuiChip-icon': { color: t.color },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {formatDate(h.fecha)}
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary }}>
                        {h.usuario_nombre}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Paginación ── */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600 },
                '& .Mui-selected': { bgcolor: `${colors.primary} !important`, color: '#fff' },
              }}
            />
          </Box>
        )}

      </Container>
    </Box>
  )
}