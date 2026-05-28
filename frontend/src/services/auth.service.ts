import apiClient from '../lib/api-client';
import type { LoginResponse, LoginCredentials } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<LoginResponse> => {
    const { data } = await apiClient.get<LoginResponse>('/auth/me');
    return data;
  },

  getInstances: async (email?: string): Promise<{ status: string; data: { id: number; nombre_mostrable: string; db_name: string }[] }> => {
    const { data } = await apiClient.get('/auth/instances', {
      params: email ? { email } : undefined,
    });
    return data;
  },
};
