import type { ApiResponse, SimpleResponse } from "./pagination";

export interface Cargo {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
}

export interface Profesion {
  id: number;
  nombre: string;
}

export interface Oficina {
  id: number;
  nombre: string;
}

export interface Contrato {
  id: number;
  nombre: string;
}

export interface EmpleadoFoto {
  id: number;
  foto_url: string;
  created_at: string;
}

export interface EmpleadoResidencia {
  id: number;
  sector_id?: number;
  direccion_detallada?: string;
  punto_referencia?: string;
  google_maps_url?: string;
  es_principal: boolean;
  sectores?: {
    id: number;
    nombre: string;
  };
}

export interface Empleado {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  fechas_ingreso?: string;
  status_laboral: string;
  contrato_id?: number;
  cargo_id?: number;
  departamento_id?: number;
  profesion_id?: number;
  oficina_id?: number;
  usuario_global_id?: number;
  created_at: string;
  
  // Relaciones
  cargos?: Cargo;
  departamentos?: Departamento;
  profesiones?: Profesion;
  oficinas?: Oficina;
  contrato?: Contrato;
  empleado_foto?: EmpleadoFoto[];
  empleado_residencia?: EmpleadoResidencia[];
  empleados_programas?: {
    programas: {
      id: number;
      nombre: string;
    };
  }[];
}

export interface CreateEmpleadoDto {
  cedula: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  fechas_ingreso?: string;
  status_laboral?: string;
  contrato_id?: number;
  cargo_id?: number;
  departamento_id?: number;
  profesion_id?: number;
  oficina_id?: number;
  usuario_global_id?: number;
  
  // Relaciones anidadas
  foto_url?: string;
  residencia?: Partial<EmpleadoResidencia>;
  programas_ids?: number[];
}

export type UpdateEmpleadoDto = Partial<CreateEmpleadoDto>;

export type EmpleadoResponse = ApiResponse<Empleado[]>;
export type SingleEmpleadoResponse = ApiResponse<Empleado>;
export type CatalogoResponse<T> = ApiResponse<T[]>;
export type { SimpleResponse };
