import apiClient from '@/lib/api-client';
import type { 
  Animal, 
  CreateAnimalDto, 
  UpdateAnimalDto, 
  AnimalResponse, 
  TipoAnimalResponse, 
  SimpleResponse 
} from '@/types/animales';
import type { ApiResponse } from '@/types/pagination';

export const animalesService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<AnimalResponse> => {
    const { data } = await apiClient.get<AnimalResponse>('/animales', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Animal>> => {
    const { data } = await apiClient.get<ApiResponse<Animal>>(`/animales/${id}`);
    return data;
  },

  getTipos: async (): Promise<TipoAnimalResponse> => {
    const { data } = await apiClient.get<TipoAnimalResponse>('/t_animales');
    return data;
  },

  createTipo: async (nombre: string): Promise<TipoAnimalResponse> => {
    const response = await apiClient.post<TipoAnimalResponse>('/t_animales', { nombre });
    return response.data;
  },

  updateTipo: async ({ id, nombre }: { id: number; nombre: string }): Promise<TipoAnimalResponse> => {
    const response = await apiClient.put<TipoAnimalResponse>(`/t_animales/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/t_animales/${id}`);
    return response.data;
  },

  create: async (data: CreateAnimalDto): Promise<ApiResponse<Animal>> => {
    const response = await apiClient.post<ApiResponse<Animal>>('/animales', data);
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: UpdateAnimalDto }): Promise<ApiResponse<Animal>> => {
    const response = await apiClient.put<ApiResponse<Animal>>(`/animales/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/animales/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/animales/bulk-delete', { ids });
    return response.data;
  }
};

