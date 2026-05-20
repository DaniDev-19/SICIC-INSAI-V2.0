import type { ApiResponse, SimpleResponse } from "./pagination";
import type { CreatePlanificacionDto } from "./planificaciones";

export type EstatusSolicitud =
  | 'CREADA'
  | 'DIAGNOSTICADA'
  | 'PLANIFICADA'
  | 'INSPECCIONANDO'
  | 'FINALIZADA'
  | 'NO_APROBADA'
  | 'SEGUIMIENTO'
  | 'CUARENTENA'
  | 'NO_ATENDIDA';

export type PrioridadSolicitud = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type MedioRecepcion = 'WEB' | 'TELEFONO' | 'PRESENCIAL' | 'CORREO' | 'OFICIO';

export interface TipoSolicitud {
  id: number;
  nombre: string;
}

export interface Solicitud {
  id: number;
  codigo: string | null;
  descripcion: string;
  fecha_solicitada: string;
  fecha_resolucion: string | null;
  estatus: EstatusSolicitud;
  prioridad: PrioridadSolicitud;
  medio_recepcion: MedioRecepcion;
  tipo_solicitud_id: number;
  solicitante_id: number;
  atendido_por_id: number | null;
  propiedad_id: number;
  created_at: string;
  updated_at: string;

  clientes?: {
    id: number;
    nombre: string;
    cedula_rif: string;
  };
  propiedades?: {
    id: number;
    nombre: string;
    codigo_insai: string | null;
  };
  t_solicitud?: TipoSolicitud;
  empleados?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export type CreateSolicitudDto = Omit<Solicitud,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'clientes'
  | 'propiedades'
  | 't_solicitud'
  | 'empleados'
  | 'fecha_solicitada'
> & {
  planificacion?: Omit<CreatePlanificacionDto, 'solicitud_id'>;
};

export type UpdateSolicitudDto = Partial<CreateSolicitudDto>;
export type SolicitudResponse = ApiResponse<Solicitud[]>;
export type TipoSolicitudResponse = ApiResponse<TipoSolicitud[]>;
export type { SimpleResponse };
