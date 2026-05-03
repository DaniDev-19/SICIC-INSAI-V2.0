
export interface TipoAnimal {
    id: number;
    nombre: string;
}

export interface Animal {
    id: number;
    nombre: string;
    nombre_cientifico: string | null;
    dieta: string | null;
    esperanza_vida: string | null;
    habitat_principal: string | null;
    peso_promedio_kg: number | null;
    longitud_promedio_mt: number | null;
    descripcion: string | null;
    tipo_animal_id: number | null;
    t_animales?: TipoAnimal;
}

export interface CreateAnimalDto {
    nombre: string;
    nombre_cientifico?: string | null;
    dieta?: string | null;
    esperanza_vida?: string | null;
    habitat_principal?: string | null;
    peso_promedio_kg?: number | null;
    longitud_promedio_mt?: number | null;
    descripcion?: string | null;
    tipo_animal_id?: number | null;
}

export interface UpdateAnimalDto extends Partial<CreateAnimalDto> { }
