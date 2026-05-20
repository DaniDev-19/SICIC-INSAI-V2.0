import type { ApiResponse, SimpleResponse } from "./pagination";

export interface Vehiculo {
  id: number;
  placa: string;
  marca: string | null;
  modelo: string | null;
  tipo: 'MOTO' | 'CARRO' | 'CAMIONETA' | 'OTRO' | null;
  color: string | null;
  status: string;
}

export type CreateVehiculoDto = Omit<Vehiculo, 'id'>;
export type UpdateVehiculoDto = Partial<CreateVehiculoDto>;

export type VehiculoResponse = ApiResponse<Vehiculo[]>;
export type { SimpleResponse };
