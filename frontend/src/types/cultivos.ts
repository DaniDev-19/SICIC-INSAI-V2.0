import type { ApiResponse, SimpleResponse } from "./pagination";

export interface TipoCultivo {
    id: number;
    nombre: string;
}

export interface Cultivo {
    id: number;
    nombre: string;
    nombre_cientifico: string | null;
    descripcion: string | null;
    tipo_cultivo_id: number | null;
    t_cultivo?: TipoCultivo;
}

export type CreateCultivoDto = Omit<Cultivo, 'id' | 't_cultivo'>;
export type UpdateCultivoDto = Partial<CreateCultivoDto>;

export type CultivoResponse = ApiResponse<Cultivo[]>;
export type TipoCultivoResponse = ApiResponse<TipoCultivo[]>;
export type { SimpleResponse };
