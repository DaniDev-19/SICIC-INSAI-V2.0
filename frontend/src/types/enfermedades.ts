
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

export interface CreateEnfermedadDto {
    nombre: string;
    nombre_cientifico?: string | null;
    zoonatica?: string | null;
    descripcion?: string | null;
    tipo_enfermedad_id?: number | null;
}

export interface UpdateEnfermedadDto extends Partial<CreateEnfermedadDto> { }
