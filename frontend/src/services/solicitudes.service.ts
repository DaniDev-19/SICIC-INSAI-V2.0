import apiClient from '@/lib/api-client';
import type { 
  Solicitud, 
  CreateSolicitudDto, 
  UpdateSolicitudDto, 
  SolicitudResponse, 
  TipoSolicitudResponse 
} from '@/types/solicitudes';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const solicitudesService = {
  getAll: async (params: { 
    page?: number; 
    limit?: number; 
    q?: string; 
    estatus?: string;
    prioridad?: string;
    solicitante_id?: number;
    propiedad_id?: number;
  }): Promise<SolicitudResponse> => {
    const { data } = await apiClient.get<SolicitudResponse>('/solicitudes', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Solicitud>> => {
    const { data } = await apiClient.get<ApiResponse<Solicitud>>(`/solicitudes/${id}`);
    return data;
  },

  getTipos: async (): Promise<TipoSolicitudResponse> => {
    const { data } = await apiClient.get<TipoSolicitudResponse>('/t_solicitud');
    return data;
  },

  createTipo: async (nombre: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post<ApiResponse<any>>('/t_solicitud', { nombre });
    return data;
  },

  updateTipo: async ({ id, nombre }: { id: number; nombre: string }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/t_solicitud/${id}`, { nombre });
    return data;
  },

  deleteTipo: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/t_solicitud/${id}`);
    return data;
  },

  create: async (solicitud: CreateSolicitudDto): Promise<ApiResponse<Solicitud>> => {
    const { data } = await apiClient.post<ApiResponse<Solicitud>>('/solicitudes', solicitud);
    return data;
  },

  update: async ({ id, data: updateData }: { id: number; data: UpdateSolicitudDto }): Promise<ApiResponse<Solicitud>> => {
    const { data } = await apiClient.put<ApiResponse<Solicitud>>(`/solicitudes/${id}`, updateData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/solicitudes/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const { data } = await apiClient.post<SimpleResponse>('/solicitudes/bulk-delete', { ids });
    return data;
  },

  export: async () => {
    const response = await apiClient.get('/solicitudes/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_solicitudes.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
