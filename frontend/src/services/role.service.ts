import apiClient from '../lib/api-client';
import type { Role, CreateRoleDto, UpdateRoleDto, RoleResponse } from '../types/role';

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<RoleResponse>('/roles');
    return response.data.data as Role[];
  },

  getRoleById: async (id: number): Promise<Role> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${id}`);
    return response.data.data as Role;
  },

  createRole: async (data: CreateRoleDto): Promise<Role> => {
    const response = await apiClient.post<RoleResponse>('/roles', data);
    return response.data.data as Role;
  },

  updateRole: async (id: number, data: UpdateRoleDto): Promise<Role> => {
    const response = await apiClient.patch<RoleResponse>(`/roles/${id}`, data);
    return response.data.data as Role;
  },

  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};
