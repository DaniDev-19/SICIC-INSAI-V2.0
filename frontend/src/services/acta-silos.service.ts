import apiClient from '@/lib/api-client';
import type {
  ActaSilo,
  CreateActaSiloDto,
  UpdateActaSiloDto,
  ActaSiloResponse,
} from '@/types/acta_silos';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';
import type { ActaSiloReporteDto } from '@/reports/acta-silo/types';

const JSON_FIELDS = new Set([
  'insumos_consumidos',
  'fotos_eliminadas',
]);

function appendFormField(formData: FormData, key: string, val: unknown) {
  if (val === undefined || val === null) return;
  if (JSON_FIELDS.has(key)) {
    formData.append(key, JSON.stringify(val));
    return;
  }
  formData.append(key, String(val));
}

export const actaSilosService = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    planificacion_id?: number;
    q?: string;
  }): Promise<ActaSiloResponse> => {
    const { data } = await apiClient.get<ActaSiloResponse>('/acta_silos', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<ActaSilo>> => {
    const { data } = await apiClient.get<ApiResponse<ActaSilo>>(`/acta_silos/${id}`);
    return data;
  },

  create: async ({
    data: payload,
    fotos,
  }: {
    data: CreateActaSiloDto;
    fotos?: File[];
  }): Promise<ApiResponse<ActaSilo>> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => appendFormField(formData, key, val));
    fotos?.forEach((foto) => formData.append('fotos', foto));

    const { data } = await apiClient.post<ApiResponse<ActaSilo>>('/acta_silos', formData);
    return data;
  },

  update: async ({
    id,
    data: payload,
    fotos,
  }: {
    id: number;
    data: UpdateActaSiloDto;
    fotos?: File[];
  }): Promise<ApiResponse<ActaSilo>> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => appendFormField(formData, key, val));
    fotos?.forEach((foto) => formData.append('fotos', foto));

    const { data } = await apiClient.put<ApiResponse<ActaSilo>>(`/acta_silos/${id}`, formData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/acta_silos/${id}`);
    return data;
  },

  getReporte: async (id: number): Promise<ActaSiloReporteDto> => {
    const { data } = await apiClient.get<{ status: string; data: ActaSiloReporteDto }>(
      `/acta_silos/${id}/reporte`
    );
    return data.data;
  },

  openPdfReport: async (id: number) => {
    const [{ generateActaSiloPdfBlob }, reporteRes] = await Promise.all([
      import('@/reports/acta-silo/generateActaSiloPdf'),
      apiClient.get<{ status: string; data: ActaSiloReporteDto }>(`/acta_silos/${id}/reporte`),
    ]);
    const blob = await generateActaSiloPdfBlob(reporteRes.data.data);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
  },
};
