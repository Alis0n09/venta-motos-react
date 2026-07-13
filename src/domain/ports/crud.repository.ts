// src/domain/ports/crud.repository.ts

/** Respuesta paginada estándar de Django REST Framework (PageNumberPagination). */
export interface PaginatedResult<TEntity> {
  count: number
  next: string | null
  previous: string | null
  results: TEntity[]
}

/** Parámetros de listado enviados al backend. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}

/**
 * Contrato de acceso a datos genérico para entidades CRUD.
 * Cada entidad (Inventario, Sucursal, Proveedor, ...) implementa esta interfaz
 * en infrastructure/adapters/axios-<entidad>.repository.ts, igual que
 * AxiosAuthRepository implementa AuthRepository.
 */
export interface CrudRepository<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = TCreateDto,
> {
  list(params: ListParams): Promise<PaginatedResult<TEntity>>
  getById(id: number | string): Promise<TEntity>
  create(dto: TCreateDto): Promise<TEntity>
  update(id: number | string, dto: TUpdateDto): Promise<TEntity>
  delete(id: number | string): Promise<void>
}
