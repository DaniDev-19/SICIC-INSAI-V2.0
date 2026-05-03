import apiClient from '@/lib/api-client';
import type { Animal, CreateAnimalDto, UpdateAnimalDto, TipoAnimal } from '@/types/animales';

export interface AnimalesResponse {
  status: string;
  data: Animal[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const animalesService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<AnimalesResponse> => {
    const response = await apiClient.get<AnimalesResponse>('/animales', { params });
    return response.data;
  },

  getById: async (id: number): Promise<{ status: string, data: Animal }> => {
    const response = await apiClient.get<{ status: string, data: Animal }>(`/animales/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<{ status: string, data: TipoAnimal[] }> => {
    const response = await apiClient.get<{ status: string, data: TipoAnimal[] }>('/t_animales');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<any> => {
    const response = await apiClient.post('/t_animales', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<any> => {
    const response = await apiClient.put(`/t_animales/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/t_animales/${id}`);
    return response.data;
  },

  create: async (animal: CreateAnimalDto): Promise<{ status: string, data: Animal }> => {
    const response = await apiClient.post<{ status: string, data: Animal }>('/animales', animal);
    return response.data;
  },

  update: async (id: number, animal: UpdateAnimalDto): Promise<{ status: string, data: Animal }> => {
    const response = await apiClient.put<{ status: string, data: Animal }>(`/animales/${id}`, animal);
    return response.data;
  },

  delete: async (id: number): Promise<{ status: string, message: string }> => {
    const response = await apiClient.delete<{ status: string, message: string }>(`/animales/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<{ status: string, message: string }> => {
    const response = await apiClient.post<{ status: string, message: string }>('/animales/bulk-delete', { ids });
    return response.data;
  }
};
