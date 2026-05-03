import apiClient from '@/lib/api-client';
import type { Enfermedad, CreateEnfermedadDto, UpdateEnfermedadDto, TipoEnfermedad } from '@/types/enfermedades';

export interface EnfermedadesResponse {
  status: string;
  data: Enfermedad[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const enfermedadesService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<EnfermedadesResponse> => {
    const response = await apiClient.get<EnfermedadesResponse>('/enfermedades', { params });
    return response.data;
  },

  getById: async (id: number): Promise<{ status: string, data: Enfermedad }> => {
    const response = await apiClient.get<{ status: string, data: Enfermedad }>(`/enfermedades/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<{ status: string, data: TipoEnfermedad[] }> => {
    const response = await apiClient.get<{ status: string, data: TipoEnfermedad[] }>('/t_enfermedades');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<any> => {
    const response = await apiClient.post('/t_enfermedades', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<any> => {
    const response = await apiClient.put(`/t_enfermedades/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/t_enfermedades/${id}`);
    return response.data;
  },

  create: async (enfermedad: CreateEnfermedadDto): Promise<{ status: string, data: Enfermedad }> => {
    const response = await apiClient.post<{ status: string, data: Enfermedad }>('/enfermedades', enfermedad);
    return response.data;
  },

  update: async (id: number, enfermedad: UpdateEnfermedadDto): Promise<{ status: string, data: Enfermedad }> => {
    const response = await apiClient.put<{ status: string, data: Enfermedad }>(`/enfermedades/${id}`, enfermedad);
    return response.data;
  },

  delete: async (id: number): Promise<{ status: string, message: string }> => {
    const response = await apiClient.delete<{ status: string, message: string }>(`/enfermedades/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<{ status: string, message: string }> => {
    const response = await apiClient.post<{ status: string, message: string }>('/enfermedades/bulk-delete', { ids });
    return response.data;
  }
};
