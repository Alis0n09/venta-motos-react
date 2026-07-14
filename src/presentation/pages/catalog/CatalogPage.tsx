// src/presentation/pages/catalog/CatalogPage.tsx

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  Chip, TextField, InputAdornment, Button, MenuItem,
  Select, FormControl, Pagination, Skeleton, Alert, IconButton,
  Snackbar,
} from '@mui/material'
import {
  Search, Add, TwoWheeler, FilterList,
  FavoriteBorder, Favorite, AddShoppingCart,
} from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'
import { formatPrice } from '@/presentation/utils/formatters'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import { motoUseCase } from '@/infrastructure/factories/moto.factory'
import { useCarritoStore } from '@/presentation/store/carrito.store'
import { useFavoritosStore } from '@/presentation/store/favoritos.store'
import type { Moto, Marca, Categoria } from '@/domain/entities/moto.entity'
import MotoFormModal from '@/presentation/components/motos/MotoFormModal'

// ─── Card de moto ─────────────────────────────────────────────────────────────

function MotoCard({ moto }: { moto: Moto }) {
  const user = useAuthStore((s) => s.user)
  const agregarItem = useCarritoStore((s) => s.agregarItem)
  const toggleFavorito = useFavoritosStore((s) => s.toggleFavorito)
  const esFavorito = useFavoritosStore((s) => s.esFavorito(moto.id))
  const [feedback, setFeedback] = useState(false)

  const stockLabel = moto.stock === 0 ? 'Agotado' : moto.stock <= 3 ? 'Pocas u.' : 'En stock'
  const stockColor = moto.stock === 0 ? colors.error : moto.stock <= 3 ? colors.warning : colors.success
  const sinStock = moto.stock <= 0

  function handleAgregar(e: React.MouseEvent) {
    e.preventDefault()
    agregarItem(moto, 1)
    setFeedback(true)
  }

  return (
    <>
      <Card sx={{
        borderRadius: 3, overflow: 'hidden', cursor: 'pointer', height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
      }}
        component={Link} to={`/catalogo/${moto.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <Box sx={{ position: 'relative', bgcolor: colors.border, height: 200 }}>
          {moto.imagen_url ? (
            <Box component="img" src={moto.imagen_url} alt={moto.modelo}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <TwoWheeler sx={{ fontSize: 48, color: colors.textSecondary, opacity: 0.3 }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary, opacity: 0.5 }}>
                {moto.marca_nombre} {moto.modelo}
              </Typography>
            </Box>
          )}

          {/* Favorito — solo clientes logueados */}
          {user && !user.is_staff && (
            <IconButton
              onClick={(e) => { e.preventDefault(); toggleFavorito(moto) }}
              sx={{
                position: 'absolute', top: 8, right: 8,
                bgcolor: 'rgba(255,255,255,0.9)', width: 32, height: 32,
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              {esFavorito
                ? <Favorite sx={{ fontSize: 18, color: colors.accent }} />
                : <FavoriteBorder sx={{ fontSize: 18, color: colors.textSecondary }} />
              }
            </IconButton>
          )}

          {/* Favorito adorno — visitantes sin login */}
          {!user && (
            <IconButton
              onClick={(e) => e.preventDefault()}
              sx={{
                position: 'absolute', top: 8, right: 8,
                bgcolor: 'rgba(255,255,255,0.9)', width: 32, height: 32,
                '&:hover': { bgcolor: '#fff' },
              }}
            >
              <FavoriteBorder sx={{ fontSize: 18, color: colors.textSecondary }} />
            </IconButton>
          )}

          {moto.estado === 'disponible' && moto.stock > 0 && moto.anio >= 2024 && (
            <Chip label="Nueva" size="small" sx={{
              position: 'absolute', top: 10, left: 10,
              bgcolor: colors.accent, color: '#fff', fontWeight: 700, fontSize: 11,
            }} />
          )}

          {moto.estado === 'reservada' && (
            <Chip label="Reservada" size="small" sx={{
              position: 'absolute', top: 10, left: 10,
              bgcolor: colors.warning, color: '#fff', fontWeight: 700, fontSize: 11,
            }} />
          )}
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
            {moto.categoria_nombre ?? moto.marca_nombre} · {moto.cilindraje} cc
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 1, fontSize: 16 }}>
            {moto.marca_nombre} {moto.modelo}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: user && !user.is_staff ? 1.5 : 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 20, color: colors.accent }}>
              {formatPrice(Number(moto.precio))}
            </Typography>
            <Chip label={stockLabel} size="small" sx={{
              bgcolor: `${stockColor}20`, color: stockColor, fontWeight: 600, fontSize: 11,
            }} />
          </Box>

          {/* Botón carrito — solo clientes logueados */}
          {user && !user.is_staff && (
            <Button
              fullWidth variant="contained"
              disabled={sinStock}
              startIcon={<AddShoppingCart />}
              onClick={handleAgregar}
              sx={{
                bgcolor: colors.accent, color: '#fff', fontWeight: 700,
                borderRadius: 2, py: 0.8,
                '&:hover': { bgcolor: '#e0265e' },
              }}
            >
              {sinStock ? 'Sin stock' : 'Agregar al carrito'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={feedback}
        autoHideDuration={2000}
        onClose={() => setFeedback(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {moto.modelo} agregada al carrito
        </Alert>
      </Snackbar>
    </>
  )
}

// ─── CatalogPage ──────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canCreate = isAdmin || isBodeguero

  const [motos, setMotos] = useState<Moto[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const [search, setSearch] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')
  const [precioFilter, setPrecioFilter] = useState('')
  const [disponibilidadFilter, setDisponibilidadFilter] = useState('')

  const PAGE_SIZE = 8

  const fetchMotos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await motoUseCase.getAll({
        page,
        page_size: PAGE_SIZE,
        search: search || undefined,
        marca: marcaFilter || undefined,
        categoria: categoriaFilter || undefined,
        estado: disponibilidadFilter || undefined,
        ordering: precioFilter === 'asc' ? 'precio' : precioFilter === 'desc' ? '-precio' : undefined,
      })
      setMotos(result.results)
      setTotal(result.count)
    } catch {
      setError('No se pudieron cargar las motos.')
    } finally {
      setLoading(false)
    }
  }, [page, search, marcaFilter, categoriaFilter, precioFilter, disponibilidadFilter])

  useEffect(() => { fetchMotos() }, [fetchMotos])

  useEffect(() => {
    motoUseCase.getMarcas().then(setMarcas).catch(() => {})
    motoUseCase.getCategorias().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [search, marcaFilter, categoriaFilter, precioFilter, disponibilidadFilter])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth={false} sx={{ maxWidth: 1300 }}>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
              Todas las motos
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
              {total} modelos disponibles
            </Typography>
          </Box>
          {canCreate && (
            <Button
              onClick={() => setModalOpen(true)}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: colors.primary, color: colors.textOnPrimary,
                fontWeight: 700, borderRadius: 3,
                border: `1.5px solid ${colors.accent}`,
                '&:hover': { bgcolor: colors.primaryDark },
              }}
            >
              Nueva moto
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

          <FormControl sx={{ minWidth: 130 }}>
            <Select value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)}
              displayEmpty renderValue={(v) => v ? marcas.find(m => String(m.id) === v)?.nombre : 'Marca'}>
              <MenuItem value="">Todas las marcas</MenuItem>
              {marcas.map((m) => <MenuItem key={m.id} value={String(m.id)}>{m.nombre}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 130 }}>
            <Select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)}
              displayEmpty renderValue={(v) => v ? categorias.find(c => String(c.id) === v)?.nombre : 'Tipo'}>
              <MenuItem value="">Todos los tipos</MenuItem>
              {categorias.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.nombre}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 130 }}>
            <Select value={precioFilter} onChange={(e) => setPrecioFilter(e.target.value)}
              displayEmpty renderValue={(v) => v === 'asc' ? 'Menor precio' : v === 'desc' ? 'Mayor precio' : 'Precio'}>
              <MenuItem value="">Sin ordenar</MenuItem>
              <MenuItem value="asc">Menor precio</MenuItem>
              <MenuItem value="desc">Mayor precio</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <Select value={disponibilidadFilter} onChange={(e) => setDisponibilidadFilter(e.target.value)}
              displayEmpty renderValue={(v) => v === 'disponible' ? 'Disponible' : v === 'reservada' ? 'Reservada' : v === 'vendida' ? 'Vendida' : 'Disponibilidad'}>
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="disponible">Disponible</MenuItem>
              <MenuItem value="reservada">Reservada</MenuItem>
              <MenuItem value="vendida">Vendida</MenuItem>
            </Select>
          </FormControl>

          {(search || marcaFilter || categoriaFilter || precioFilter || disponibilidadFilter) && (
            <Button startIcon={<FilterList />}
              onClick={() => { setSearch(''); setMarcaFilter(''); setCategoriaFilter(''); setPrecioFilter(''); setDisponibilidadFilter('') }}
              sx={{ color: colors.accent, fontWeight: 600 }}>
              Limpiar
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {loading ? (
            [1,2,3,4,5,6,7,8].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
          ) : motos.length > 0 ? (
            motos.map((moto) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={moto.id}>
                <MotoCard moto={moto} />
              </Grid>
            ))
          ) : (
            <Grid size={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TwoWheeler sx={{ fontSize: 64, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
                <Typography sx={{ textAlign: 'center', color: colors.textSecondary }}>
                  No se encontraron motos con esos filtros
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)}
              sx={{
                '& .MuiPaginationItem-root': { fontWeight: 600 },
                '& .Mui-selected': { bgcolor: `${colors.primary} !important`, color: '#fff' },
              }}
            />
          </Box>
        )}

        <MotoFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchMotos}
        />

      </Container>
    </Box>
  )
}