import type { ApiResponse, SimpleResponse } from "./pagination";

export interface Planificacion {
  id: number;
  codigo: string | null;
  fecha_programada: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  prioridad: string;
  actividad: string | null;
  objetivo: string | null;
  convocatoria: string | null;
  punto_encuentro: string | null;
  ubicacion: string | null;
  aseguramiento: string | null;
  vehiculo_id: number | null;
  solicitud_id: number;
  status: string;
  created_at: string;
  updated_at: string;

  planificacion_empleados?: any[];
}

export type CreatePlanificacionDto = Omit<Planificacion,
  | 'id'
  | 'codigo'
  | 'status'
  | 'created_at'
  | 'updated_at'
  | 'planificacion_empleados'
> & {
  empleados: number[];
};

export type UpdatePlanificacionDto = Partial<CreatePlanificacionDto>;
export type PlanificacionResponse = ApiResponse<Planificacion[]>;
export type { SimpleResponse };
