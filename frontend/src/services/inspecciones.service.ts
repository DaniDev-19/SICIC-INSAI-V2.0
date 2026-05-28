import apiClient from '@/lib/api-client';
import type {
  Inspeccion,
  CreateInspeccionDto,
  UpdateInspeccionDto,
  InspeccionResponse,
} from '@/types/inspecciones';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export interface InspeccionCodigosPreview {
  t_codigo: string;
  n_control: string;
  estado_abrev: string;
  estado_sugerido_propiedad: string | null;
  estado_sugerido_empleado: string | null;
  inspector: { cedula: string; nombre: string | null };
  secuencia: string;
  prefijo: string;
}

const JSON_FIELDS = new Set([
  'finalidades',
  'insumos_consumidos',
  'fotos_eliminadas',
  'areas_inspeccion',
]);

function appendFormField(formData: FormData, key: string, val: unknown) {
  if (val === undefined || val === null) return;
  if (JSON_FIELDS.has(key)) {
    formData.append(key, JSON.stringify(val));
    return;
  }
  formData.append(key, String(val));
}

export const inspectionsService = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    planificacion_id?: number;
    q?: string;
  }): Promise<InspeccionResponse> => {
    const { data } = await apiClient.get<InspeccionResponse>('/inspecciones', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Inspeccion>> => {
    const { data } = await apiClient.get<ApiResponse<Inspeccion>>(`/inspecciones/${id}`);
    return data;
  },

  create: async ({
    data: payload,
    fotos,
  }: {
    data: CreateInspeccionDto;
    fotos?: File[];
  }): Promise<ApiResponse<Inspeccion>> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => appendFormField(formData, key, val));
    fotos?.forEach((foto) => formData.append('fotos', foto));

    const { data } = await apiClient.post<ApiResponse<Inspeccion>>('/inspecciones', formData);
    return data;
  },

  update: async ({
    id,
    data: payload,
    fotos,
  }: {
    id: number;
    data: UpdateInspeccionDto;
    fotos?: File[];
  }): Promise<ApiResponse<Inspeccion>> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => appendFormField(formData, key, val));
    fotos?.forEach((foto) => formData.append('fotos', foto));

    const { data } = await apiClient.put<ApiResponse<Inspeccion>>(`/inspecciones/${id}`, formData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/inspecciones/${id}`);
    return data;
  },

  export: async (params?: {
    status?: string;
    planificacion_id?: number;
    q?: string;
  }) => {
    const response = await apiClient.get('/inspecciones/export', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_inspecciones.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getReporte: async (id: number) => {
    const { data } = await apiClient.get<{ status: string; data: import('@/reports/acta-inspeccion/types').InspeccionReporteDto }>(
      `/inspecciones/${id}/reporte`
    );
    return data.data;
  },

  openPdfReport: async (id: number) => {
    const [{ generateActaPdfBlob }, reporte] = await Promise.all([
      import('@/reports/acta-inspeccion/generateActaPdf'),
      inspectionsService.getReporte(id),
    ]);
    const blob = await generateActaPdfBlob(reporte);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
  },

  previewCodigos: async (params: {
    planificacion_id: number;
    fecha_inspeccion: string;
    estado_abrev?: string;
    exclude_id?: number;
  }): Promise<ApiResponse<InspeccionCodigosPreview>> => {
    const { data } = await apiClient.get<ApiResponse<InspeccionCodigosPreview>>(
      '/inspecciones/preview-codigos',
      { params }
    );
    return data;
  },
};
