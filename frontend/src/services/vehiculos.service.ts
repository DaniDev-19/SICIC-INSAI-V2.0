import apiClient from '@/lib/api-client';
import type { 
  Vehiculo, 
  CreateVehiculoDto, 
  UpdateVehiculoDto, 
  VehiculoResponse 
} from '@/types/vehiculos';
import type { ApiResponse, SimpleResponse } from '@/types/pagination';

export const vehiculosService = {
  getAll: async (params: { page?: number; limit?: number; status?: string; tipo?: string }): Promise<VehiculoResponse> => {
    const { data } = await apiClient.get<VehiculoResponse>('/vehiculos', { params });
    return data;
  },

  getById: async (id: number): Promise<ApiResponse<Vehiculo>> => {
    const { data } = await apiClient.get<ApiResponse<Vehiculo>>(`/vehiculos/${id}`);
    return data;
  },

  create: async (vehiculo: CreateVehiculoDto): Promise<ApiResponse<Vehiculo>> => {
    const { data } = await apiClient.post<ApiResponse<Vehiculo>>('/vehiculos', vehiculo);
    return data;
  },

  update: async ({ id, data: updateData }: { id: number; data: UpdateVehiculoDto }): Promise<ApiResponse<Vehiculo>> => {
    const { data } = await apiClient.put<ApiResponse<Vehiculo>>(`/vehiculos/${id}`, updateData);
    return data;
  },

  delete: async (id: number): Promise<SimpleResponse> => {
    const { data } = await apiClient.delete<SimpleResponse>(`/vehiculos/${id}`);
    return data;
  },

  deleteMany: async (ids: number[]): Promise<SimpleResponse> => {
    const { data } = await apiClient.post<SimpleResponse>('/vehiculos/bulk-delete', { ids });
    return data;
  },
};
