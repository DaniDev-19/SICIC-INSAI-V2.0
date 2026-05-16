import type { ApiResponse } from "./pagination";

export interface Oficina {
  id: number;
  nombre: string;
  ubicacion_gms?: string;
  es_centro_validacion: boolean;
  direccion?: string;
}

export interface CreateOficinaDto {
  nombre: string;
  ubicacion_gms?: string;
  es_centro_validacion?: boolean;
  direccion?: string;
}

export type UpdateOficinaDto = Partial<CreateOficinaDto>;

export type OficinaResponse = ApiResponse<Oficina[]>;
export type SingleOficinaResponse = ApiResponse<Oficina>;
