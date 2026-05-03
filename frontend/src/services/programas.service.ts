import apiClient from '@/lib/api-client';
import type {
  Programa,
  CreateProgramaDto,
  UpdateProgramaDto,
  ProgramaResponse,
  TipoPrograma
} from '../types/programas';

export const programasService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; tipo_programa_id?: string }): Promise<ProgramaResponse> => {
    const response = await apiClient.get<ProgramaResponse>('/programas', { params });
    return response.data;
  },

  getById: async (id: number): Promise<{ status: string, data: Programa }> => {
    const response = await apiClient.get<{ status: string, data: Programa }>(`/programas/${id}`);
    return response.data;
  },

  getTipos: async (): Promise<{ status: string, data: TipoPrograma[] }> => {
    const response = await apiClient.get<{ status: string, data: TipoPrograma[] }>('/t_programa');
    return response.data;
  },

  createTipo: async (nombre: string): Promise<any> => {
    const response = await apiClient.post('/t_programa', { nombre });
    return response.data;
  },

  updateTipo: async (id: number, nombre: string): Promise<any> => {
    const response = await apiClient.put(`/t_programa/${id}`, { nombre });
    return response.data;
  },

  deleteTipo: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/t_programa/${id}`);
    return response.data;
  },

  create: async (programa: CreateProgramaDto): Promise<{ status: string, data: Programa }> => {
    const response = await apiClient.post<{ status: string, data: Programa }>('/programas', programa);
    return response.data;
  },

  update: async (id: number, programa: UpdateProgramaDto): Promise<{ status: string, data: Programa }> => {
    const response = await apiClient.put<{ status: string, data: Programa }>(`/programas/${id}`, programa);
    return response.data;
  },

  delete: async (id: number): Promise<{ status: string, message: string }> => {
    const response = await apiClient.delete<{ status: string, message: string }>(`/programas/${id}`);
    return response.data;
  },

  deleteMany: async (ids: number[]): Promise<{ status: string, message: string }> => {
    const response = await apiClient.post<{ status: string, message: string }>('/programas/bulk-delete', { ids });
    return response.data;
  }
};
