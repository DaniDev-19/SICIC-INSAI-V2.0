import type { ApiResponse, SimpleResponse } from "./pagination";

export interface PlanificacionEmpleado {
  id: number;
  planificacion_id: number;
  empleado_id: number;
  empleados: {
    id: number;
    nombre: string;
    apellido: string;
    cargo?: string | null;
  };
}

export interface Planificacion {
  id: number;
  codigo: string | null;
  fecha_programada: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  actividad: string | null;
  objetivo: string | null;
  convocatoria: string | null;
  punto_encuentro: string | null;
  ubicacion: string | null;
  aseguramiento: string | null;
  vehiculo_id: number | null;
  solicitud_id: number;
  status: 'PENDIENTE' | 'INSPECCIONANDO' | 'FINALIZADA' | 'NO_APROBADA' | 'SEGUIMIENTO' | 'CUARENTENA' | 'NO_ATENDIDA';

  // Relations from backend include
  solicitudes?: {
    id: number;
    codigo: string;
    descripcion: string;
    clientes?: { nombre: string; cedula_rif?: string };
    propiedades?: { nombre: string };
    t_solicitud?: { id: number; nombre: string };
  };
  vehiculos?: {
    placa: string;
    marca: string | null;
    modelo: string | null;
  } | null;
  planificacion_empleados?: PlanificacionEmpleado[];
}

export interface CreatePlanificacionDto {
  fecha_programada: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  prioridad?: string;
  actividad?: string;
  objetivo?: string | null;
  convocatoria?: string | null;
  punto_encuentro?: string | null;
  ubicacion?: string | null;
  aseguramiento?: string | null;
  vehiculo_id?: number | null;
  solicitud_id: number;
  status?: string;
  empleados: number[];
}

export type UpdatePlanificacionDto = Partial<CreatePlanificacionDto>;
export type PlanificacionResponse = ApiResponse<Planificacion[]>;
export type { SimpleResponse };
