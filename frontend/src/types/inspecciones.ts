import type { ApiResponse, SimpleResponse } from "./pagination";

export interface InspeccionFoto {
  id: number;
  imagen: string;
  inspeccion_id: number;
  created_at: string;
}

export interface FinalidadInspeccion {
  id: number;
  inspeccion_id: number;
  finalidad_id: number;
  objetivo: string | null;
  finalidad?: {
    id: number;
    nombre: string;
  };
}

export type InspeccionStatus =
  | 'PENDIENTE'
  | 'INSPECCIONANDO'
  | 'FINALIZADA'
  | 'NO_APROBADA'
  | 'SEGUIMIENTO'
  | 'CUARENTENA'
  | 'NO_ATENDIDA';

export interface Inspeccion {
  id: number;
  n_control: string;
  t_codigo: string | null;
  fecha_inspeccion: string;
  hora_inspeccion: string | null;
  atendido_por_nombre: string | null;
  atendido_por_cedula: string | null;
  atendido_por_email: string | null;
  atendido_por_tlf: string | null;
  insp_utm_norte: number | null;
  insp_utm_este: number | null;
  insp_utm_zona: string | null;
  google_maps_url: string | null;
  aspectos_constatados: string | null;
  medidas_ordenadas: string | null;
  posee_certificado: string | null;
  vigencia_dias: number | null;
  status: InspeccionStatus;
  created_at: string;
  updated_at: string;
  planificacion_id: number | null;
  planificaciones?: {
    id: number;
    codigo: string | null;
    fecha_programada: string;
    solicitudes?: {
      id: number;
      codigo: string;
      descripcion: string;
      clientes?: { nombre: string };
      propiedades?: { nombre: string };
      t_solicitud?: { nombre: string };
    };
    vehiculos?: { placa: string; marca: string | null; modelo: string | null } | null;
    planificacion_empleados?: Array<{
      empleados: {
        id: number;
        nombre: string;
        apellido: string;
      };
    }>;
  };
  finalidad_inspeccion?: FinalidadInspeccion[];
  inspeccion_fotos?: InspeccionFoto[];
  avales_sanitarios?: unknown[];
  epidemiologia_hallazgos?: unknown[];
  seguimiento_inspecciones?: unknown[];
}

export interface FinalidadPayload {
  finalidad_id: number;
  objetivo?: string;
}

export interface CreateInspeccionDto {
  estado_abrev?: string;
  fecha_inspeccion: string;
  hora_inspeccion?: string;
  atendido_por_nombre?: string;
  atendido_por_cedula?: string;
  atendido_por_email?: string;
  atendido_por_tlf?: string;
  insp_utm_norte?: number;
  insp_utm_este?: number;
  insp_utm_zona?: string;
  google_maps_url?: string;
  aspectos_constatados?: string;
  medidas_ordenadas?: string;
  posee_certificado?: string;
  vigencia_dias?: number;
  status?: InspeccionStatus;
  planificacion_id: number;
  finalidades?: FinalidadPayload[];
}

export type UpdateInspeccionDto = Partial<CreateInspeccionDto> & { estado_abrev?: string };
export type InspeccionResponse = ApiResponse<Inspeccion[]>;
export type { SimpleResponse };
