export interface ActaSiloReporteDto {
  id: number;
  n_control: string;
  semana_epid: string;
  fecha_notificacion: string;
  lugar_ubicacion: string;
  cant_nacional: number;
  cant_importado: number;
  cant_afectado: number;
  cant_afectado_porcentaje: number;
  n_silos: string;
  n_galpones: string;
  c_instalada: string;
  c_operativa: string;
  c_almacenamiento: string;
  destino_objetivo: string;
  observaciones: string;
  medidas_recomendadas: string;
  evento: string;
  unidad_medida: string;
  justificacion_legal: string;
  servidores: { orden: number; nombre: string; cedula: string }[];
  propietario: {
    nombre: string;
    cedula: string;
    runsai: string;
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
    tipo: string;
  };
  fotos: { id: number; dataUrl: string }[];
  cierre: {
    dia: string;
    mes: string;
    anio: string;
    lugar: string;
  };
  generado_el: string;
}
