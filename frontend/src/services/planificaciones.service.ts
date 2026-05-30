import apiClient from '@/lib/api-client';
import type { 
  Planificacion, 
  CreatePlanificacionDto, 
  UpdatePlanificacionDto, 
  PlanificacionResponse 
} from '@/types/planificaciones';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const planificacionesService = {
  getAll: async (params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    fecha_programada?: string; 
    q?: string; 
    periodo?: string;
  }): Promise<PlanificacionResponse> => {
    const { data } = await apiClient.get<PlanificacionResponse>('/planificaciones', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Planificacion>> => {
    const { data } = await apiClient.get<ApiResponse<Planificacion>>(`/planificaciones/${id}`);
    return data;
  },

  create: async (planificacion: CreatePlanificacionDto): Promise<ApiResponse<Planificacion>> => {
    const { data } = await apiClient.post<ApiResponse<Planificacion>>('/planificaciones', planificacion);
    return data;
  },

  update: async ({ id, data: updateData }: { id: number; data: UpdatePlanificacionDto }): Promise<ApiResponse<Planificacion>> => {
    const { data } = await apiClient.put<ApiResponse<Planificacion>>(`/planificaciones/${id}`, updateData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/planificaciones/${id}`);
    return data;
  },

  export: async (params?: { 
    status?: string; 
    fecha_programada?: string; 
    q?: string; 
    periodo?: string; 
  }) => {
    const response = await apiClient.get('/planificaciones/export', { 
      params,
      responseType: 'blob' 
    });
    
    let filename = 'reporte_planificaciones.xlsx';
    if (params?.periodo === 'semana') {
      filename = 'reporte_planificaciones_semanal.xlsx';
    } else if (params?.periodo === 'mes') {
      filename = 'reporte_planificaciones_mensual.xlsx';
    } else if (params?.status || params?.fecha_programada || params?.q) {
      filename = 'reporte_planificaciones_filtrado.xlsx';
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportPdf: async (params?: { 
    status?: string; 
    fecha_programada?: string; 
    q?: string; 
    periodo?: string; 
  }) => {
    const response = await apiClient.get('/planificaciones/export/pdf', { 
      params,
      responseType: 'blob' 
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
  }
};
