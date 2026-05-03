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

export interface CreateProgramaDto {
  nombre: string;
  descripcion?: string;
  tipo_programa_id?: number;
  plagas_ids?: number[];
  cultivos_ids?: number[];
  animales_ids?: number[];
  enfermedades_ids?: number[];
}

export interface UpdateProgramaDto extends Partial<CreateProgramaDto> {}

export interface ProgramaResponse {
  status: string;
  data: Programa[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
