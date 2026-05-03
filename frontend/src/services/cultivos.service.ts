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
    const { data } = await apiClient.get<TipoCultivoResponse>('/cultivos/tipos');
    return data;
  },

  create: async (data: CreateCultivoDto): Promise<Cultivo> => {
    const response = await apiClient.post<CultivoResponse>('/cultivos', data);
    return response.data.data as Cultivo;
  },

  update: async (id: number, data: UpdateCultivoDto): Promise<Cultivo> => {
    const response = await apiClient.patch<CultivoResponse>(`/cultivos/${id}`, data);
    return response.data.data as Cultivo;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/cultivos/${id}`);
  },

  deleteMany: async (ids: number[]): Promise<void> => {
    await apiClient.post('/cultivos/bulk-delete', { ids });
  }
};