import apiClient from '@/lib/api-client';
import type { 
  Propiedad, 
  CreatePropiedadDto, 
  UpdatePropiedadDto, 
  PropiedadResponse,
  TipoPropiedadResponse 
} from '@/types/propiedades';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const propiedadesService = {
  getAll: async (params: { 
    page?: number; 
    limit?: number; 
    q?: string; 
    tipo_propiedad_id?: number; 
    due_o_id?: number 
  }): Promise<PropiedadResponse> => {
    const { data } = await apiClient.get<PropiedadResponse>('/propiedades', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Propiedad>> => {
    const { data } = await apiClient.get<ApiResponse<Propiedad>>(`/propiedades/${id}`);
    return data;
  },

  getTipos: async (): Promise<TipoPropiedadResponse> => {
    const { data } = await apiClient.get<TipoPropiedadResponse>('/t_propiedad');
    return data;
  },

  createTipo: async (nombre: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>('/t_propiedad', { nombre });
    return data;
  },

  updateTipo: async ({ id, nombre }: { id: number; nombre: string }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/t_propiedad/${id}`, { nombre });
    return data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/t_propiedad/${id}`);
    return data;
  },

  create: async (payload: CreatePropiedadDto & { hierro_img?: File }): Promise<ApiResponse<Propiedad>> => {
    // Si no hay imagen, enviamos JSON puro para evitar problemas de tipos en Zod
    if (!payload.hierro_img) {
      const { data } = await apiClient.post<ApiResponse<Propiedad>>('/propiedades', payload);
      return data;
    }

    // Si hay imagen, usamos FormData
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      const value = (payload as any)[key];
      if (key === 'hierro_img') {
        formData.append(key, value);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const { data } = await apiClient.post<ApiResponse<Propiedad>>('/propiedades', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  update: async ({ id, data: payload }: { id: number; data: UpdatePropiedadDto & { hierro_img?: File } }): Promise<ApiResponse<Propiedad>> => {
    if (!payload.hierro_img) {
      const { data } = await apiClient.put<ApiResponse<Propiedad>>(`/propiedades/${id}`, payload);
      return data;
    }

    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      const value = (payload as any)[key];
      if (key === 'hierro_img') {
        formData.append(key, value);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const { data } = await apiClient.put<ApiResponse<Propiedad>>(`/propiedades/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/propiedades/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const { data } = await apiClient.post<SimpleResponse>('/propiedades/bulk-delete', { ids });
    return data;
  },

  export: async () => {
    const response = await apiClient.get('/propiedades/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_propiedades.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
