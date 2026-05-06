import apiClient from '../lib/api-client';
import type { Role, CreateRoleDto, UpdateRoleDto, RoleResponse } from '../types/role';
import type { ApiResponse } from '../types/pagination';

export const roleService = {
  getRoles: async (params: { page?: number; limit?: number; search?: string; status?: string }): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>('/roles', { params });
    return response.data;
  },

  getRoleById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },

  createRole: async (data: CreateRoleDto): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },

  updateRole: async (id: number, data: UpdateRoleDto): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  deleteManyRoles: async (ids: number[]): Promise<any> => {
    const response = await apiClient.post('/roles/bulk-delete', { ids });
    return response.data;
  },

  updateRoleStatus: async (id: number, status: boolean): Promise<Role> => {
    const response = await apiClient.patch<ApiResponse<Role>>(`/roles/${id}/status`, { status });
    return response.data.data;
  },
};




