import type { ApiResponse, SimpleResponse } from "./pagination";

export interface TipoEnfermedad {
    id: number;
    nombre: string;
}

export interface Enfermedad {
    id: number;
    nombre: string;
    nombre_cientifico: string | null;
    zoonatica: string | null;
    descripcion: string | null;
    tipo_enfermedad_id: number | null;
    t_enfermedades?: TipoEnfermedad;
}

// DTOs using utility types
export type CreateEnfermedadDto = Omit<Enfermedad, 'id' | 't_enfermedades'>;
export type UpdateEnfermedadDto = Partial<CreateEnfermedadDto>;

// Response types
export type EnfermedadResponse = ApiResponse<Enfermedad | Enfermedad[]>;
export type TipoEnfermedadResponse = ApiResponse<TipoEnfermedad[]>;
export type { SimpleResponse };
