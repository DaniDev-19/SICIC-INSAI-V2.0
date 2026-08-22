import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import type { AvalSanitario, CreateAvalDTO, UpdateAvalDTO } from '@/types/avales';
import type { ApiResponse } from '@/types/pagination';
import type { AvalSanitarioReporteDto } from '@/reports/aval-sanitario/types';

export type AvalesResponse = ApiResponse<AvalSanitario[]>;

export const avalesService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<AvalesResponse> => {
    const { data } = await apiClient.get<AvalesResponse>('/avales', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<AvalSanitario>> => {
    const { data } = await apiClient.get<ApiResponse<AvalSanitario>>(`/avales/${id}`);
    return data;
  },

  getReporte: async (id: number): Promise<AvalSanitarioReporteDto> => {
    const { data } = await apiClient.get<ApiResponse<AvalSanitarioReporteDto>>(`/avales/${id}/reporte`);
    return data.data;
  },

  openPdfReport: async (id: number) => {
    const toastId = toast.loading('Generando Aval Sanitario Oficial en PDF...');
    try {
      const [{ openAvalSanitarioPdf }, reporte] = await Promise.all([
        import('@/reports/aval-sanitario/generateAvalSanitarioPdf'),
        avalesService.getReporte(id),
      ]);
      await openAvalSanitarioPdf(reporte);
      toast.success('Aval Sanitario listo', { id: toastId });
    } catch (error) {
      console.error('Error generando reporte de aval:', error);
      toast.error('Error al generar el Aval Sanitario Oficial en PDF', { id: toastId });
    }
  },

  exportExcel: async (params?: { q?: string }) => {
    const toastId = toast.loading('Exportando Avales a Excel...');
    try {
      const response = await apiClient.get('/avales/export/excel', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_avales_sanitarios.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
      toast.success('Reporte Excel descargado correctamente', { id: toastId });
    } catch (error) {
      toast.error('Error al exportar los avales a Excel', { id: toastId });
    }
  },

  exportPdf: async (params?: { q?: string }) => {
    const toastId = toast.loading('Generando reporte PDF consolidado...');
    try {
      const response = await apiClient.get('/avales/export/pdf', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
      toast.success('Reporte PDF consolidado generado', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el reporte PDF consolidado', { id: toastId });
    }
  },

  create: async (dto: CreateAvalDTO): Promise<ApiResponse<AvalSanitario>> => {
    const formData = new FormData();

    if (dto.numero_aval) formData.append('numero_aval', dto.numero_aval);
    if (dto.codigo_predio) formData.append('codigo_predio', dto.codigo_predio);
    if (dto.fecha_emision) formData.append('fecha_emision', dto.fecha_emision);
    if (dto.fecha_vencimiento) formData.append('fecha_vencimiento', dto.fecha_vencimiento);
    if (dto.certificado_vacunacion_n) formData.append('certificado_vacunacion_n', dto.certificado_vacunacion_n);
    if (dto.observaciones) formData.append('observaciones', dto.observaciones);
    if (dto.inspeccion_id) formData.append('inspeccion_id', String(dto.inspeccion_id));
    if (dto.medico_responsable_id) formData.append('medico_responsable_id', String(dto.medico_responsable_id));
    if (dto.jefe_osa_id) formData.append('jefe_osa_id', String(dto.jefe_osa_id));

    if (dto.hallazgos_bov_buf) {
      formData.append('hallazgos_bov_buf', JSON.stringify(dto.hallazgos_bov_buf));
    }
    if (dto.hallazgos_otras && dto.hallazgos_otras.length > 0) {
      formData.append('hallazgos_otras', JSON.stringify(dto.hallazgos_otras));
    }
    if (dto.biologicos && dto.biologicos.length > 0) {
      formData.append('biologicos', JSON.stringify(dto.biologicos));
    }

    if (dto.hierros && dto.hierros.length > 0) {
      dto.hierros.forEach((file) => formData.append('hierros', file));
    }

    const { data } = await apiClient.post<ApiResponse<AvalSanitario>>('/avales', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: number, dto: UpdateAvalDTO): Promise<ApiResponse<AvalSanitario>> => {
    const formData = new FormData();

    if (dto.codigo_predio !== undefined) formData.append('codigo_predio', dto.codigo_predio);
    if (dto.fecha_emision !== undefined) formData.append('fecha_emision', dto.fecha_emision);
    if (dto.fecha_vencimiento !== undefined) formData.append('fecha_vencimiento', dto.fecha_vencimiento);
    if (dto.certificado_vacunacion_n !== undefined) formData.append('certificado_vacunacion_n', dto.certificado_vacunacion_n);
    if (dto.observaciones !== undefined) formData.append('observaciones', dto.observaciones);
    if (dto.medico_responsable_id !== undefined) formData.append('medico_responsable_id', String(dto.medico_responsable_id));
    if (dto.jefe_osa_id !== undefined) formData.append('jefe_osa_id', String(dto.jefe_osa_id));

    if (dto.hallazgos_bov_buf) {
      formData.append('hallazgos_bov_buf', JSON.stringify(dto.hallazgos_bov_buf));
    }
    if (dto.hallazgos_otras) {
      formData.append('hallazgos_otras', JSON.stringify(dto.hallazgos_otras));
    }
    if (dto.biologicos) {
      formData.append('biologicos', JSON.stringify(dto.biologicos));
    }

    if (dto.hierros && dto.hierros.length > 0) {
      dto.hierros.forEach((file) => formData.append('hierros', file));
    }

    const { data } = await apiClient.put<ApiResponse<AvalSanitario>>(`/avales/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: number): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete<{ status: string; message: string }>(`/avales/${id}`);
    return data;
  },
};

