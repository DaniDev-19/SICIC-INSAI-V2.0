import apiClient from '@/lib/api-client';
import type { AvalSanitario, CreateAvalDTO, UpdateAvalDTO } from '@/types/avales';
import type { ApiResponse } from '@/types/pagination';

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
