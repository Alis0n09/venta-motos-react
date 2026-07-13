// src/presentation/pages/admin/direcciones/DireccionesPage.tsx

import { useEffect, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, Autocomplete, CircularProgress, Switch, FormControlLabel, Chip } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { direccionRepository } from '@/infrastructure/factories/direccion.factory'
import { clienteRepository } from '@/infrastructure/factories/cliente.factory'
import { direccionFormSchema, type DireccionFormValues } from '@/application/dtos/direccion.dto'
import type { Direccion } from '@/domain/entities/direccion.entity'
import type { DireccionInput } from '@/domain/ports/direccion.repository'
import type { ClienteOption } from '@/domain/ports/cliente.repository'
import { useAuthStore, selectIsStaff } from '@/presentation/store/auth.store'
import { colors } from '@/presentation/theme/colors'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const SEARCH_DEBOUNCE_MS = 400

/** Opción del Autocomplete: un resultado de búsqueda, o el valor precargado al editar. */
type ClienteAutocompleteOption = ClienteOption | { id: number; label: string }

function getClienteOptionLabel(option: ClienteAutocompleteOption): string {
  return 'label' in option ? option.label : `${option.nombre} ${option.apellido} (${option.cedula})`
}

const emptyValues: DireccionFormValues = { cliente: 0, calle: '', ciudad: '', provincia: '', principal: false }

interface DireccionFormFieldsProps {
  initialCliente: ClienteAutocompleteOption | null
}

function DireccionFormFields({ initialCliente }: DireccionFormFieldsProps) {
  const { control, formState: { errors } } = useFormContext<DireccionFormValues>()

  const [clienteOptions, setClienteOptions] = useState<ClienteAutocompleteOption[]>(initialCliente ? [initialCliente] : [])
  const [clienteInput, setClienteInput] = useState(initialCliente ? getClienteOptionLabel(initialCliente) : '')
  const [clienteLoading, setClienteLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function handleClienteInputChange(value: string) {
    setClienteInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setClienteOptions(initialCliente ? [initialCliente] : [])
      return
    }
    debounceRef.current = setTimeout(async () => {
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
                required
                error={Boolean(errors.cliente)}
                helperText={errors.cliente?.message ?? 'Busca por nombre o cédula'}
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
        name="calle"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Calle"
            fullWidth
            required
            error={Boolean(errors.calle)}
            helperText={errors.calle?.message}
          />
        )}
      />

      <Controller
        name="ciudad"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Ciudad"
            fullWidth
            required
            error={Boolean(errors.ciudad)}
            helperText={errors.ciudad?.message}
          />
        )}
      />

      <Controller
        name="provincia"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Provincia"
            fullWidth
            required
            error={Boolean(errors.provincia)}
            helperText={errors.provincia?.message}
          />
        )}
      />

      <Controller
        name="principal"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: colors.accent },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.accent },
                }}
              />
            }
            label="Dirección principal"
          />
        )}
      />
    </>
  )
}

export default function DireccionesPage() {
  const canWrite = useAuthStore(selectIsStaff)

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Direccion, DireccionInput, DireccionInput>(direccionRepository)

  // El backend no calcula un nombre de cliente para Direccion, así que se
  // resuelve en el cliente solo para los clientes referenciados en la
  // página actual (no se asume que la lista de clientes sea acotada).
  const [clienteNames, setClienteNames] = useState<Record<number, string>>({})
  const clienteNamesRef = useRef<Record<number, string>>({})

  useEffect(() => {
    clienteNamesRef.current = clienteNames
  }, [clienteNames])

  useEffect(() => {
    const missingIds = [...new Set(data.map((d) => d.cliente))]
      .filter((id) => !(id in clienteNamesRef.current))
    if (missingIds.length === 0) return

    let active = true
    Promise.all(missingIds.map((id) => clienteRepository.getById(id).catch(() => null)))
      .then((results) => {
        if (!active) return
        setClienteNames((prev) => {
          const next = { ...prev }
          results.forEach((cliente, i) => {
            if (cliente) next[missingIds[i]] = `${cliente.nombre} ${cliente.apellido}`
          })
          return next
        })
      })
    return () => { active = false }
  }, [data])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<Direccion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Direccion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: Direccion) {
    setDialogMode('edit')
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleSubmit(values: DireccionFormValues) {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await direccionRepository.create(values)
      } else if (editingItem) {
        await direccionRepository.update(editingItem.id, values)
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
      await direccionRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: DataTableColumn<Direccion>[] = [
    { field: 'cliente', headerName: 'Cliente', render: (row) => clienteNames[row.cliente] ?? `#${row.cliente}` },
    { field: 'calle', headerName: 'Calle' },
    { field: 'ciudad', headerName: 'Ciudad' },
    { field: 'provincia', headerName: 'Provincia' },
    {
      field: 'principal',
      headerName: 'Principal',
      align: 'center',
      render: (row) => (
        row.principal
          ? <Chip label="Principal" size="small" sx={{ bgcolor: colors.accent, color: colors.textOnAccent, fontWeight: 700 }} />
          : null
      ),
    },
  ]

  const defaultValues: DireccionFormValues = editingItem
    ? {
      cliente: editingItem.cliente,
      calle: editingItem.calle,
      ciudad: editingItem.ciudad,
      provincia: editingItem.provincia,
      principal: editingItem.principal,
    }
    : emptyValues

  const initialCliente: ClienteAutocompleteOption | null = editingItem
    ? { id: editingItem.cliente, label: clienteNames[editingItem.cliente] ?? `#${editingItem.cliente}` }
    : null

  return (
    <CrudPageLayout
      title="Direcciones"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nueva dirección"
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
        emptyMessage="No hay direcciones registradas"
        searchPlaceholder="Buscar por calle, ciudad o provincia..."
      />

      <FormDialog<DireccionFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="dirección"
        schema={direccionFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <DireccionFormFields initialCliente={initialCliente} />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar la dirección "${deleteTarget.calle}, ${deleteTarget.ciudad}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
