// src/presentation/hooks/use-crud.ts

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CrudRepository } from '@/domain/ports/crud.repository'
import { ApiException } from '@/domain/exceptions/api.exception'

interface UseCrudOptions {
  pageSize?: number
}

/**
 * Repositorio mínimo que acepta useCrud: siempre necesita `list`, el resto
 * de métodos son opcionales para permitir repositorios de solo lectura
 * (p. ej. SucursalRepository) que no implementan create/update/delete.
 */
type UseCrudRepository<TEntity, TCreateDto, TUpdateDto> =
  Pick<CrudRepository<TEntity, TCreateDto, TUpdateDto>, 'list'> &
  Partial<CrudRepository<TEntity, TCreateDto, TUpdateDto>>

/**
 * Maneja estado (data, loading, error, paginación) para cualquier
 * repositorio que cumpla al menos `list` de CrudRepository. Uso típico:
 *
 *   const crud = useCrud(inventarioRepository)
 *   crud.data / crud.isLoading / crud.error
 *   crud.setSearch(term) / crud.setPage(n) / crud.refetch() / crud.remove(id)
 */
export function useCrud<TEntity, TCreateDto = Partial<TEntity>, TUpdateDto = TCreateDto>(
  repository: UseCrudRepository<TEntity, TCreateDto, TUpdateDto>,
  options: UseCrudOptions = {},
) {
  const pageSize = options.pageSize ?? 10

  const [data, setData] = useState<TEntity[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Descarta respuestas de peticiones obsoletas (p. ej. si el usuario cambia
  // la búsqueda antes de que la anterior responda).
  const requestId = useRef(0)

  const fetchData = useCallback(async () => {
    const id = ++requestId.current
    setIsLoading(true)
    setError(null)
    try {
      const result = await repository.list({ page, pageSize, search: search || undefined })
      if (id !== requestId.current) return
      setData(result.results)
      setCount(result.count)
    } catch (err) {
      if (id !== requestId.current) return
      const apiErr = err as ApiException
      setError(apiErr.detail ?? 'Error al cargar los datos')
    } finally {
      if (id === requestId.current) setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, page, pageSize, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function updateSearch(term: string) {
    setPage(1)
    setSearch(term)
  }

  async function remove(id: number | string) {
    const deleteFn = repository.delete
    if (!deleteFn) {
      throw new Error('Este repositorio no admite eliminar registros.')
    }
    await deleteFn(id)
    await fetchData()
  }

  return {
    data,
    count,
    page,
    pageSize,
    search,
    isLoading,
    error,
    setPage,
    setSearch: updateSearch,
    refetch: fetchData,
    remove,
  }
}
