export interface SeguimientoReporteDto {
  id: number;
  n_control: string;
  referencia_origen: string;
  fecha_seguimiento: string;
  status: string;
  recomendaciones_cumplidas: boolean;

  dictamen: {
    tipo: 'CONFORMIDAD' | 'INCUMPLIMIENTO' | 'EN_SEGUIMIENTO' | 'CUARENTENA';
    titulo: string;
    detalle: string;
  };

  hallazgos_seguimiento: string;
  aspectos_previos?: string;
  medidas_previas?: string;

  predio: {
    nombre: string;
    codigo_insai: string;
    hectareas: string;
    punto_referencia: string;
  };
  productor: {
    nombre: string;
    ci_rif: string;
    telefono: string;
  };
  ubicacion: {
    sector: string;
    parroquia: string;
    municipio: string;
    estado: string;
  };

  servidores: Array<{
    orden: number;
    nombre: string;
    cedula: string;
    cargo: string;
    oficina: string;
  }>;

  fotos: Array<{
    id: number;
    dataUrl: string;
  }>;
}
