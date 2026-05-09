import type { ApiResponse, SimpleResponse } from "./pagination";

export interface TipoPropiedad {
  id: number;
  nombre: string;
}

export interface PropiedadHierro {
  id: number;
  num_reg_hierro: string | null;
  num_reg_ganadero: string | null;
  hierro_img_url: string | null;
}

export interface PropiedadUbicacion {
  id: number;
  sector_id: number;
  google_maps_url: string | null;
  sectores?: {
    id: number;
    nombre: string;
    parroquia_id: number;
  };
}

export interface Propiedad {
  id: number;
  codigo_insai: string | null;
  nombre: string;
  rif: string | null;
  punto_referencia: string | null;
  hectareas_totales: number | null;
  status: string;
  tipo_propiedad_id: number | null;
  due_o_id: number;
  created_at: string;
  updated_at: string;

  clientes?: {
    id: number;
    nombre: string;
    cedula_rif: string;
  };
  t_propiedad?: TipoPropiedad;
  propiedad_hierro?: PropiedadHierro[];
  propiedad_ubicacion?: PropiedadUbicacion[];
  propiedad_cultivo?: any[];
  propiedad_animales?: any[];
}


export type CreatePropiedadDto = Omit<Propiedad,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'clientes'
  | 't_propiedad'
  | 'propiedad_hierro'
  | 'propiedad_ubicacion'
  | 'propiedad_cultivo'
  | 'propiedad_animales'
>;

export type UpdatePropiedadDto = Partial<CreatePropiedadDto>;
export type PropiedadResponse = ApiResponse<Propiedad[]>;
export type TipoPropiedadResponse = ApiResponse<TipoPropiedad[]>;
export type { SimpleResponse };
