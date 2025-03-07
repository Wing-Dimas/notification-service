export interface PaginatorType {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatorType;
}
