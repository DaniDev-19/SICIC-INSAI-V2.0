import apiClient from '@/lib/api-client';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';
import type {
  Insumo,
  InsumoStock,
  MovimientoInsumo,
  CategoriaInsumo,
  UnidadMedida,
  CreateInsumoDTO,
  UpdateInsumoDTO,
  ManualMovimientoDTO,
  InventarioKPIs,
} from '@/types/inventario';

export interface GetMovimientosParams {
  insumo_id?: number;
  oficina_id?: number;
  tipo_movimiento?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const inventarioService = {

  getInsumos: async (params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<Insumo[]>> => {
    const response = await apiClient.get<ApiResponse<Insumo[]>>('/insumos', {
      params: {
        q: params?.search,
        search: params?.search,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return response.data;
  },

  getInsumoById: async (id: number): Promise<ApiResponse<Insumo>> => {
    const response = await apiClient.get<ApiResponse<Insumo>>(`/insumos/${id}`);
    return response.data;
  },

  createInsumo: async (dto: CreateInsumoDTO): Promise<ApiResponse<Insumo>> => {
    const response = await apiClient.post<ApiResponse<Insumo>>('/insumos', dto);
    return response.data;
  },

  updateInsumo: async (id: number, dto: UpdateInsumoDTO): Promise<ApiResponse<Insumo>> => {
    const response = await apiClient.put<ApiResponse<Insumo>>(`/insumos/${id}`, dto);
    return response.data;
  },

  deleteInsumo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/insumos/${id}`);
    return response.data;
  },

  deleteManyInsumos: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/insumos/bulk-delete', { ids });
    return response.data;
  },

  // Categorías y Unidades
  getCategorias: async (): Promise<ApiResponse<CategoriaInsumo[]>> => {
    const response = await apiClient.get<ApiResponse<CategoriaInsumo[]>>('/c_insumos');
    return response.data;
  },

  getUnidades: async (): Promise<ApiResponse<UnidadMedida[]>> => {
    const response = await apiClient.get<ApiResponse<UnidadMedida[]>>('/t_unidades');
    return response.data;
  },

  // Stock y KPI
  getAllStock: async (params?: { oficina_id?: number; q?: string; low_stock?: boolean; page?: number; limit?: number }): Promise<ApiResponse<InsumoStock[]>> => {
    const response = await apiClient.get<ApiResponse<InsumoStock[]>>('/insumos_stock', {
      params: {
        oficina_id: params?.oficina_id,
        q: params?.q,
        low_stock: params?.low_stock ? 'true' : undefined,
        page: params?.page,
        limit: params?.limit,
      },
    });
    return response.data;
  },

  getStockByOficina: async (oficinaId: number, q?: string): Promise<ApiResponse<InsumoStock[]>> => {
    const response = await apiClient.get<ApiResponse<InsumoStock[]>>(`/insumos_stock/oficina/${oficinaId}`, {
      params: q ? { q } : undefined,
    });
    return response.data;
  },

  getKPIs: async (): Promise<ApiResponse<InventarioKPIs>> => {
    const response = await apiClient.get<ApiResponse<InventarioKPIs>>('/insumos_stock/kpis');
    return response.data;
  },

  updateStockItem: async (
    id: number,
    dto: { stock_minimo?: number; lote?: string; fecha_vencimiento?: string }
  ): Promise<ApiResponse<InsumoStock>> => {
    const response = await apiClient.patch<ApiResponse<InsumoStock>>(`/insumos_stock/${id}`, dto);
    return response.data;
  },

  // Kardex y Movimientos
  getMovimientos: async (params?: GetMovimientosParams): Promise<ApiResponse<MovimientoInsumo[]>> => {
    const response = await apiClient.get<ApiResponse<MovimientoInsumo[]>>('/insumos_stock/movimientos', {
      params,
    });
    return response.data;
  },

  registrarMovimientoManual: async (dto: ManualMovimientoDTO): Promise<ApiResponse<MovimientoInsumo>> => {
    const response = await apiClient.post<ApiResponse<MovimientoInsumo>>('/insumos_stock/movimiento-manual', dto);
    return response.data;
  },
};
