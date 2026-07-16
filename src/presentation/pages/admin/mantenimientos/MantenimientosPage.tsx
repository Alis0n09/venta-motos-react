// src/presentation/pages/admin/mantenimientos/MantenimientosPage.tsx

import { useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, Autocomplete, CircularProgress } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { mantenimientoRepository } from '@/infrastructure/factories/mantenimiento.factory'
import { motoRepository } from '@/infrastructure/factories/moto.factory'
import { clienteRepository } from '@/infrastructure/factories/cliente.factory'
import { mantenimientoFormSchema, type MantenimientoFormValues } from '@/application/dtos/mantenimiento.dto'
import type { Mantenimiento } from '@/domain/entities/mantenimiento.entity'
import type { MantenimientoInput } from '@/domain/ports/mantenimiento.repository'
import type { MotoOption } from '@/domain/ports/moto.repository'
import type { ClienteOption } from '@/domain/ports/cliente.repository'
import { useAuthStore, selectIsStaff } from '@/presentation/store/auth.store'
import { formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const SEARCH_DEBOUNCE_MS = 400

/** Opción del Autocomplete: un resultado de búsqueda, o el valor precargado al editar. */
type MotoAutocompleteOption = MotoOption | { id: number; label: string }
type ClienteAutocompleteOption = ClienteOption | { id: number; label: string }

function getMotoOptionLabel(option: MotoAutocompleteOption): string {
  return 'label' in option ? option.label : `${option.marca_nombre} ${option.modelo} (${option.anio})`
}

function getClienteOptionLabel(option: ClienteAutocompleteOption): string {
  return 'label' in option ? option.label : `${option.nombre} ${option.apellido} (${option.cedula})`
}

const emptyValues: MantenimientoFormValues = { moto: 0, cliente: 0, fecha: '', tipo: '', costo: 0 }

const columns: DataTableColumn<Mantenimiento>[] = [
  { field: 'moto_detalle', headerName: 'Moto', render: (row) => row.moto_detalle ?? `#${row.moto}` },
  { field: 'cliente_nombre', headerName: 'Cliente', render: (row) => row.cliente_nombre ?? '—' },
  { field: 'cliente_cedula', headerName: 'Cédula', render: (row) => row.cliente_cedula ?? '—' },
  { field: 'fecha', headerName: 'Fecha', render: (row) => formatDateShort(row.fecha) },
  { field: 'tipo', headerName: 'Tipo' },
  { field: 'costo', headerName: 'Costo', align: 'right', render: (row) => formatPrice(Number(row.costo)) },
]

interface MantenimientoFormFieldsProps {
  initialMoto: MotoAutocompleteOption | null
  initialCliente: ClienteAutocompleteOption | null
}

function MantenimientoFormFields({ initialMoto, initialCliente }: MantenimientoFormFieldsProps) {
  const { control, formState: { errors } } = useFormContext<MantenimientoFormValues>()

  // ── Moto ──
  const [motoOptions, setMotoOptions] = useState<MotoAutocompleteOption[]>(initialMoto ? [initialMoto] : [])
  const [motoInput, setMotoInput] = useState(initialMoto ? getMotoOptionLabel(initialMoto) : '')
  const [motoLoading, setMotoLoading] = useState(false)
  const motoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Cliente ──
  const [clienteOptions, setClienteOptions] = useState<ClienteAutocompleteOption[]>(initialCliente ? [initialCliente] : [])
  const [clienteInput, setClienteInput] = useState(initialCliente ? getClienteOptionLabel(initialCliente) : '')
  const [clienteLoading, setClienteLoading] = useState(false)
  const clienteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (motoDebounceRef.current) clearTimeout(motoDebounceRef.current)
      if (clienteDebounceRef.current) clearTimeout(clienteDebounceRef.current)
    }
  }, [])

  function handleMotoInputChange(value: string) {
    setMotoInput(value)
    if (motoDebounceRef.current) clearTimeout(motoDebounceRef.current)
    if (!value.trim()) {
      setMotoOptions(initialMoto ? [initialMoto] : [])
      return
    }
    motoDebounceRef.current = setTimeout(async () => {
      setMotoLoading(true)
      try {
        setMotoOptions(await motoRepository.search(value))
      } finally {
        setMotoLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  function handleClienteInputChange(value: string) {
    setClienteInput(value)
    if (clienteDebounceRef.current) clearTimeout(clienteDebounceRef.current)
    if (!value.trim()) {
      setClienteOptions(initialCliente ? [initialCliente] : [])
      return
    }
    clienteDebounceRef.current = setTimeout(async () => {
      setClienteLoading(true)
      try {
        setClienteOptions(await clienteRepository.search(value))
      } finally {
        setClienteLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
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
        name="cliente"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={clienteOptions}
            loading={clienteLoading}
            filterOptions={(options) => options}
            getOptionLabel={getClienteOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={clienteOptions.find((c) => c.id === field.value) ?? initialCliente ?? null}
            inputValue={clienteInput}
            onInputChange={(_, value) => handleClienteInputChange(value)}
            onChange={(_, value) => field.onChange(value ? value.id : 0)}
            noOptionsText={clienteInput.trim() ? 'Sin resultados' : 'Escribe para buscar un cliente'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                error={Boolean(errors.cliente)}
                helperText={errors.cliente?.message ?? 'Recomendado, aunque no obligatorio'}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps.input,
                    endAdornment: (
                      <>
                        {clienteLoading ? <CircularProgress size={16} /> : null}
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
        name="fecha"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="date"
            label="Fecha"
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
            error={Boolean(errors.fecha)}
            helperText={errors.fecha?.message}
          />
        )}
      />

      <Controller
        name="tipo"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Tipo"
            placeholder='Ej: "Cambio de aceite", "Revisión general"'
            fullWidth
            required
            error={Boolean(errors.tipo)}
            helperText={errors.tipo?.message}
          />
        )}
      />

      <Controller
        name="costo"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Costo"
            fullWidth
            required
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            error={Boolean(errors.costo)}
            helperText={errors.costo?.message}
          />
        )}
      />
    </>
  )
}

export default function MantenimientosPage() {
  const canWrite = useAuthStore(selectIsStaff)

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Mantenimiento, MantenimientoInput, MantenimientoInput>(mantenimientoRepository)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<Mantenimiento | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Mantenimiento | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: Mantenimiento) {
    setDialogMode('edit')
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleSubmit(values: MantenimientoFormValues) {
    setIsSubmitting(true)
    try {
      const payload: MantenimientoInput = {
        moto: values.moto,
        ...(values.cliente > 0 ? { cliente: values.cliente } : {}),
        fecha: values.fecha,
        tipo: values.tipo,
        costo: values.costo.toFixed(2),
      }
      if (dialogMode === 'create') {
        await mantenimientoRepository.create(payload)
      } else if (editingItem) {
        await mantenimientoRepository.update(editingItem.id, payload)
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
      await mantenimientoRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: MantenimientoFormValues = editingItem
    ? {
      moto: editingItem.moto,
      cliente: editingItem.cliente ?? 0,
      fecha: editingItem.fecha,
      tipo: editingItem.tipo,
      costo: Number(editingItem.costo),
    }
    : emptyValues

  const initialMoto: MotoAutocompleteOption | null = editingItem
    ? { id: editingItem.moto, label: editingItem.moto_detalle ?? `#${editingItem.moto}` }
    : null

  const initialCliente: ClienteAutocompleteOption | null = editingItem?.cliente
    ? {
      id: editingItem.cliente,
      label: [editingItem.cliente_nombre, editingItem.cliente_cedula ? `(${editingItem.cliente_cedula})` : null]
        .filter(Boolean)
        .join(' '),
    }
    : null

  return (
    <CrudPageLayout
      title="Mantenimientos"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nuevo mantenimiento"
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
        emptyMessage="No hay mantenimientos registrados"
        searchPlaceholder="Buscar por tipo, moto o cliente..."
      />

      <FormDialog<MantenimientoFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="mantenimiento"
        schema={mantenimientoFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <MantenimientoFormFields initialMoto={initialMoto} initialCliente={initialCliente} />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar el mantenimiento "${deleteTarget.tipo}" de "${deleteTarget.moto_detalle ?? `#${deleteTarget.moto}`}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
