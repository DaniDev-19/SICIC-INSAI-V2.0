import apiClient from '@/lib/api-client';
import type {
  MasterUser,
  CreateUserDto,
  UpdateUserDto,
  AssignInstanceDto,
  UsersResponse,
  SingleUserResponse,
} from '@/types/user';
import type { ApiResponse } from '@/types/pagination';

export const usersService = {
  getAll: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const { data } = await apiClient.get<UsersResponse>('/master/users', { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<SingleUserResponse>(`/master/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserDto) => {
    const { data } = await apiClient.post<SingleUserResponse>('/master/users', payload);
    return data;
  },

  update: async ({ id, ...payload }: UpdateUserDto & { id: number }) => {
    const { data } = await apiClient.put<SingleUserResponse>(`/master/users/${id}`, payload);
    return data;
  },

  updateStatus: async ({ id, status }: { id: number; status: boolean }) => {
    const { data } = await apiClient.patch<SingleUserResponse>(`/master/users/${id}/status`, { status });
    return data;
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/master/users/${id}`);
    return data;
  },

  assignInstance: async ({ userId, ...payload }: AssignInstanceDto & { userId: number }) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(`/master/users/${userId}/instances`, payload);
    return data;
  },

  removeInstance: async ({ userId, instanciaId }: { userId: number; instanciaId: number }) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/master/users/${userId}/instances/${instanciaId}`
    );
    return data;
  },
};

export type { MasterUser };
