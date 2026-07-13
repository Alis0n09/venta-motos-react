// src/presentation/pages/admin/sucursal-staff/SucursalStaffPage.tsx

import { useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, MenuItem, Autocomplete, CircularProgress } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { sucursalStaffRepository } from '@/infrastructure/factories/sucursal-staff.factory'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import { sucursalStaffFormSchema, type SucursalStaffFormValues } from '@/application/dtos/sucursal-staff.dto'
import type { SucursalStaff } from '@/domain/entities/sucursal-staff.entity'
import type { SucursalStaffInput, StaffOption } from '@/domain/ports/sucursal-staff.repository'
import type { Sucursal } from '@/domain/entities/sucursal.entity'
import { useAuthStore, selectIsStaff } from '@/presentation/store/auth.store'
import { formatDateShort } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const SEARCH_DEBOUNCE_MS = 400

/** Opción del Autocomplete: un resultado de búsqueda, o el valor precargado al editar. */
type StaffAutocompleteOption = StaffOption | { id: number; label: string }

function getStaffOptionLabel(option: StaffAutocompleteOption): string {
  return 'label' in option ? option.label : `${option.nombre} ${option.apellido} (${option.cedula})`
}

const emptyValues: SucursalStaffFormValues = { staff: 0, sucursal: 0 }

const columns: DataTableColumn<SucursalStaff>[] = [
  { field: 'staff_nombre', headerName: 'Staff' },
  { field: 'sucursal_nombre', headerName: 'Sucursal' },
  { field: 'fecha_asignacion', headerName: 'Fecha de asignación', render: (row) => formatDateShort(row.fecha_asignacion) },
]

interface SucursalStaffFormFieldsProps {
  sucursales: Sucursal[]
  sucursalesLoading: boolean
  initialStaff: StaffAutocompleteOption | null
}

function SucursalStaffFormFields({ sucursales, sucursalesLoading, initialStaff }: SucursalStaffFormFieldsProps) {
  const { control, formState: { errors } } = useFormContext<SucursalStaffFormValues>()

  const [staffOptions, setStaffOptions] = useState<StaffAutocompleteOption[]>(initialStaff ? [initialStaff] : [])
  const [staffInput, setStaffInput] = useState(initialStaff ? getStaffOptionLabel(initialStaff) : '')
  const [staffLoading, setStaffLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleStaffInputChange(value: string) {
    setStaffInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setStaffOptions(initialStaff ? [initialStaff] : [])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setStaffLoading(true)
      try {
        setStaffOptions(await sucursalStaffRepository.searchStaff(value))
      } finally {
        setStaffLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  return (
    <>
      <Controller
        name="staff"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={staffOptions}
            loading={staffLoading}
            filterOptions={(options) => options}
            getOptionLabel={getStaffOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={staffOptions.find((s) => s.id === field.value) ?? initialStaff ?? null}
            inputValue={staffInput}
            onInputChange={(_, value) => handleStaffInputChange(value)}
            onChange={(_, value) => field.onChange(value ? value.id : 0)}
            noOptionsText={staffInput.trim() ? 'Sin resultados' : 'Escribe para buscar staff'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Staff"
                required
                error={Boolean(errors.staff)}
                helperText={errors.staff?.message ?? 'Busca por nombre o cédula'}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    endAdornment: (
                      <>
                        {staffLoading ? <CircularProgress size={16} /> : null}
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
    </>
  )
}

export default function SucursalStaffPage() {
  const canWrite = useAuthStore(selectIsStaff)

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<SucursalStaff, SucursalStaffInput, SucursalStaffInput>(sucursalStaffRepository)

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
  const [editingItem, setEditingItem] = useState<SucursalStaff | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<SucursalStaff | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: SucursalStaff) {
    setDialogMode('edit')
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleSubmit(values: SucursalStaffFormValues) {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await sucursalStaffRepository.create(values)
      } else if (editingItem) {
        await sucursalStaffRepository.update(editingItem.id, values)
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
      await sucursalStaffRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: SucursalStaffFormValues = editingItem
    ? { staff: editingItem.staff, sucursal: editingItem.sucursal }
    : emptyValues

  const initialStaff: StaffAutocompleteOption | null = editingItem
    ? { id: editingItem.staff, label: editingItem.staff_nombre }
    : null

  return (
    <CrudPageLayout
      title="Asignaciones de Staff a Sucursal"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nueva asignación"
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
        emptyMessage="No hay asignaciones registradas"
        searchPlaceholder="Buscar por staff o sucursal..."
      />

      <FormDialog<SucursalStaffFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="asignación"
        schema={sucursalStaffFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <SucursalStaffFormFields
          sucursales={sucursales}
          sucursalesLoading={sucursalesLoading}
          initialStaff={initialStaff}
        />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar la asignación de "${deleteTarget.staff_nombre}" a "${deleteTarget.sucursal_nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
