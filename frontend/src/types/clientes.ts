import type { ApiResponse, SimpleResponse } from "./pagination";

export interface Cliente {
  id: number;
  cedula_rif: string;
  nombre: string;
  codigo_runsai?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion_fiscal?: string | null;
  created_at: string;
  propiedades?: any[];
}

export type CreateClienteDto = Omit<Cliente, 'id' | 'created_at' | 'propiedades'>;
export type UpdateClienteDto = Partial<CreateClienteDto>;


export type ClienteResponse = ApiResponse<Cliente[]>;
export type { SimpleResponse };
