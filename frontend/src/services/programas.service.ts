import apiClient from '@/lib/api-client';
import type {
  Programa,
  CreateProgramaDto,
  UpdateProgramaDto,
  ProgramaResponse,
  TipoProgramaResponse,
  SimpleResponse
} from '@/types/programas';
import type { ApiResponse } from '@/types/pagination';

export const programasService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_programa_id?: string }): Promise<ProgramaResponse> => {
    const response = await apiClient.get<ProgramaResponse>('/programas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Programa>> => {
    const response = await apiClient.get<ApiResponse<Programa>>(`/programas/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<TipoProgramaResponse> => {
    const response = await apiClient.get<TipoProgramaResponse>('/t_programa');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<TipoProgramaResponse> => {
    const response = await apiClient.post<TipoProgramaResponse>('/t_programa', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<TipoProgramaResponse> => {
    const response = await apiClient.put<TipoProgramaResponse>(`/t_programa/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/t_programa/${id}`);
    return response.data;
  },

  create: async (programa: CreateProgramaDto): Promise<ApiResponse<Programa>> => {
    const response = await apiClient.post<ApiResponse<Programa>>('/programas', programa);
    return response.data;
  },

  update: async (id: number, programa: UpdateProgramaDto): Promise<ApiResponse<Programa>> => {
    const response = await apiClient.put<ApiResponse<Programa>>(`/programas/${id}`, programa);
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/programas/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const response = await apiClient.post<SimpleResponse>('/programas/bulk-delete', { ids });
    return response.data;
  }
};
