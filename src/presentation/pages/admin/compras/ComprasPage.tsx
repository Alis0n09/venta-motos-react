// src/presentation/pages/admin/compras/ComprasPage.tsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCrud } from '@/presentation/hooks/use-crud'
import { compraRepository } from '@/infrastructure/factories/compra.factory'
import { proveedorRepository } from '@/infrastructure/factories/proveedor.factory'
import { sucursalRepository } from '@/infrastructure/factories/sucursal.factory'
import type { Compra } from '@/domain/entities/compra.entity'
import { useAuthStore, selectIsAdmin, selectIsBodeguero } from '@/presentation/store/auth.store'
import { formatPrice, formatDateShort } from '@/presentation/utils/formatters'
import CrudPageLayout from '@/presentation/components/crud/CrudPageLayout'
import DataTable, { type DataTableColumn } from '@/presentation/components/crud/DataTable'
import ConfirmDialog from '@/presentation/components/crud/ConfirmDialog'

export default function ComprasPage() {
  const navigate = useNavigate()
  const isAdmin = useAuthStore(selectIsAdmin)
  const isBodeguero = useAuthStore(selectIsBodeguero)
  const canWrite = isAdmin || isBodeguero

  const { data, count, page, pageSize, search, isLoading, setPage, setSearch, refetch } =
    useCrud<Compra>(compraRepository)

  // Compra solo trae los ids de proveedor/sucursal; se resuelven los nombres
  // en el cliente reutilizando los repositorios ya existentes.
  const [proveedorNames, setProveedorNames] = useState<Record<number, string>>({})
  const [sucursalNames, setSucursalNames] = useState<Record<number, string>>({})

  useEffect(() => {
    let active = true
    Promise.all([
      proveedorRepository.list({ page: 1, pageSize: 100 }),
      sucursalRepository.list({ page: 1, pageSize: 100 }),
    ]).then(([proveedores, sucursales]) => {
      if (!active) return
      setProveedorNames(Object.fromEntries(proveedores.results.map((p) => [p.id, p.empresa])))
      setSucursalNames(Object.fromEntries(sucursales.results.map((s) => [s.id, s.nombre])))
    })
    return () => { active = false }
  }, [])

  const [deleteTarget, setDeleteTarget] = useState<Compra | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await compraRepository.delete(deleteTarget.id)
      setDeleteTarget(null)
      await refetch()
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: DataTableColumn<Compra>[] = [
    {
      field: 'proveedor',
      headerName: 'Proveedor',
      render: (row) => proveedorNames[row.proveedor] ?? `#${row.proveedor}`,
    },
    {
      field: 'sucursal_destino',
      headerName: 'Sucursal destino',
      render: (row) => sucursalNames[row.sucursal_destino] ?? `#${row.sucursal_destino}`,
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      render: (row) => formatDateShort(row.fecha),
    },
    {
      field: 'total',
      headerName: 'Total',
      align: 'right',
      render: (row) => formatPrice(Number(row.total)),
    },
  ]

  return (
    <CrudPageLayout
      title="Compras"
      canWrite={canWrite}
      onNew={() => navigate('/admin/compras/nueva')}
      newButtonLabel="Nueva compra"
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
        onDelete={setDeleteTarget}
        onRowClick={(row) => navigate(`/admin/compras/${row.id}`)}
        emptyMessage="No hay compras registradas"
        searchPlaceholder="Buscar por proveedor o sucursal..."
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        message={
          deleteTarget
            ? `¿Eliminar la compra #${deleteTarget.id}? Esta acción no se puede deshacer.`
            : ''
        }
        isLoading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </CrudPageLayout>
  )
}
