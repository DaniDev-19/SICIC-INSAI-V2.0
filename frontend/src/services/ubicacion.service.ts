import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/pagination';

export interface UbicacionBase {
  id: number;
  nombre: string;
  codigo?: string;
}

export const ubicacionService = {
  getEstados: async (): Promise<ApiResponse<UbicacionBase[]>> => {
    const { data } = await apiClient.get<ApiResponse<UbicacionBase[]>>('/estados', {
      params: { page: 1, limit: 100 },
    });
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
  },

  // CRUD Municipio
  createMunicipio: async (payload: { nombre: string; estado_id: number; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.post<ApiResponse<UbicacionBase>>('/municipios', payload);
    return data;
  },
  updateMunicipio: async (id: number, payload: { nombre: string; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.put<ApiResponse<UbicacionBase>>(`/municipios/${id}`, payload);
    return data;
  },
  deleteMunicipio: async (id: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/municipios/${id}`);
    return data;
  },

  // CRUD Parroquia
  createParroquia: async (payload: { nombre: string; municipio_id: number; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.post<ApiResponse<UbicacionBase>>('/parroquias', payload);
    return data;
  },
  updateParroquia: async (id: number, payload: { nombre: string; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.put<ApiResponse<UbicacionBase>>(`/parroquias/${id}`, payload);
    return data;
  },
  deleteParroquia: async (id: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/parroquias/${id}`);
    return data;
  },

  // CRUD Sector
  createSector: async (payload: { nombre: string; parroquia_id: number; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.post<ApiResponse<UbicacionBase>>('/sectores', payload);
    return data;
  },
  updateSector: async (id: number, payload: { nombre: string; codigo?: string }): Promise<ApiResponse<UbicacionBase>> => {
    const { data } = await apiClient.put<ApiResponse<UbicacionBase>>(`/sectores/${id}`, payload);
    return data;
  },
  deleteSector: async (id: number): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/sectores/${id}`);
    return data;
  },
};
