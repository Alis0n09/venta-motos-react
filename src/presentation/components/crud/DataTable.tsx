// src/presentation/components/crud/DataTable.tsx

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, InputAdornment, IconButton, Skeleton, TablePagination, Typography,
} from '@mui/material'
import { Search, Edit, Delete, Inbox, Visibility } from '@mui/icons-material'
import { colors } from '@/presentation/theme/colors'

const SEARCH_DEBOUNCE_MS = 400

export interface DataTableColumn<TRow> {
  field: string
  headerName: string
  render?: (row: TRow) => ReactNode
  align?: 'left' | 'center' | 'right'
  width?: number | string
}

interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[]
  rows: TRow[]
  getRowId: (row: TRow) => string | number
  loading?: boolean
  /** Total de resultados en el backend (para la paginación). */
  count: number
  /** Página actual, 1-based. */
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (search: string) => void
  /** Solo se muestran acciones de editar/eliminar si es true. */
  canWrite?: boolean
  onEdit?: (row: TRow) => void
  onDelete?: (row: TRow) => void
  /** Acción de solo lectura (p. ej. "ver detalle"); se muestra sin importar canWrite. */
  onView?: (row: TRow) => void
  /** Si se pasa, cada fila es clickeable (p. ej. para navegar a un detalle). */
  onRowClick?: (row: TRow) => void
  emptyMessage?: string
  searchPlaceholder?: string
}

export default function DataTable<TRow>({
  columns, rows, getRowId, loading = false,
  count, page, pageSize, onPageChange,
  search, onSearchChange,
  canWrite = false, onEdit, onDelete, onView, onRowClick,
  emptyMessage = 'No hay resultados',
  searchPlaceholder = 'Buscar...',
}: DataTableProps<TRow>) {
  const [searchInput, setSearchInput] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mantiene sincronizado el input si `search` cambia desde afuera (p. ej. al limpiar filtros).
  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleSearchInputChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearchChange(value), SEARCH_DEBOUNCE_MS)
  }

  const showActions = Boolean(onView) || (canWrite && Boolean(onEdit || onDelete))
  const columnCount = columns.length + (showActions ? 1 : 0)

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${colors.border}`, borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}`, bgcolor: colors.surface }}>
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
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
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: colors.background }}>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.align ?? 'left'}
                  sx={{ fontWeight: 700, color: colors.textPrimary, width: col.width }}
                >
                  {col.headerName}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="right" sx={{ fontWeight: 700, color: colors.textPrimary }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell>
                      <Skeleton variant="text" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 6 }}>
                    <Inbox sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align ?? 'left'}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.field] ?? '')}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="right">
                      {onView && (
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); onView(row) }}
                          sx={{ color: colors.textSecondary }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      )}
                      {canWrite && onEdit && (
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); onEdit(row) }}
                          sx={{ color: colors.textSecondary }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {canWrite && onDelete && (
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); onDelete(row) }}
                          sx={{ color: colors.error }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={count}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} de ${total}`}
      />
    </Paper>
  )
}
