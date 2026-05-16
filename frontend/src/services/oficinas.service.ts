import apiClient from '@/lib/api-client';
import type { 
  OficinaResponse, 
  SingleOficinaResponse, 
  CreateOficinaDto, 
  UpdateOficinaDto 
} from '@/types/oficinas';

export const oficinasService = {
  getAll: async (params: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<OficinaResponse>('/oficinas', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<SingleOficinaResponse>(`/oficinas/${id}`);
    return data;
  },

  create: async (payload: CreateOficinaDto) => {
    const { data } = await apiClient.post<SingleOficinaResponse>('/oficinas', payload);
    return data;
  },

  update: async ({ id, ...payload }: UpdateOficinaDto & { id: number }) => {
    const { data } = await apiClient.put<SingleOficinaResponse>(`/oficinas/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/oficinas/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]) => {
    const { data } = await apiClient.post('/oficinas/delete-many', { ids });
    return data;
  }
};
