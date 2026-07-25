import type { Inspeccion } from './inspecciones';
import type { ActaSilo } from './acta_silos';

export interface SeguimientoFoto {
  id: number;
  seguimiento_id: number;
  imagen: string;
  created_at?: string;
}

export interface Seguimiento {
  id: number;
  fecha_seguimiento: string;
  hallazgos_seguimiento?: string | null;
  recomendaciones_cumplidas: boolean;
  status: 'EN_PROCESO' | 'CUMPLIDO' | 'CUARENTENA' | 'NO_CUMPLIDO' | string;
  inspeccion_id?: number | null;
  acta_silo_id?: number | null;
  created_at?: string;
  inspecciones?: Inspeccion | null;
  acta_silos?: ActaSilo | null;
  seguimiento_fotos?: SeguimientoFoto[];
}

export interface CreateSeguimientoDTO {
  fecha_seguimiento?: string;
  hallazgos_seguimiento: string;
  recomendaciones_cumplidas?: boolean;
  status?: string;
  inspeccion_id?: number;
  acta_silo_id?: number;
  fotos?: File[];
}

export interface UpdateSeguimientoDTO {
  fecha_seguimiento?: string;
  hallazgos_seguimiento?: string;
  recomendaciones_cumplidas?: boolean;
  status?: string;
  fotos?: File[];
}
