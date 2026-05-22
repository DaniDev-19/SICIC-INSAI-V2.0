import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/pagination';

export interface UbicacionBase {
  id: number;
  nombre: string;
  codigo?: string;
}

export const ubicacionService = {
  getEstados: async (): Promise<ApiResponse<UbicacionBase[]>> => {
    const { data } = await apiClient.get<ApiResponse<UbicacionBase[]>>('/estados');
    return data;
  },

  getMunicipios: async (estadoId: number): Promise<ApiResponse<UbicacionBase[]>> => {
    const { data } = await apiClient.get<ApiResponse<UbicacionBase[]>>('/municipios', {
      params: { estado_id: estadoId, limit: 100 }
    });
    return data;
  },

  getParroquias: async (municipioId: number): Promise<ApiResponse<UbicacionBase[]>> => {
    const { data } = await apiClient.get<ApiResponse<UbicacionBase[]>>('/parroquias', {
      params: { municipio_id: municipioId, limit: 100 }
    });
    return data;
  },

  getSectores: async (parroquiaId: number): Promise<ApiResponse<UbicacionBase[]>> => {
    const { data } = await apiClient.get<ApiResponse<UbicacionBase[]>>('/sectores', {
      params: { parroquia_id: parroquiaId, limit: 100 }
    });
    return data;
  }
};
