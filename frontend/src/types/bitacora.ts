export interface BitacoraLog {
  id: number;
  fecha: string;
  accion: string;
  modulo: string;
  usuario_global_id: number;
  empleado_id: number | null;
  username_log: string;
  payload_previo: any;
  payload_nuevo: any;
  empleados?: {
    nombre: string;
    apellido: string;
  };
}

import type { RawPagination } from "./pagination";

export interface BitacoraResponse {
  status: string;
  data: BitacoraLog[];
  pagination: RawPagination;
}
