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

  requestPasswordReset: async (dto: { email: string; instanceId: string }): Promise<{ status: string; message: string; data?: { token?: string; expiresInMinutes?: number } }> => {
    const { data } = await apiClient.post('/auth/request-password-reset', dto);
    return data;
  },

  resetPassword: async (dto: { email: string; instanceId: string; token: string; newPassword: string }): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/auth/reset-password', dto);
    return data;
  },

  updateMyProfile: async (dto: { username: string; email: string }) => {
    const { data } = await apiClient.put<{ status: string; message: string; data: { id: number; username: string; email: string } }>('/auth/profile', dto);
    return data;
  },

  changeMyPassword: async (dto: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const { data } = await apiClient.post<{ status: string; message: string }>('/auth/change-password', dto);
    return data;
  },

  verifyMfaLogin: async (dto: { mfaPendingToken: string; code: string }): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/mfa/verify-login', dto);
    return data;
  },

  setupMfa: async (): Promise<{ status: string; data: { secret: string; otpauthUrl: string; qrCodeUrl: string } }> => {
    const { data } = await apiClient.post('/auth/mfa/setup');
    return data;
  },

  enableMfa: async (dto: { secret: string; token: string }): Promise<{ status: string; message: string; data: { backupCodes: string[] } }> => {
    const { data } = await apiClient.post('/auth/mfa/enable', dto);
    return data;
  },

  disableMfa: async (dto: { currentPassword: string; token: string }): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.post('/auth/mfa/disable', dto);
    return data;
  },

  regenerateBackupCodes: async (dto: { token: string }): Promise<{ status: string; message: string; data: { backupCodes: string[] } }> => {
    const { data } = await apiClient.post('/auth/mfa/regenerate-backup-codes', dto);
    return data;
  },
};


