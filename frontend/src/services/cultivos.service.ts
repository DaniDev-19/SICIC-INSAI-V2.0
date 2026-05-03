import apiClient from "@/lib/api-client";
import type { 
  Cultivo, 
  CreateCultivoDto, 
  UpdateCultivoDto, 
  CultivoResponse, 
  TipoCultivoResponse 
} from "@/types/cultivos";

export const cultivosService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<CultivoResponse> => {
    const { data } = await apiClient.get<CultivoResponse>('/cultivos', { params });
    return data;
  },

  getTipos: async (): Promise<TipoCultivoResponse> => {
    const { data } = await apiClient.get<TipoCultivoResponse>('/t_cultivo');
    return data;
  },

  createTipo: async (nombre: string): Promise<any> => {
    const response = await apiClient.post('/t_cultivo', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<any> => {
    const response = await apiClient.put(`/t_cultivo/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/t_cultivo/${id}`);
    return response.data;
  },

  create: async (data: CreateCultivoDto): Promise<Cultivo> => {
    const response = await apiClient.post<CultivoResponse>('/cultivos', data);
    return response.data.data as Cultivo;
  },

  update: async (id: number, data: UpdateCultivoDto): Promise<Cultivo> => {
    const response = await apiClient.put<CultivoResponse>(`/cultivos/${id}`, data);
    return response.data.data as Cultivo;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/cultivos/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiClient.post('/cultivos/bulk-delete', { ids });
  }
};