import apiClient from '@/lib/api-client';
import type { Plaga, CreatePlagaDto, UpdatePlagaDto, TipoPlaga } from '@/types/plagas';

export interface PlagasResponse {
  status: string;
  data: Plaga[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const plagasService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<PlagasResponse> => {
    const response = await apiClient.get<PlagasResponse>('/plagas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<{ status: string, data: Plaga }> => {
    const response = await apiClient.get<{ status: string, data: Plaga }>(`/plagas/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<{ status: string, data: TipoPlaga[] }> => {
    const response = await apiClient.get<{ status: string, data: TipoPlaga[] }>('/t_plagas');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<any> => {
    const response = await apiClient.post('/t_plagas', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<any> => {
    const response = await apiClient.put(`/t_plagas/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/t_plagas/${id}`);
    return response.data;
  },

  create: async (plaga: CreatePlagaDto): Promise<{ status: string, data: Plaga }> => {
    const response = await apiClient.post<{ status: string, data: Plaga }>('/plagas', plaga);
    return response.data;
  },

  update: async (id: number, plaga: UpdatePlagaDto): Promise<{ status: string, data: Plaga }> => {
    const response = await apiClient.put<{ status: string, data: Plaga }>(`/plagas/${id}`, plaga);
    return response.data;
  },

  delete: async (id: number): Promise<{ status: string, message: string }> => {
    const response = await apiClient.delete<{ status: string, message: string }>(`/plagas/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<{ status: string, message: string }> => {
    const response = await apiClient.post<{ status: string, message: string }>('/plagas/bulk-delete', { ids });
    return response.data;
  }
};
