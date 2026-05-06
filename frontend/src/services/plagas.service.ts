import apiClient from '@/lib/api-client';
import type { 
  Plaga, 
  CreatePlagaDto, 
  UpdatePlagaDto, 
  PlagaResponse, 
  TipoPlagaResponse, 
  SimpleResponse 
} from '@/types/plagas';
import type { ApiResponse } from '@/types/pagination';

export const plagasService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<PlagaResponse> => {
    const response = await apiClient.get<PlagaResponse>('/plagas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Plaga>> => {
    const response = await apiClient.get<ApiResponse<Plaga>>(`/plagas/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<TipoPlagaResponse> => {
    const response = await apiClient.get<TipoPlagaResponse>('/t_plaga');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<TipoPlagaResponse> => {
    const response = await apiClient.post<TipoPlagaResponse>('/t_plaga', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<TipoPlagaResponse> => {
    const response = await apiClient.put<TipoPlagaResponse>(`/t_plaga/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/t_plaga/${id}`);
    return response.data;
  },

  create: async (plaga: CreatePlagaDto): Promise<ApiResponse<Plaga>> => {
    const response = await apiClient.post<ApiResponse<Plaga>>('/plagas', plaga);
    return response.data;
  },

  update: async (id: number, plaga: UpdatePlagaDto): Promise<ApiResponse<Plaga>> => {
    const response = await apiClient.put<ApiResponse<Plaga>>(`/plagas/${id}`, plaga);
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/plagas/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/plagas/bulk-delete', { ids });
    return response.data;
  }
};
