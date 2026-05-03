import type { PaginationData } from "./pagination";

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

export interface CreateCultivoDto {
    nombre: string;
    nombre_cientifico?: string | null;
    descripcion?: string | null;
    tipo_cultivo_id?: number | null;
}

export interface UpdateCultivoDto extends Partial<CreateCultivoDto> { }



export interface CultivoResponse {
    status: 'success' | 'error' | 'warning';
    message?: string;
    data: Cultivo | Cultivo[];
    pagination?: PaginationData;
}

export interface TipoCultivoResponse {
    status: 'success' | 'error';
    data: TipoCultivo[];
}
