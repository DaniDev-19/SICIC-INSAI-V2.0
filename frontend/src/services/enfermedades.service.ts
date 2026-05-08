import apiClient from '@/lib/api-client';
import type { 
  Enfermedad, 
  CreateEnfermedadDto, 
  UpdateEnfermedadDto, 
  EnfermedadResponse, 
  TipoEnfermedadResponse, 
  SimpleResponse 
} from '@/types/enfermedades';
import type { ApiResponse } from '@/types/pagination';

export const enfermedadesService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<EnfermedadResponse> => {
    const response = await apiClient.get<EnfermedadResponse>('/enfermedades', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Enfermedad>> => {
    const response = await apiClient.get<ApiResponse<Enfermedad>>(`/enfermedades/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<TipoEnfermedadResponse> => {
    const response = await apiClient.get<TipoEnfermedadResponse>('/t_enfermedades');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<TipoEnfermedadResponse> => {
    const response = await apiClient.post<TipoEnfermedadResponse>('/t_enfermedades', { nombre });
    return response.data;
  },

  updateTipo: async ({ id, nombre }: { id: number; nombre: string }): Promise<TipoEnfermedadResponse> => {
    const response = await apiClient.put<TipoEnfermedadResponse>(`/t_enfermedades/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/t_enfermedades/${id}`);
    return response.data;
  },

  create: async (enfermedad: CreateEnfermedadDto): Promise<ApiResponse<Enfermedad>> => {
    const response = await apiClient.post<ApiResponse<Enfermedad>>('/enfermedades', enfermedad);
    return response.data;
  },

  update: async ({ id, enfermedad }: { id: number; enfermedad: UpdateEnfermedadDto }): Promise<ApiResponse<Enfermedad>> => {
    const response = await apiClient.put<ApiResponse<Enfermedad>>(`/enfermedades/${id}`, enfermedad);
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/enfermedades/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/enfermedades/bulk-delete', { ids });
    return response.data;
  }
};
