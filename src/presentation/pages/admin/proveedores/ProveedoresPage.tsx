// src/presentation/pages/admin/proveedores/ProveedoresPage.tsx

import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'
import { useCrud } from '@/presentation/hooks/use-crud'
import { proveedorRepository } from '@/infrastructure/factories/proveedor.factory'
import { proveedorFormSchema, type ProveedorFormValues } from '@/application/dtos/proveedor.dto'
import type { Proveedor } from '@/domain/entities/proveedor.entity'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import FormDialog from '@/presentation/components/crud/FormDialog'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

const emptyValues: ProveedorFormValues = { empresa: '', contacto: '', correo: '', pais: '' }

const columns: DataTableColumn<Proveedor>[] = [
  { field: 'empresa', headerName: 'Empresa' },
  { field: 'contacto', headerName: 'Contacto' },
  { field: 'correo', headerName: 'Correo' },
  { field: 'pais', headerName: 'País' },
]

function ProveedorFormFields() {
  const { control, formState: { errors } } = useFormContext<ProveedorFormValues>()

  return (
    <>
      <Controller
        name="empresa"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Empresa"
            fullWidth
            required
            autoFocus
            error={Boolean(errors.empresa)}
            helperText={errors.empresa?.message}
          />
        )}
      />
      <Controller
        name="contacto"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Contacto"
            fullWidth
            error={Boolean(errors.contacto)}
            helperText={errors.contacto?.message}
          />
        )}
      />
      <Controller
        name="correo"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Correo"
            fullWidth
            error={Boolean(errors.correo)}
            helperText={errors.correo?.message}
          />
        )}
      />
      <Controller
        name="pais"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="País"
            fullWidth
            error={Boolean(errors.pais)}
            helperText={errors.pais?.message}
          />
        )}
      />
    </>
  )
}

export default function ProveedoresPage() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canWrite = isAdmin || isBodeguero

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Proveedor, ProveedorFormValues, ProveedorFormValues>(proveedorRepository)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Proveedor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function openCreate() {
    setDialogMode('create')
    setEditingProveedor(null)
    setDialogOpen(true)
  }

  function openEdit(proveedor: Proveedor) {
    setDialogMode('edit')
    setEditingProveedor(proveedor)
    setDialogOpen(true)
  }

  async function handleSubmit(values: ProveedorFormValues) {
    setIsSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await proveedorRepository.create(values)
      } else if (editingProveedor) {
        await proveedorRepository.update(editingProveedor.id, values)
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
      await proveedorRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultValues: ProveedorFormValues = editingProveedor
    ? {
      empresa: editingProveedor.empresa,
      contacto: editingProveedor.contacto,
      correo: editingProveedor.correo,
      pais: editingProveedor.pais,
    }
    : emptyValues

  return (
    <CrudPageLayout
      title="Proveedores"
      canWrite={canWrite}
      onNew={openCreate}
      newButtonLabel="Nuevo proveedor"
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
        emptyMessage="No hay proveedores registrados"
        searchPlaceholder="Buscar por empresa, contacto, país o correo..."
      />

      <FormDialog<ProveedorFormValues>
        open={dialogOpen}
        mode={dialogMode}
        entityLabel="proveedor"
        schema={proveedorFormSchema}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      >
        <ProveedorFormFields />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar al proveedor "${deleteTarget.empresa}"? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
