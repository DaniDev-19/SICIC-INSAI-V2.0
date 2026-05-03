
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

export interface CreatePlagaDto {
    nombre: string;
    nombre_cientifico?: string | null;
    descripcion?: string | null;
    tipo_plaga_id?: number | null;
}

export interface UpdatePlagaDto extends Partial<CreatePlagaDto> { }
