// src/presentation/pages/catalog/RepuestosPage.tsx

import { useEffect, useRef, useState } from 'react'
import {
  Box, Container, Typography, TextField, InputAdornment,
  Grid, Card, CardContent, Chip, Skeleton, Button, CircularProgress,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { repuestoRepository } from '@/infrastructure/factories/repuesto.factory'
import type { Repuesto } from '@/domain/entities/repuesto.entity'
import { colors } from '@/presentation/theme/colors'
import { formatPrice } from '@/presentation/utils/formatters'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 400

function RepuestoCard({ repuesto }: { repuesto: Repuesto }) {
  const disponible = repuesto.stock > 0

  return (
    <Card sx={{
      borderRadius: 3, overflow: 'hidden', height: '100%',
      transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' },
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
          {repuesto.marca_compatible_nombre ?? 'Compatible con varias marcas'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1 }}>
          {repuesto.nombre}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: colors.accent }}>
            {formatPrice(Number(repuesto.precio))}
          </Typography>
          <Chip
            label={disponible ? 'Disponible' : 'Agotado'}
            size="small"
            sx={{
              bgcolor: disponible ? `${colors.success}20` : `${colors.error}20`,
              color: disponible ? colors.success : colors.error,
              fontWeight: 600, fontSize: 11,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default function RepuestosPage() {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const id = ++requestId.current
    setLoading(true)
    repuestoRepository.list({ page: 1, pageSize: PAGE_SIZE, search: search || undefined })
      .then((result) => {
        if (id !== requestId.current) return
        setRepuestos(result.results)
        setCount(result.count)
        setPage(1)
      })
      .catch(() => {
        if (id !== requestId.current) return
        setRepuestos([])
        setCount(0)
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false)
      })
  }, [search])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(value), SEARCH_DEBOUNCE_MS)
  }

  async function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const result = await repuestoRepository.list({ page: nextPage, pageSize: PAGE_SIZE, search: search || undefined })
      setRepuestos((prev) => [...prev, ...result.results])
      setPage(nextPage)
    } catch {
      // Silencioso: el botón "Cargar más" sigue disponible para reintentar.
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = repuestos.length < count

  return (
    <Box sx={{ bgcolor: colors.background, py: 8, minHeight: '70vh' }}>
      <Container maxWidth="lg">
        <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          Catálogo
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary, mb: 4 }}>
          Repuestos
        </Typography>

        <Box sx={{ maxWidth: 480, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar repuestos..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{ bgcolor: colors.surface, borderRadius: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: colors.textSecondary, fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))
          ) : repuestos.length > 0 ? (
            repuestos.map((repuesto) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={repuesto.id}>
                <RepuestoCard repuesto={repuesto} />
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Typography sx={{ textAlign: 'center', color: colors.textSecondary, py: 6 }}>
                No se encontraron repuestos.
              </Typography>
            </Grid>
          )}
        </Grid>

        {!loading && hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              variant="outlined"
              sx={{
                px: 4, py: 1.2,
                color: colors.textPrimary,
                borderColor: colors.border,
                fontWeight: 700,
                borderRadius: 3,
                '&:hover': { borderColor: colors.accent, color: colors.accent },
              }}
            >
              {loadingMore ? <CircularProgress size={20} /> : 'Cargar más'}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}
