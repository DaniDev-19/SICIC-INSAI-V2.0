export interface InspeccionReporteDto {
  unidad: string;
  codigo_inspeccion: string;
  n_control: string;
  status: string;
  fecha_inspeccion: string;
  hora_inspeccion: string;
  justificacion_legal: string;
  areas: { nombre: string; checked: boolean }[];
  servidores: { orden: number; nombre: string; cedula: string }[];
  propietario: {
    nombre: string;
    cedula: string;
    runsai: string;
    correo: string;
    telefono: string;
  };
  atendido: {
    nombre: string;
    cedula: string;
    correo: string;
    telefono: string;
  };
  lugar: {
    nombre: string;
    rif: string;
    calle: string;
    sector: string;
    municipio: string;
    parroquia: string;
    estado: string;
    utm_norte: string;
    utm_este: string;
    utm_zona: string;
    tipo: string;
  };
  finalidades: { id: number; label: string; checked: boolean; detalle: string }[];
  aspectos_constatados: string;
  medidas_ordenadas: string;
  fotos: { id: number; dataUrl: string }[];
  cierre: {
    hora: string;
    dia: string;
    mes: string;
    anio: string;
    lugar: string;
  };
  vigencia_dias: string;
  posee_certificado: string;
  generado_el: string;
}

export const AREAS_INSPECCION_OPCIONES = [
  'Salud Vegetal Integral',
  'Salud Animal Integral',
  'Agroecología y Participación Popular',
  'Movilización',
  'Fiscalización Post - Registro',
] as const;
