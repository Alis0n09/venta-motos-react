// src/presentation/pages/admin/inventario/InventarioPage.tsx

import { useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, MenuItem, Autocomplete, CircularProgress } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { inventarioRepository } from '@/infrastructure/factories/inventario.factory'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import { motoRepository } from '@/infrastructure/factories/moto.factory'
import { inventarioFormSchema, type InventarioFormValues } from '@/application/dtos/inventario.dto'
import type { Inventario } from '@/domain/entities/inventario.entity'
import type { MotoOption } from '@/domain/ports/moto.repository'
import type { Sucursal } from '@/domain/entities/sucursal.entity'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const MOTO_SEARCH_DEBOUNCE_MS = 400

/** Opción del Autocomplete: un resultado de búsqueda, o el valor precargado al editar. */
type MotoAutocompleteOption = MotoOption | { id: number; label: string }

function getMotoOptionLabel(option: MotoAutocompleteOption): string {
  return 'label' in option ? option.label : `${option.marca_nombre} ${option.modelo} (${option.anio})`
}

const emptyValues: InventarioFormValues = { moto: 0, sucursal: 0, cantidad: 0, ubicacion_bodega: '' }

const columns: DataTableColumn<Inventario>[] = [
  { field: 'moto_nombre', headerName: 'Moto' },
  { field: 'sucursal_nombre', headerName: 'Sucursal' },
  { field: 'cantidad', headerName: 'Cantidad', align: 'right', width: 120 },
  { field: 'ubicacion_bodega', headerName: 'Ubicación Bodega' },
]

interface InventarioFormFieldsProps {
  sucursales: Sucursal[]
  sucursalesLoading: boolean
  initialMoto: MotoAutocompleteOption | null
}

function InventarioFormFields({ sucursales, sucursalesLoading, initialMoto }: InventarioFormFieldsProps) {
  const { control, formState: { errors } } = useFormContext<InventarioFormValues>()

  const [motoOptions, setMotoOptions] = useState<MotoAutocompleteOption[]>(initialMoto ? [initialMoto] : [])
  const [motoInput, setMotoInput] = useState(initialMoto ? getMotoOptionLabel(initialMoto) : '')
  const [motoLoading, setMotoLoading] = useState(false)
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
      setMotoOptions(initialMoto ? [initialMoto] : [])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setMotoLoading(true)
      try {
        const results = await motoRepository.search(value)
        setMotoOptions(results)
      } finally {
        setMotoLoading(false)
      }
    }, MOTO_SEARCH_DEBOUNCE_MS)
  }

  return (
    <>
      <Controller
        name="moto"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={motoOptions}
            loading={motoLoading}
            filterOptions={(options) => options}
            getOptionLabel={getMotoOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={motoOptions.find((m) => m.id === field.value) ?? initialMoto ?? null}
            inputValue={motoInput}
            onInputChange={(_, value) => handleMotoInputChange(value)}
            onChange={(_, value) => field.onChange(value ? value.id : 0)}
            noOptionsText={motoInput.trim() ? 'Sin resultados' : 'Escribe para buscar una moto'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Moto"
                required
                error={Boolean(errors.moto)}
                helperText={errors.moto?.message ?? 'Busca por marca o modelo'}
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
        )}
      />

      <Controller
        name="sucursal"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Sucursal"
            fullWidth
            required
            disabled={sucursalesLoading}
            error={Boolean(errors.sucursal)}
            helperText={errors.sucursal?.message}
          >
            <MenuItem value={0} disabled>
              {sucursalesLoading ? 'Cargando...' : 'Selecciona una sucursal'}
            </MenuItem>
            {sucursales.map((sucursal) => (
              <MenuItem key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="cantidad"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Cantidad"
            fullWidth
            required
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            error={Boolean(errors.cantidad)}
            helperText={errors.cantidad?.message}
          />
        )}
      />

      <Controller
        name="ubicacion_bodega"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Ubicación Bodega"
            fullWidth
            error={Boolean(errors.ubicacion_bodega)}
            helperText={errors.ubicacion_bodega?.message}
          />
        )}
      />
    </>
  )
}

export default function InventarioPage() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canWrite = isAdmin || isBodeguero

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Inventario, InventarioFormValues, InventarioFormValues>(inventarioRepository)

  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalesLoading, setSucursalesLoading] = useState(false)

  useEffect(() => {
    let active = true
    setSucursalesLoading(true)
    sucursalRepository.list({ page: 1, pageSize: 100 })
      .then((result) => { if (active) setSucursales(result.results) })
      .finally(() => { if (active) setSucursalesLoading(false) })
    return () => { active = false }
  }, [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<Inventario | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Inventario | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: Inventario) {
    setDialogMode('edit')
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleSubmit(values: InventarioFormValues) {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await inventarioRepository.create(values)
      } else if (editingItem) {
        await inventarioRepository.update(editingItem.id, values)
      }
      setDialogOpen(false)
      await refetch()
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await inventarioRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: InventarioFormValues = editingItem
    ? {
      moto: editingItem.moto,
      sucursal: editingItem.sucursal,
      cantidad: editingItem.cantidad,
      ubicacion_bodega: editingItem.ubicacion_bodega,
    }
    : emptyValues

  const initialMoto: MotoAutocompleteOption | null = editingItem
    ? { id: editingItem.moto, label: editingItem.moto_nombre }
    : null

  return (
    <CrudPageLayout
      title="Inventario"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nuevo registro"
    >
      <DataTable
        columns={columns}
        rows={data}
        getRowId={(row) => row.id}
        loading={isLoading}
        count={count}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        canWrite={canWrite}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No hay inventario registrado"
        searchPlaceholder="Buscar por moto, marca, sucursal o ubicación..."
      />

      <FormDialog<InventarioFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="registro de inventario"
        schema={inventarioFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <InventarioFormFields
          sucursales={sucursales}
          sucursalesLoading={sucursalesLoading}
          initialMoto={initialMoto}
        />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar el registro de inventario de "${deleteTarget.moto_nombre}" en "${deleteTarget.sucursal_nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
