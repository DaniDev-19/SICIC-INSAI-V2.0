import apiClient from '@/lib/api-client';
import type { 
  Cliente, 
  CreateClienteDto, 
  UpdateClienteDto, 
  ClienteResponse 
} from '@/types/clientes';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const clientesService = {
  getAll: async (params: { page?: number; limit?: number; q?: string }): Promise<ClienteResponse> => {
    const { data } = await apiClient.get<ClienteResponse>('/clientes', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return data;
  },

  create: async (cliente: CreateClienteDto): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.post<ApiResponse<Cliente>>('/clientes', cliente);
    return data;
  },

  update: async ({ id, data: updateData }: { id: number; data: UpdateClienteDto }): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.put<ApiResponse<Cliente>>(`/clientes/${id}`, updateData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/clientes/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const { data } = await apiClient.post<SimpleResponse>('/clientes/bulk-delete', { ids });
    return data;
  },

  export: async () => {
    const response = await apiClient.get('/clientes/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_clientes.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
