import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/pagination';

export interface Finalidad {
  id: number;
  nombre: string;
  descripcion?: string | null;
  status?: boolean;
}

export const finalidadesService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Finalidad[]>> => {
    const { data } = await apiClient.get<ApiResponse<Finalidad[]>>('/finalidades', {
      params: { page: 1, limit: 200, ...params },
    });
    return data;
  },
};
