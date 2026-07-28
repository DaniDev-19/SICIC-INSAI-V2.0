import apiClient from '@/lib/api-client';

export interface PlantillaCorreo {
  id: string;
  nombre: string;
  categoria: string;
  icono: string;
  asunto: string;
  descripcion: string;
  cuerpo: string;
}

export interface SendComunicadoPayload {
  empleado_ids: number[] | 'ALL';
  asunto: string;
  mensaje: string;
  motivo?: string;
}

export interface SendComunicadoResponse {
  status: string;
  message: string;
  data: {
    total: number;
    enviados: number;
    fallidos: number;
    detallesEnvios: Array<{ empleado_id: number; nombre: string; email: string; exito?: boolean; simulacion?: boolean }>;
    detallesFallidos: Array<{ empleado_id: number; nombre: string; email?: string; motivo: string }>;
    simulado: boolean;
  };
}

export const mailService = {
  getPlantillas: async (): Promise<PlantillaCorreo[]> => {
    const response = await apiClient.get<{ status: string; data: PlantillaCorreo[] }>('/mail/plantillas');
    return response.data.data;
  },

  sendComunicado: async (payload: SendComunicadoPayload): Promise<SendComunicadoResponse> => {
    const response = await apiClient.post<SendComunicadoResponse>('/mail/send-comunicado', payload);
    return response.data;
  }
};
