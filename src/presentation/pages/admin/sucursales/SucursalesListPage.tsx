// src/presentation/pages/admin/sucursales/SucursalesListPage.tsx

import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import { sucursalFormSchema, type SucursalFormValues } from '@/application/dtos/sucursal.dto'
import type { Sucursal } from '@/domain/entities/sucursal.entity'
import { useAuthStore, selectIsStaff } from '@/presentation/store/auth.store'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const emptyValues: SucursalFormValues = { nombre: '', direccion: '', ciudad: '', telefono: '' }

const columns: DataTableColumn<Sucursal>[] = [
  { field: 'nombre', headerName: 'Nombre' },
  { field: 'ciudad', headerName: 'Ciudad' },
  { field: 'direccion', headerName: 'Dirección' },
  { field: 'telefono', headerName: 'Teléfono' },
]

function SucursalFormFields() {
  const { control, formState: { errors } } = useFormContext<SucursalFormValues>()

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
        name="direccion"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Dirección"
            fullWidth
            required
            error={Boolean(errors.direccion)}
            helperText={errors.direccion?.message}
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
        name="telefono"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Teléfono"
            fullWidth
            error={Boolean(errors.telefono)}
            helperText={errors.telefono?.message}
          />
        )}
      />
    </>
  )
}

export default function SucursalesListPage() {
  // Sucursal es IsStaffOrReadOnly: cualquier rol de staff puede escribir,
  // no solo admin/bodeguero (a diferencia de Proveedor/Inventario/Compra).
  const canWrite = useAuthStore(selectIsStaff)

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Sucursal, SucursalFormValues, SucursalFormValues>(sucursalRepository)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Sucursal | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingSucursal(null)
    setDialogOpen(true)
  }

  function openEdit(sucursal: Sucursal) {
    setDialogMode('edit')
    setEditingSucursal(sucursal)
    setDialogOpen(true)
  }

  async function handleSubmit(values: SucursalFormValues) {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await sucursalRepository.create(values)
      } else if (editingSucursal) {
        await sucursalRepository.update(editingSucursal.id, values)
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
      await sucursalRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: SucursalFormValues = editingSucursal
    ? {
      nombre: editingSucursal.nombre,
      direccion: editingSucursal.direccion,
      ciudad: editingSucursal.ciudad,
      telefono: editingSucursal.telefono,
    }
    : emptyValues

  return (
    <CrudPageLayout
      title="Sucursales"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nueva Sucursal"
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
        emptyMessage="No hay sucursales registradas"
        searchPlaceholder="Buscar por nombre, ciudad o dirección..."
      />

      <FormDialog<SucursalFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="Sucursal"
        schema={sucursalFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <SucursalFormFields />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar la sucursal "${deleteTarget.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
