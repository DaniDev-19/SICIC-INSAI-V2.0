import apiClient from '../lib/api-client';
import type { LoginResponse } from '../types/auth';

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
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

  getInstances: async (): Promise<any> => {
    const { data } = await apiClient.get('/auth/instances');
    return data;
  },
};
