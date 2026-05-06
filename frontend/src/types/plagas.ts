import type { ApiResponse, SimpleResponse } from "./pagination";

export interface TipoPlaga {
    id: number;
    nombre: string;
}

export interface Plaga {
    id: number;
    nombre: string;
    nombre_cientifico: string | null;
    descripcion: string | null;
    tipo_plaga_id: number | null;
    t_plagas?: TipoPlaga;
}

export type CreatePlagaDto = Omit<Plaga, 'id' | 't_plagas'>;
export type UpdatePlagaDto = Partial<CreatePlagaDto>;

export type PlagaResponse = ApiResponse<Plaga | Plaga[]>;
export type TipoPlagaResponse = ApiResponse<TipoPlaga[]>;
export type { SimpleResponse };
