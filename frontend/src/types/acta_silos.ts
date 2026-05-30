import type { ApiResponse, SimpleResponse } from "./pagination";

export interface SiloFoto {
  id: number;
  acta_silo_id: number;
  imagen: string;
  created_at: string;
}

export interface ActaSilo {
  id: number;
  semana_epid: string | null;
  fecha_notificacion: string | null;
  lugar_ubicacion: string | null;
  cant_nacional: number | null;
  cant_importado: number | null;
  cant_afectado: number | null;
  cant_afectado_porcentaje: number | null;
  n_silos: string | null;
  n_galpones: string | null;
  c_instalada: string | null;
  c_operativa: string | null;
  c_almacenamiento: string | null;
  destino_objetivo: string | null;
  observaciones: string | null;
  medidas_recomendadas: string | null;
  evento_id: number | null;
  unidad_medida_id: number | null;
  planificacion_id: number;
  created_at: string;
  updated_at: string;
  planificaciones?: {
    id: number;
    codigo: string | null;
    fecha_programada: string;
    solicitudes?: {
      id: number;
      codigo: string;
      descripcion: string;
      clientes?: { nombre: string; cedula_rif: string };
      propiedades?: { nombre: string; rif: string | null };
      t_solicitud?: { nombre: string };
    };
    vehiculos?: { placa: string; marca: string | null; modelo: string | null } | null;
    planificacion_empleados?: Array<{
      empleados: {
        id: number;
        nombre: string;
        apellido: string;
        cedula: string;
      };
    }>;
  };
  t_unidades?: {
    id: number;
    nombre: string;
    abreviatura: string | null;
  } | null;
  t_evento?: {
    id: number;
    nombre: string;
  } | null;
  silo_fotos?: SiloFoto[];
}

export interface CreateActaSiloDto {
  semana_epid?: string | null;
  fecha_notificacion?: string;
  lugar_ubicacion?: string | null;
  cant_nacional?: number | null;
  cant_importado?: number | null;
  cant_afectado?: number | null;
  cant_afectado_porcentaje?: number | null;
  n_silos?: string | null;
  n_galpones?: string | null;
  c_instalada?: string | null;
  c_operativa?: string | null;
  c_almacenamiento?: string | null;
  destino_objetivo?: string | null;
  observaciones?: string | null;
  medidas_recomendadas?: string | null;
  evento_id?: number | null;
  unidad_medida_id?: number | null;
  planificacion_id: number;
  insumos_consumidos?: Array<{
    insumo_id: number;
    oficina_id: number;
    cantidad: number;
    lote?: string | null;
  }>;
}

export type UpdateActaSiloDto = Partial<CreateActaSiloDto> & {
  fotos_eliminadas?: number[];
};

export type ActaSiloResponse = ApiResponse<ActaSilo[]>;
export type { SimpleResponse };
