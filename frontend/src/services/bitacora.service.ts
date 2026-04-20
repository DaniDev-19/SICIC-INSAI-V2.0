import apiClient from '../lib/api-client';
import type { BitacoraResponse } from '@/types/bitacora';

export const bitacoraService = {
  getLogs: async (params: {
    page?: number;
    limit?: number;
    modulo?: string;
    accion?: string;
    username?: string;
  }): Promise<BitacoraResponse> => {
    const { data } = await apiClient.get<BitacoraResponse>('/bitacora', { params });
    return data;
  },

  getModulos: async (): Promise<string[]> => {
    const { data } = await apiClient.get('/bitacora/modulos');
    return data.data;
  }
};
