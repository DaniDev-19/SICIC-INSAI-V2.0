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

  export: async (params?: { q?: string; tipo_propiedad_id?: number; due_o_id?: number }) => {
    const response = await apiClient.get('/propiedades/export', { params, responseType: 'blob' });
    let filename = 'reporte_propiedades.xlsx';
    if (params?.q || params?.tipo_propiedad_id || params?.due_o_id) {
      filename = 'reporte_propiedades_filtrado.xlsx';
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportPdf: async (params?: { q?: string; tipo_propiedad_id?: number; due_o_id?: number }) => {
    const response = await apiClient.get('/propiedades/export/pdf', { params, responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
  },

  // Inventario
  getInventario: async (propiedadId: number) => {
    const { data } = await apiClient.get(`/propiedades/${propiedadId}/inventario`);
    return data;
  },

  addCultivo: async (propiedadId: number, payload: any) => {
    const { data } = await apiClient.post(`/propiedades/${propiedadId}/inventario/cultivos`, payload);
    return data;
  },

  removeCultivo: async (propiedadId: number, inventarioId: number) => {
    const { data } = await apiClient.delete(`/propiedades/${propiedadId}/inventario/cultivos/${inventarioId}`);
    return data;
  },

  addAnimal: async (propiedadId: number, payload: any) => {
    const { data } = await apiClient.post(`/propiedades/${propiedadId}/inventario/animales`, payload);
    return data;
  },

  removeAnimal: async (propiedadId: number, inventarioId: number) => {
    const { data } = await apiClient.delete(`/propiedades/${propiedadId}/inventario/animales/${inventarioId}`);
    return data;
  },

  addHierro: async (propiedadId: number, payload: { num_reg_hierro?: string, num_reg_ganadero?: string, hierro_img?: File }) => {
    if (!payload.hierro_img) {
      const { data } = await apiClient.post(`/propiedades/${propiedadId}/inventario/hierros`, payload);
      return data;
    }
    
    const formData = new FormData();
    if (payload.num_reg_hierro) formData.append('num_reg_hierro', payload.num_reg_hierro);
    if (payload.num_reg_ganadero) formData.append('num_reg_ganadero', payload.num_reg_ganadero);
    formData.append('hierro_img', payload.hierro_img);
    
    const { data } = await apiClient.post(`/propiedades/${propiedadId}/inventario/hierros`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  removeHierro: async (propiedadId: number, inventarioId: number) => {
    const { data } = await apiClient.delete(`/propiedades/${propiedadId}/inventario/hierros/${inventarioId}`);
    return data;
  }
};
