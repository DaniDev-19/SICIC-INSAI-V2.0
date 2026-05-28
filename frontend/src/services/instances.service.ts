import apiClient from '@/lib/api-client';
import type {
  CreateInstanceDto,
  UpdateInstanceDto,
  InstancesResponse,
  SingleInstanceResponse,
} from '@/types/instance';

export const instancesService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const { data } = await apiClient.get<InstancesResponse>('/master/instances', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<SingleInstanceResponse>(`/master/instances/${id}`);
    return data;
  },

  create: async (payload: CreateInstanceDto) => {
    const { data } = await apiClient.post<SingleInstanceResponse>('/master/instances', payload);
    return data;
  },

  update: async ({ id, ...payload }: UpdateInstanceDto & { id: number }) => {
    const { data } = await apiClient.put<SingleInstanceResponse>(`/master/instances/${id}`, payload);
    return data;
  },

  updateStatus: async ({ id, status }: { id: number; status: boolean }) => {
    const { data } = await apiClient.patch<SingleInstanceResponse>(`/master/instances/${id}/status`, {
      status,
    });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete(`/master/instances/${id}`);
    return data;
  },
};
