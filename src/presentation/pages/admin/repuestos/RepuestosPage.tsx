// src/presentation/pages/admin/repuestos/RepuestosPage.tsx

import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField, MenuItem } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { repuestoRepository } from '@/infrastructure/factories/repuesto.factory'
import { repuestoFormSchema, type RepuestoFormValues } from '@/application/dtos/repuesto.dto'
import type { Repuesto } from '@/domain/entities/repuesto.entity'
import type { RepuestoInput, MarcaOption } from '@/domain/ports/repuesto.repository'
import { useAuthStore, selectIsStaff } from '@/presentation/store/auth.store'
import { formatPrice } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const emptyValues: RepuestoFormValues = { nombre: '', marca_compatible: 0, stock: 0, precio: 0 }

const columns: DataTableColumn<Repuesto>[] = [
  { field: 'nombre', headerName: 'Nombre' },
  {
    field: 'marca_compatible_nombre',
    headerName: 'Marca Compatible',
    render: (row) => row.marca_compatible_nombre ?? '—',
  },
  { field: 'stock', headerName: 'Stock', align: 'right', width: 100 },
  { field: 'precio', headerName: 'Precio', align: 'right', render: (row) => formatPrice(Number(row.precio)) },
]

interface RepuestoFormFieldsProps {
  marcas: MarcaOption[]
  marcasLoading: boolean
}

function RepuestoFormFields({ marcas, marcasLoading }: RepuestoFormFieldsProps) {
  const { control, formState: { errors } } = useFormContext<RepuestoFormValues>()

  return (
    <>
      <Controller
        name="nombre"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nombre"
            fullWidth
            required
            autoFocus
            error={Boolean(errors.nombre)}
            helperText={errors.nombre?.message}
          />
        )}
      />

      <Controller
        name="marca_compatible"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Marca Compatible"
            fullWidth
            disabled={marcasLoading}
            error={Boolean(errors.marca_compatible)}
            helperText={errors.marca_compatible?.message ?? 'Opcional'}
          >
            <MenuItem value={0}>{marcasLoading ? 'Cargando...' : 'Sin marca específica'}</MenuItem>
            {marcas.map((marca) => (
              <MenuItem key={marca.id} value={marca.id}>{marca.nombre}</MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="stock"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Stock"
            fullWidth
            required
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            error={Boolean(errors.stock)}
            helperText={errors.stock?.message}
          />
        )}
      />

      <Controller
        name="precio"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Precio"
            fullWidth
            required
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            error={Boolean(errors.precio)}
            helperText={errors.precio?.message}
          />
        )}
      />
    </>
  )
}

export default function RepuestosPage() {
  const canWrite = useAuthStore(selectIsStaff)

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Repuesto, RepuestoInput, RepuestoInput>(repuestoRepository)

  const [marcas, setMarcas] = useState<MarcaOption[]>([])
  const [marcasLoading, setMarcasLoading] = useState(false)

  useEffect(() => {
    let active = true
    setMarcasLoading(true)
    repuestoRepository.listMarcas()
      .then((result) => { if (active) setMarcas(result) })
      .finally(() => { if (active) setMarcasLoading(false) })
    return () => { active = false }
  }, [])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingItem, setEditingItem] = useState<Repuesto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Repuesto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingItem(null)
    setDialogOpen(true)
  }

  function openEdit(item: Repuesto) {
    setDialogMode('edit')
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleSubmit(values: RepuestoFormValues) {
    setIsSubmitting(true)
    try {
      const payload: RepuestoInput = {
        nombre: values.nombre,
        ...(values.marca_compatible > 0 ? { marca_compatible: values.marca_compatible } : {}),
        stock: values.stock,
        precio: values.precio.toFixed(2),
      }
      if (dialogMode === 'create') {
        await repuestoRepository.create(payload)
      } else if (editingItem) {
        await repuestoRepository.update(editingItem.id, payload)
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
      await repuestoRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: RepuestoFormValues = editingItem
    ? {
      nombre: editingItem.nombre,
      marca_compatible: editingItem.marca_compatible ?? 0,
      stock: editingItem.stock,
      precio: Number(editingItem.precio),
    }
    : emptyValues

  return (
    <CrudPageLayout
      title="Repuestos"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nuevo repuesto"
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
        emptyMessage="No hay repuestos registrados"
        searchPlaceholder="Buscar por nombre o marca..."
      />

      <FormDialog<RepuestoFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="repuesto"
        schema={repuestoFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <RepuestoFormFields marcas={marcas} marcasLoading={marcasLoading} />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar el repuesto "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
