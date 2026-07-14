// src/presentation/pages/admin/AdminDashboardPage.tsx

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Container, Grid, Card, CardContent,
  CardActionArea, Chip, Skeleton, Alert, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, InputAdornment, List, ListItemText, ListItemButton,
} from '@mui/material'
import {
  TwoWheeler, LocalOfferOutlined, CategoryOutlined, Inventory2Outlined,
  ReceiptLongOutlined, AccountBalanceOutlined, PeopleAltOutlined,
  Shield, TrendingUp, Search,
} from '@mui/icons-material'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { colors } from '@/presentation/theme/colors'
import { useAuthStore } from '@/presentation/store/auth.store'
import { apiClient } from '@/infrastructure/http/axios-client'
import { dashboardUseCase } from '@/infrastructure/factories/dashboard.factory'
import { formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import type { DashboardStats } from '@/domain/entities/dashboard.entity'

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, loading }: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  loading: boolean
}) {
  return (
    <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
          </Typography>
          <Avatar sx={{ bgcolor: `${color}20`, width: 36, height: 36 }}>
            <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          </Avatar>
        </Box>
        {loading
          ? <Skeleton variant="text" width={80} height={48} />
          : <Typography variant="h3" sx={{ fontWeight: 800, color: colors.textPrimary }}>{value}</Typography>
        }
      </CardContent>
    </Card>
  )
}

// ─── Secciones ────────────────────────────────────────────────────────────────

const SECCIONES = [
  { title: 'Motos', description: 'Crear, editar y dar de baja motos del catálogo.', icon: <TwoWheeler />, path: '/catalogo', disponible: true },
  { title: 'Marcas', description: 'Gestionar las marcas disponibles.', icon: <LocalOfferOutlined />, path: '/admin/marcas', disponible: true },
  { title: 'Categorías', description: 'Gestionar las categorías de motos.', icon: <CategoryOutlined />, path: '/admin/categorias', disponible: true },
  { title: 'Inventario', description: 'Ver y ajustar el stock por sucursal.', icon: <Inventory2Outlined />, path: '/admin/inventario', disponible: true },
  { title: 'Ventas', description: 'Ver todas las ventas y asignar vendedor.', icon: <ReceiptLongOutlined />, path: '/admin/ventas', disponible: true, excludeRoles: ['bodeguero'] },
  { title: 'Financiamientos', description: 'Gestionar financiamientos y cuotas.', icon: <AccountBalanceOutlined />, path: '/admin/financiamientos', disponible: true },
  { title: 'Garantías', description: 'Gestionar garantías de motos vendidas.', icon: <Shield />, path: '/admin/garantias', disponible: true },
  { title: 'Historial de precios', description: 'Ver todos los cambios de precio en el catálogo.', icon: <TrendingUp />, path: '/admin/historial-precios', disponible: true },
]

// ─── AdminDashboardPage ───────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{ motos: any[], clientes: any[] } | null>(null)

  useEffect(() => {
    dashboardUseCase.getStats()
      .then(setStats)
      .catch(() => setError('No se pudieron cargar las estadísticas.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Buscador con debounce ──
  useEffect(() => {
    if (!search.trim()) { setSearchResults(null); return }
    const timer = setTimeout(async () => {
      try {
        const [motosRes, clientesRes] = await Promise.all([
          apiClient.get(`/motos/?search=${search}&page_size=5`),
          apiClient.get(`/clientes/?search=${search}&page_size=5`),
        ])
        const motos = Array.isArray(motosRes.data) ? motosRes.data : motosRes.data.results ?? []
        const clientes = Array.isArray(clientesRes.data) ? clientesRes.data : clientesRes.data.results ?? []
        setSearchResults({ motos, clientes })
      } catch {
        setSearchResults(null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const rolLabel = user?.rol === 'vendedor' ? 'Vendedor' : user?.rol === 'bodeguero' ? 'Bodega' : 'Administración'

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', display: 'block' }}>
              Panel de {rolLabel}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: colors.textPrimary }}>
              Hola, {user?.username} 👋
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Resumen general del sistema
            </Typography>
          </Box>

          {/* ── Buscador funcional ── */}
          <Box sx={{ position: 'relative', minWidth: 280 }}>
            <TextField
              placeholder="Buscar moto o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              fullWidth
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
            {search && searchResults && (
              <Paper sx={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                borderRadius: 2, border: `1px solid ${colors.border}`, mt: 0.5,
                maxHeight: 300, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}>
                {searchResults.motos.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                      Motos
                    </Typography>
                    <List dense disablePadding>
                      {searchResults.motos.map((m: any) => (
                        <ListItemButton key={m.id} onClick={() => { navigate(`/catalogo/${m.id}`); setSearch('') }}>
                          <TwoWheeler sx={{ fontSize: 16, color: colors.accent, mr: 1.5 }} />
                          <ListItemText primary={`${m.marca_nombre} ${m.modelo}`} secondary={formatPrice(Number(m.precio))} />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                )}
                {searchResults.clientes.length > 0 && (
                  <>
                    <Typography variant="caption" sx={{ px: 2, pt: 1, pb: 0.5, display: 'block', color: colors.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                      Clientes
                    </Typography>
                    <List dense disablePadding>
                      {searchResults.clientes.map((c: any) => (
                        <ListItemButton key={c.id} onClick={() => { navigate(`/admin/ventas?cliente=${c.id}`); setSearch('') }}>
                          <PeopleAltOutlined sx={{ fontSize: 16, color: colors.accent, mr: 1.5 }} />
                          <ListItemText primary={`${c.nombre} ${c.apellido}`} secondary={c.correo} />
                        </ListItemButton>
                      ))}
                    </List>
                  </>
                )}
                {searchResults.motos.length === 0 && searchResults.clientes.length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, color: colors.textSecondary }}>
                    Sin resultados para "{search}"
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* ── Stat Cards ── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Total ventas" value={stats?.totalVentas ?? 0} icon={<ReceiptLongOutlined />} color={colors.accent} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Motos en catálogo" value={stats?.totalMotos ?? 0} icon={<TwoWheeler />} color={colors.primary} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Clientes registrados" value={stats?.totalClientes ?? 0} icon={<PeopleAltOutlined />} color={colors.success} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Garantías activas" value={stats?.totalGarantias ?? 0} icon={<Shield />} color={colors.warning} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Financiamientos activos" value={stats?.financiamientosActivos ?? 0} icon={<AccountBalanceOutlined />} color={colors.success} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard label="Total financiamientos" value={stats?.totalFinanciamientos ?? 0} icon={<TrendingUp />} color={colors.accent} loading={loading} />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, p: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 3 }}>
                Ventas últimos 6 meses
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={200} />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.ventasPorMes ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: colors.textSecondary }} />
                    <YAxis tick={{ fontSize: 12, fill: colors.textSecondary }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    <Bar dataKey="total" fill={colors.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, p: 3, height: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
                Stock bajo ⚠
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={180} />
              ) : stats?.stockBajo.length === 0 ? (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No hay motos con stock bajo.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {stats?.stockBajo.map((m) => (
                    <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TwoWheeler sx={{ fontSize: 16, color: colors.textSecondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.textPrimary }}>
                          {m.marca} {m.modelo}
                        </Typography>
                      </Box>
                      <Chip
                        label={m.stock === 0 ? 'Sin stock' : `${m.stock} u.`}
                        size="small"
                        sx={{
                          bgcolor: m.stock === 0 ? `${colors.error}20` : `${colors.warning}20`,
                          color: m.stock === 0 ? colors.error : colors.warning,
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ borderRadius: 3, border: `1px solid ${colors.border}`, mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
              Últimas ventas
            </Typography>
            {loading ? (
              <Skeleton variant="rounded" height={150} />
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Método</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats?.ultimasVentas.map((v) => (
                      <TableRow key={v.id} hover>
                        <TableCell>#{v.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{v.cliente_nombre ?? 'Sin cliente'}</TableCell>
                        <TableCell>{formatDateShort(v.fecha_venta)}</TableCell>
                        <TableCell>
                          <Chip label={v.metodo_pago} size="small" sx={{ bgcolor: colors.accentLight, color: colors.accent, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: colors.accent }}>{formatPrice(Number(v.total))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Typography variant="body1" sx={{ fontWeight: 700, color: colors.textPrimary, mb: 2 }}>
          Módulos del sistema
        </Typography>
        <Grid container spacing={3}>
          {SECCIONES
            .filter((s) => !s.excludeRoles?.includes(user?.rol as 'vendedor' | 'bodeguero' | 'admin'))
            .map((seccion) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={seccion.path}>
                {seccion.disponible ? (
                  <CardActionArea component={Link} to={seccion.path} sx={{ borderRadius: 3, height: '100%' }}>
                    <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-3px)' } }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent, mb: 1.5 }}>
                          {seccion.icon}
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>{seccion.title}</Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>{seccion.description}</Typography>
                      </CardContent>
                    </Card>
                  </CardActionArea>
                ) : (
                  <Card sx={{ borderRadius: 3, height: '100%', opacity: 0.6 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
                          {seccion.icon}
                        </Box>
                        <Chip label="Próximamente" size="small" sx={{ bgcolor: colors.border, color: colors.textSecondary, fontWeight: 600 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: colors.textPrimary, mb: 0.5 }}>{seccion.title}</Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>{seccion.description}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            ))}
        </Grid>

      </Container>
    </Box>
  )
}