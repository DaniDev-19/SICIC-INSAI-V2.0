import apiClient from '@/lib/api-client';
import type { BackupResponse, BackupConfigResponse, BackupConfig } from '@/types/backup';

export const backupService = {
  getRespaldos: async (): Promise<BackupResponse> => {
    const response = await apiClient.get<BackupResponse>('/backup');
    return response.data;
  },

  crearRespaldoManual: async (target: 'master' | 'operativa' | 'all') => {
    const response = await apiClient.post('/backup/manual', { target });
    return response.data;
  },

  descargarRespaldo: async (filename: string) => {
    const response = await apiClient.get(`/backup/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  },

  eliminarRespaldo: async (filename: string) => {
    const response = await apiClient.delete(`/backup/${encodeURIComponent(filename)}`);
    return response.data;
  },

  getConfiguracion: async (): Promise<BackupConfigResponse> => {
    const response = await apiClient.get<BackupConfigResponse>('/backup/config');
    return response.data;
  },

  guardarConfiguracion: async (config: Partial<BackupConfig>) => {
    const response = await apiClient.put<BackupConfigResponse>('/backup/config', config);
    return response.data;
  },
};

