import type { ApiResponse, SimpleResponse } from "./pagination";

export interface TipoPrograma {
  id: number;
  nombre: string;
}

export interface Programa {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_programa_id?: number;
  t_programa?: TipoPrograma;
  programa_plaga?: { plagas: { id: number; nombre: string } }[];
  programa_cultivo?: { cultivo: { id: number; nombre: string } }[];
  programa_animales?: { animales: { id: number; nombre: string } }[];
  programa_enfermedades?: { enfermedades: { id: number; nombre: string } }[];
}

// DTOs
export interface CreateProgramaDto {
  nombre: string;
  descripcion?: string;
  tipo_programa_id?: number;
  plagas_ids?: number[];
  cultivos_ids?: number[];
  animales_ids?: number[];
  enfermedades_ids?: number[];
}

export type UpdateProgramaDto = Partial<CreateProgramaDto>;

// Responses
export type ProgramaResponse = ApiResponse<Programa[]>;
export type TipoProgramaResponse = ApiResponse<TipoPrograma[]>;
export type { SimpleResponse };
