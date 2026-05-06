import type { ApiResponse, SimpleResponse } from "./pagination";

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

export type CreateAnimalDto = Omit<Animal, 'id' | 't_animales'>;
export type UpdateAnimalDto = Partial<CreateAnimalDto>;

export type AnimalResponse = ApiResponse<Animal[]>;
export type TipoAnimalResponse = ApiResponse<TipoAnimal[]>;
export type { SimpleResponse };