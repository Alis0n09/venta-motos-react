// src/presentation/pages/admin/logs-actividad/LogsActividadPage.tsx

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, InputAdornment, Chip, Avatar,
  Divider, Popover, Button, TablePagination, Skeleton,
} from '@mui/material'
import { Search, EditNote, ExpandMore, DateRange, Close, Inbox, ArrowForward } from '@mui/icons-material'
import { logActividadRepository } from '@/infrastructure/factories/log-actividad.factory'
import type { LogActividad } from '@/domain/entities/log-actividad.entity'
import { ApiException } from '@/domain/exceptions/api.exception'
import { colors } from '@/presentation/theme/colors'
import { formatDateTime } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 400

// Valores conocidos leídos del backend (moto/mixins.py, moto/views/*.py,
// moto/serializers/auth.py y venta.py), usados como semilla inicial de los
// selects — ver resumen para más detalle de por qué.
const KNOWN_ENTIDADES = ['Cliente', 'Financiamiento', 'Inventario', 'Moto', 'Staff', 'Usuario', 'Venta']
const KNOWN_ACCIONES = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN']

// Campos técnicos que no aportan nada al mostrarlos en el diff antes/después.
const CAMPOS_IGNORADOS = new Set(['id'])

// ─── Colores por acción (paleta de colors.ts; sin azul disponible, UPDATE y
// LOGIN comparten el accent como el "tercer color" distintivo) ────────────────
function accionColor(accion: string): string {
  const normalizado = accion.toUpperCase()
  if (normalizado === 'CREATE') return colors.success
  if (normalizado === 'DELETE') return colors.error
  if (normalizado === 'UPDATE' || normalizado === 'LOGIN') return colors.accent
  return colors.textSecondary
}

// ─── Diff campo a campo (sin JSON crudo) ──────────────────────────────────────

interface DiffRow {
  campo: string
  antes: string
  despues: string
}

function campoLabel(campo: string): string {
  return campo.replace(/_/g, ' ').toUpperCase()
}

function formatValor(valor: unknown): string {
  if (valor === null || valor === undefined) return '(vacío)'
  if (typeof valor === 'string') return valor === '' ? '(vacío)' : valor
  if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor)
  if (Array.isArray(valor)) {
    if (valor.length === 0) return '(vacío)'
    if (valor.every((v) => ['string', 'number', 'boolean'].includes(typeof v))) return valor.join(', ')
    return `${valor.length} elemento${valor.length === 1 ? '' : 's'}`
  }
  if (typeof valor === 'object') {
    const obj = valor as Record<string, unknown>
    for (const key of ['nombre', 'descripcion', 'detalle']) {
      const legible = obj[key]
      if (typeof legible === 'string' && legible) return legible
    }
    const total = Object.keys(obj).length
    return `${total} campo${total === 1 ? '' : 's'}`
  }
  return String(valor)
}

function valoresIguales(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  return false
}

function computeDiffRows(
  antes: Record<string, unknown> | null,
  despues: Record<string, unknown> | null,
): DiffRow[] {
  if (antes === null && despues === null) return []

  const campos = new Set<string>([
    ...(antes ? Object.keys(antes) : []),
    ...(despues ? Object.keys(despues) : []),
  ])
  for (const campo of CAMPOS_IGNORADOS) campos.delete(campo)

  const rows: DiffRow[] = []
  for (const campo of campos) {
    const tieneAntes = antes !== null && campo in antes
    const tieneDespues = despues !== null && campo in despues
    const valorAntes = antes?.[campo]
    const valorDespues = despues?.[campo]

    if (tieneAntes && tieneDespues) {
      if (valoresIguales(valorAntes, valorDespues)) continue
      rows.push({ campo, antes: formatValor(valorAntes), despues: formatValor(valorDespues) })
    } else if (tieneDespues) {
      rows.push({ campo, antes: '(vacío)', despues: formatValor(valorDespues) })
    } else if (tieneAntes) {
      rows.push({ campo, antes: formatValor(valorAntes), despues: '(vacío)' })
    }
  }
  return rows
}

function FieldDiffRow({ row }: { row: DiffRow }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1.5, py: 0.75 }}>
      <Typography variant="caption" sx={{ width: 170, flexShrink: 0, color: colors.textSecondary, fontWeight: 700 }}>
        {campoLabel(row.campo)}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, textDecoration: 'line-through' }}>
          {row.antes}
        </Typography>
        <ArrowForward sx={{ fontSize: 14, color: colors.textSecondary }} />
        <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 700 }}>
          {row.despues}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Tarjeta de log ────────────────────────────────────────────────────────────

function LogCard({ log }: { log: LogActividad }) {
  const [expanded, setExpanded] = useState(false)
  const diffRows = useMemo(() => computeDiffRows(log.datos_antes, log.datos_despues), [log])
  const hasDetail = diffRows.length > 0
  const color = accionColor(log.accion)

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, overflow: 'hidden' }}>
      <Box
        onClick={() => hasDetail && setExpanded((prev) => !prev)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2, p: 2,
          cursor: hasDetail ? 'pointer' : 'default',
        }}
      >
        <Avatar sx={{ bgcolor: `${color}26`, color, width: 40, height: 40, flexShrink: 0 }}>
          <EditNote />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: colors.textPrimary }}>
            {log.entidad}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {formatDateTime(log.fecha)} · {log.usuario ? `Usuario #${log.usuario}` : 'Usuario del sistema'}
          </Typography>
        </Box>

        <Chip
          label={log.accion.toUpperCase()}
          size="small"
          sx={{ bgcolor: color, color: colors.textOnPrimary, fontWeight: 700, letterSpacing: 0.4, flexShrink: 0 }}
        />

        <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          {hasDetail && (
            <ExpandMore
              sx={{
                color: colors.textSecondary,
                transition: 'transform 0.2s',
                transform: expanded ? 'rotate(180deg)' : 'none',
              }}
            />
          )}
        </Box>
      </Box>

      {expanded && hasDetail && (
        <>
          <Divider />
          <Box sx={{ p: 2.5, pt: 2 }}>
            {diffRows.map((row) => (
              <FieldDiffRow key={row.campo} row={row} />
            ))}
          </Box>
        </>
      )}
    </Paper>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────

export default function LogsActividadPage() {
  const [data, setData] = useState<LogActividad[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [entidad, setEntidad] = useState('')
  const [accion, setAccion] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Semillas conocidas + lo que se va viendo en pantalla (ver resumen).
  const [entidadOptions, setEntidadOptions] = useState<string[]>(KNOWN_ENTIDADES)
  const [accionOptions, setAccionOptions] = useState<string[]>(KNOWN_ACCIONES)

  const requestId = useRef(0)

  useEffect(() => {
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    logActividadRepository.list({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      entidad: entidad || undefined,
      accion: accion || undefined,
      fechaDesde: fechaDesde || undefined,
      // Inclusivo del día completo: sin hora, "hasta" excluiría el propio día.
      fechaHasta: fechaHasta ? `${fechaHasta}T23:59:59` : undefined,
    })
      .then((result) => {
        if (id !== requestId.current) return
        setData(result.results)
        setCount(result.count)

        setEntidadOptions((prev) => {
          const next = new Set(prev)
          let changed = false
          for (const log of result.results) {
            if (!next.has(log.entidad)) { next.add(log.entidad); changed = true }
          }
          return changed ? [...next].sort() : prev
        })
        setAccionOptions((prev) => {
          const next = new Set(prev)
          let changed = false
          for (const log of result.results) {
            if (!next.has(log.accion)) { next.add(log.accion); changed = true }
          }
          return changed ? [...next].sort() : prev
        })
      })
      .catch((err) => {
        if (id !== requestId.current) return
        const apiErr = err as ApiException
        setError(apiErr.detail ?? 'Error al cargar los logs')
      })
      .finally(() => {
        if (id === requestId.current) setIsLoading(false)
      })
  }, [page, search, entidad, accion, fechaDesde, fechaHasta])

  function handleSearchInputChange(value: string) {
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setPage(1)
      setSearch(value)
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  function updateEntidad(value: string) {
    setPage(1)
    setEntidad(value)
  }

  function updateAccion(value: string) {
    setPage(1)
    setAccion(value)
  }

  // ── Rango de fechas (chip + popover, sin librería de date-range-picker) ──
  const [datesAnchor, setDatesAnchor] = useState<HTMLElement | null>(null)
  const [draftDesde, setDraftDesde] = useState('')
  const [draftHasta, setDraftHasta] = useState('')
  const hasDateRange = Boolean(fechaDesde && fechaHasta)

  function openDatesPopover(e: React.MouseEvent<HTMLElement>) {
    setDraftDesde(fechaDesde)
    setDraftHasta(fechaHasta)
    setDatesAnchor(e.currentTarget)
  }

  function applyDates() {
    setPage(1)
    setFechaDesde(draftDesde)
    setFechaHasta(draftHasta)
    setDatesAnchor(null)
  }

  function clearDates(e?: React.MouseEvent) {
    e?.stopPropagation()
    setPage(1)
    setFechaDesde('')
    setFechaHasta('')
    setDatesAnchor(null)
  }

  function formatShortDate(iso: string): string {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  const dateRangeLabel = hasDateRange
    ? `${formatShortDate(fechaDesde)} - ${formatShortDate(fechaHasta)}`
    : 'Rango de fechas'

  return (
    <CrudPageLayout title="Auditoría" canWrite={false}>
      {/* ── Buscador ── */}
      <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, p: 2, mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar en los logs..."
          value={searchInput}
          onChange={(e) => handleSearchInputChange(e.target.value)}
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
      </Paper>

      {/* ── Filtros ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <TextField
          select
          label="Entidad"
          value={entidad}
          onChange={(e) => updateEntidad(e.target.value)}
          sx={{ flex: 1, minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {entidadOptions.map((e) => (
            <MenuItem key={e} value={e}>{e}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Acción"
          value={accion}
          onChange={(e) => updateAccion(e.target.value)}
          sx={{ flex: 1, minWidth: 180 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {accionOptions.map((a) => (
            <MenuItem key={a} value={a}>{a}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ mb: 2.5 }}>
        <Chip
          icon={<DateRange sx={{ fontSize: 18, color: hasDateRange ? colors.accent : colors.textSecondary }} />}
          label={dateRangeLabel}
          onClick={openDatesPopover}
          onDelete={hasDateRange ? clearDates : undefined}
          deleteIcon={<Close sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: hasDateRange ? colors.accentLight : colors.surface,
            border: `1px solid ${hasDateRange ? colors.accent : colors.border}`,
            color: hasDateRange ? colors.accent : colors.textPrimary,
            fontWeight: 600,
            py: 2.5,
          }}
        />

        <Popover
          open={Boolean(datesAnchor)}
          anchorEl={datesAnchor}
          onClose={() => setDatesAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, width: 280 }}>
            <TextField
              type="date"
              label="Desde"
              value={draftDesde}
              onChange={(e) => setDraftDesde(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              type="date"
              label="Hasta"
              value={draftHasta}
              onChange={(e) => setDraftHasta(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setDatesAnchor(null)} sx={{ color: colors.textSecondary }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={applyDates}
                disabled={!draftDesde || !draftHasta}
                sx={{
                  bgcolor: colors.primary,
                  color: colors.textOnPrimary,
                  borderRadius: 3,
                  '&:hover': { bgcolor: colors.primaryDark },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>

      {error && (
        <Typography variant="body2" sx={{ color: colors.error, mb: 2 }}>{error}</Typography>
      )}

      <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1.5 }}>
        {count} resultado{count === 1 ? '' : 's'}
      </Typography>

      {/* ── Lista de tarjetas ── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
          ))
        ) : data.length === 0 ? (
          <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, py: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Inbox sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.5 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                No hay logs registrados
              </Typography>
            </Box>
          </Paper>
        ) : (
          data.map((log) => <LogCard key={log.id} log={log} />)
        )}
      </Box>

      {count > PAGE_SIZE && (
        <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, mt: 2.5 }}>
          <TablePagination
            component="div"
            count={count}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} de ${total}`}
          />
        </Paper>
      )}
    </CrudPageLayout>
  )
}
