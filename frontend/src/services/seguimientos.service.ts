import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';
import type {
  Seguimiento,
  CreateSeguimientoDTO,
  UpdateSeguimientoDTO,
} from '@/types/seguimientos';
import type { SeguimientoReporteDto } from '@/reports/seguimiento-informe/types';

export interface GetSeguimientosParams {
  page?: number;
  limit?: number;
  q?: string;
  search?: string;
  status?: string;
  inspeccion_id?: number;
  acta_silo_id?: number;
}

export const seguimientosService = {
  getAll: async (params: GetSeguimientosParams = {}): Promise<ApiResponse<Seguimiento[]>> => {
    const response = await apiClient.get<ApiResponse<Seguimiento[]>>('/seguimientos', {
      params,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Seguimiento>> => {
    const response = await apiClient.get<ApiResponse<Seguimiento>>(`/seguimientos/${id}`);
    return response.data;
  },

  getReporte: async (id: number): Promise<SeguimientoReporteDto> => {
    const response = await apiClient.get<ApiResponse<SeguimientoReporteDto>>(`/seguimientos/${id}/reporte`);
    return response.data.data;
  },

  openPdfReport: async (id: number) => {
    const toastId = toast.loading('Generando Informe Técnico de Seguimiento en PDF...');
    try {
      const [{ openSeguimientoInformePdf }, reporte] = await Promise.all([
        import('@/reports/seguimiento-informe/generateSeguimientoInformePdf'),
        seguimientosService.getReporte(id),
      ]);
      await openSeguimientoInformePdf(reporte);
      toast.success('Informe Técnico de Seguimiento listo', { id: toastId });
    } catch (error) {
      console.error('Error generando reporte de seguimiento:', error);
      toast.error('Error al generar el Informe Técnico de Seguimiento en PDF', { id: toastId });
    }
  },

  create: async (dto: CreateSeguimientoDTO): Promise<ApiResponse<Seguimiento>> => {
    const formData = new FormData();
    if (dto.fecha_seguimiento) formData.append('fecha_seguimiento', dto.fecha_seguimiento);
    formData.append('hallazgos_seguimiento', dto.hallazgos_seguimiento);
    if (dto.recomendaciones_cumplidas !== undefined) {
      formData.append('recomendaciones_cumplidas', String(dto.recomendaciones_cumplidas));
    }
    if (dto.status) formData.append('status', dto.status);
    if (dto.inspeccion_id) formData.append('inspeccion_id', String(dto.inspeccion_id));
    if (dto.acta_silo_id) formData.append('acta_silo_id', String(dto.acta_silo_id));

    if (dto.fotos && dto.fotos.length > 0) {
      dto.fotos.forEach((foto) => {
        formData.append('fotos', foto);
      });
    }

    const response = await apiClient.post<ApiResponse<Seguimiento>>('/seguimientos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: number, dto: UpdateSeguimientoDTO): Promise<ApiResponse<Seguimiento>> => {
    const formData = new FormData();
    if (dto.fecha_seguimiento) formData.append('fecha_seguimiento', dto.fecha_seguimiento);
    if (dto.hallazgos_seguimiento) formData.append('hallazgos_seguimiento', dto.hallazgos_seguimiento);
    if (dto.recomendaciones_cumplidas !== undefined) {
      formData.append('recomendaciones_cumplidas', String(dto.recomendaciones_cumplidas));
    }
    if (dto.status) formData.append('status', dto.status);

    if (dto.fotos && dto.fotos.length > 0) {
      dto.fotos.forEach((foto) => {
        formData.append('fotos', foto);
      });
    }

    const response = await apiClient.put<ApiResponse<Seguimiento>>(`/seguimientos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/seguimientos/${id}`);
    return response.data;
  },
};
