import apiClient from '@/lib/api-client';
import type { 
  CreateEmpleadoDto, 
  UpdateEmpleadoDto, 
  EmpleadoResponse, 
  SingleEmpleadoResponse,
  Cargo,
  Departamento,
  Profesion,
  Oficina,
  Contrato,
  CatalogoResponse
} from '@/types/empleados';
import type { SimpleResponse } from '@/types/pagination';

export const empleadosService = {
  getAll: async ({ search, ...params }: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    departamento_id?: string; 
    status_laboral?: string;
  }): Promise<EmpleadoResponse> => {
    const response = await apiClient.get<EmpleadoResponse>('/empleados', { 
      params: { ...params, q: search } 
    });
    return response.data;
  },

  getById: async (id: number): Promise<SingleEmpleadoResponse> => {
    const response = await apiClient.get<SingleEmpleadoResponse>(`/empleados/${id}`);
    return response.data;
  },

  create: async (data: FormData | CreateEmpleadoDto): Promise<SingleEmpleadoResponse> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.post<SingleEmpleadoResponse>('/empleados', data, { headers });
    return response.data;
  },

  update: async ({ id, data }: { id: number; data: FormData | UpdateEmpleadoDto }): Promise<SingleEmpleadoResponse> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.put<SingleEmpleadoResponse>(`/empleados/${id}`, data, { headers });
    return response.data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/empleados/${id}`);
    return response.data;
  },

  export: async (params?: { search?: string; departamento_id?: string; status_laboral?: string }) => {
    const response = await apiClient.get('/empleados/export', { 
      params: { ...params, q: params?.search }, 
      responseType: 'blob' 
    });
    let filename = 'reporte_empleados.xlsx';
    if (params?.search || params?.departamento_id || params?.status_laboral) {
      filename = 'reporte_empleados_filtrado.xlsx';
    }
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportPdf: async (params?: { search?: string; departamento_id?: string; status_laboral?: string }) => {
    const response = await apiClient.get('/empleados/export/pdf', { 
      params: { ...params, q: params?.search }, 
      responseType: 'blob' 
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => window.URL.revokeObjectURL(url), 120_000);
  },

  // Catálogos - Cargos
  getCargos: async (): Promise<CatalogoResponse<Cargo>> => {
    const response = await apiClient.get<CatalogoResponse<Cargo>>('/cargos');
    return response.data;
  },

  createCargo: async (nombre: string): Promise<CatalogoResponse<Cargo>> => {
    const response = await apiClient.post<CatalogoResponse<Cargo>>('/cargos', { nombre });
    return response.data;
  },

  updateCargo: async ({ id, nombre }: { id: number; nombre: string }): Promise<CatalogoResponse<Cargo>> => {
    const response = await apiClient.put<CatalogoResponse<Cargo>>(`/cargos/${id}`, { nombre });
    return response.data;
  },

  deleteCargo: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/cargos/${id}`);
    return response.data;
  },

  // Catálogos - Departamentos
  getDepartamentos: async (): Promise<CatalogoResponse<Departamento>> => {
    const response = await apiClient.get<CatalogoResponse<Departamento>>('/departamentos');
    return response.data;
  },

  createDepartamento: async (nombre: string): Promise<CatalogoResponse<Departamento>> => {
    const response = await apiClient.post<CatalogoResponse<Departamento>>('/departamentos', { nombre });
    return response.data;
  },

  updateDepartamento: async ({ id, nombre }: { id: number; nombre: string }): Promise<CatalogoResponse<Departamento>> => {
    const response = await apiClient.put<CatalogoResponse<Departamento>>(`/departamentos/${id}`, { nombre });
    return response.data;
  },

  deleteDepartamento: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/departamentos/${id}`);
    return response.data;
  },

  // Catálogos - Profesiones
  getProfesiones: async (): Promise<CatalogoResponse<Profesion>> => {
    const response = await apiClient.get<CatalogoResponse<Profesion>>('/profesion');
    return response.data;
  },

  createProfesion: async (nombre: string): Promise<CatalogoResponse<Profesion>> => {
    const response = await apiClient.post<CatalogoResponse<Profesion>>('/profesion', { nombre });
    return response.data;
  },

  updateProfesion: async ({ id, nombre }: { id: number; nombre: string }): Promise<CatalogoResponse<Profesion>> => {
    const response = await apiClient.put<CatalogoResponse<Profesion>>(`/profesion/${id}`, { nombre });
    return response.data;
  },

  deleteProfesion: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/profesion/${id}`);
    return response.data;
  },

  // Catálogos - Oficinas (Solo Lectura aquí, ya que es complejo)
  getOficinas: async (): Promise<CatalogoResponse<Oficina>> => {
    const response = await apiClient.get<CatalogoResponse<Oficina>>('/oficinas');
    return response.data;
  },

  // Catálogos - Contratos
  getContratos: async (): Promise<CatalogoResponse<Contrato>> => {
    const response = await apiClient.get<CatalogoResponse<Contrato>>('/contratos');
    return response.data;
  },

  createContrato: async (nombre: string): Promise<CatalogoResponse<Contrato>> => {
    const response = await apiClient.post<CatalogoResponse<Contrato>>('/contratos', { nombre });
    return response.data;
  },

  updateContrato: async ({ id, nombre }: { id: number; nombre: string }): Promise<CatalogoResponse<Contrato>> => {
    const response = await apiClient.put<CatalogoResponse<Contrato>>(`/contratos/${id}`, { nombre });
    return response.data;
  },

  deleteContrato: async (id: number): Promise<SimpleResponse> => {
    const response = await apiClient.delete<SimpleResponse>(`/contratos/${id}`);
    return response.data;
  }
};
