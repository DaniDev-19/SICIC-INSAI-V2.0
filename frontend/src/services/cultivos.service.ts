import apiClient from "@/lib/api-client";
import type { 
  Cultivo, 
  CreateCultivoDto, 
  UpdateCultivoDto, 
  CultivoResponse, 
  TipoCultivoResponse, 
  SimpleResponse
} from "@/types/cultivos";
import type { ApiResponse } from "@/types/pagination";

export const cultivosService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_id?: string }): Promise<CultivoResponse> => {
    const { data } = await apiClient.get<CultivoResponse>('/cultivos', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Cultivo>> => {
    const { data } = await apiClient.get<ApiResponse<Cultivo>>(`/cultivos/${id}`);
    return data;
  },

  getTipos: async (): Promise<TipoCultivoResponse> => {
    const { data } = await apiClient.get<TipoCultivoResponse>('/t_cultivo');
    return data;
  },

  createTipo: async (nombre: string): Promise<TipoCultivoResponse> => {
    const response = await apiClient.post<TipoCultivoResponse>('/t_cultivo', { nombre });
    return response.data;
  },

  updateTipo: async ({ id, nombre }: { id: number; nombre: string }): Promise<TipoCultivoResponse> => {
    const response = await apiClient.put<TipoCultivoResponse>(`/t_cultivo/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/t_cultivo/${id}`);
    return response.data;
  },

  create: async (data: CreateCultivoDto): Promise<ApiResponse<Cultivo>> => {
    const response = await apiClient.post<ApiResponse<Cultivo>>('/cultivos', data);
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: UpdateCultivoDto }): Promise<ApiResponse<Cultivo>> => {
    const response = await apiClient.put<ApiResponse<Cultivo>>(`/cultivos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/cultivos/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/cultivos/bulk-delete', { ids });
    return response.data;
  }
};