import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import type { 
  Cliente, 
  CreateClienteDto, 
  UpdateClienteDto, 
  ClienteResponse 
} from '@/types/clientes';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const clientesService = {
  getAll: async (params: { page?: number; limit?: number; q?: string }): Promise<ClienteResponse> => {
    const { data } = await apiClient.get<ClienteResponse>('/clientes', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return data;
  },

  create: async (cliente: CreateClienteDto): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.post<ApiResponse<Cliente>>('/clientes', cliente);
    return data;
  },

  update: async ({ id, data: updateData }: { id: number; data: UpdateClienteDto }): Promise<ApiResponse<Cliente>> => {
    const { data } = await apiClient.put<ApiResponse<Cliente>>(`/clientes/${id}`, updateData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/clientes/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const { data } = await apiClient.post<SimpleResponse>('/clientes/bulk-delete', { ids });
    return data;
  },

  export: async (params?: { q?: string }) => {
    const response = await apiClient.get('/clientes/export', { params, responseType: 'blob' });
    let filename = 'reporte_clientes.xlsx';
    if (params?.q) {
      filename = 'reporte_clientes_filtrado.xlsx';
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportPdf: async (params?: { q?: string }) => {
    const toastId = toast.loading('Generando reporte PDF de Productores...');
    try {
      const response = await apiClient.get('/clientes/export/pdf', { params, responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
      toast.success('Reporte PDF generado correctamente', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el reporte PDF', { id: toastId });
    }
  },

  openFichaPdf: async (id: number): Promise<void> => {
    const toastId = toast.loading('Preparando Ficha del Productor...');
    try {
      const { openProductorFichaPdf } = await import('@/reports/productor-ficha/generateProductorFichaPdf');
      const response = await apiClient.get<ApiResponse<Cliente>>(`/clientes/${id}/reporte`);
      if (response.data?.data) {
        await openProductorFichaPdf(response.data.data as any);
        toast.success('Ficha PDF lista', { id: toastId });
      } else {
        toast.error('No se pudo obtener los datos del productor', { id: toastId });
      }
    } catch (error) {
      toast.error('Error al generar la Ficha PDF', { id: toastId });
    }
  },
};
