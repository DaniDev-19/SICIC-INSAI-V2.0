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

const JSON_FIELDS = new Set(['finalidades', 'insumos_consumidos']);

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

    const { data } = await apiClient.post<ApiResponse<Inspeccion>>('/inspecciones', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

    const { data } = await apiClient.put<ApiResponse<Inspeccion>>(`/inspecciones/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/inspecciones/${id}`);
    return data;
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
