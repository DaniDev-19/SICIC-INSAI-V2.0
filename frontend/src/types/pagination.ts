export interface PaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface RawPagination {
  total: number;
  page: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error' | 'warning';
  message?: string;
  data: T[];
  pagination: PaginationData;
}
