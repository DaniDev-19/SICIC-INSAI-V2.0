export interface AnimalesVacunadosBovinos {
  toros: number | string;
  vacas: number | string;
  novillos: number | string;
  novillas: number | string;
  mautes: number | string;
  mautas: number | string;
  becerros: number | string;
  becerras: number | string;
  total: number;
}

export interface AnimalesVacunadosBufalos {
  bufalos: number | string;
  bufalas: number | string;
  buvillos: number | string;
  buvillas: number | string;
  bumautes: number | string;
  bumautas: number | string;
  bucerros: number | string;
  bucerras: number | string;
  total: number;
}

export interface EspecieItem {
  nombre?: string;
  machos: number | string;
  hembras: number | string;
  crias: number | string;
  total: number;
}

export interface AnimalesOtrasEspecies {
  ovinos: EspecieItem;
  caprinos: EspecieItem;
  porcinos: EspecieItem;
  aves: EspecieItem;
  equinos: EspecieItem;
  otros: EspecieItem;
}

export interface BiologicoReporteItem {
  vacuna: string;
  lote: string;
  marca: string;
  fecha_vacunacion: string;
  pruebas_diagnosticas: string;
}

export interface AvalSanitarioReporteDto {
  id: number;
  numero_aval: string;
  osa: string;
  hierro_img_url?: string | null;

  // Datos del Predio y Propietario
  predio: string;
  propietario: string;
  ci_rif: string;
  num_reg_hierro: string;
  num_reg_ganadero: string;
  codigo_predio: string;

  // Ubicación
  sector: string;
  parroquia: string;
  municipio: string;
  estado: string;

  // Animales
  bovinos: AnimalesVacunadosBovinos;
  bufalos: AnimalesVacunadosBufalos;
  total_bov_buf: number;
  otras_especies: AnimalesOtrasEspecies;

  // Biológicos
  biologicos: BiologicoReporteItem[];

  // Validaciones y Firmas
  medico_responsable: {
    nombre: string;
    cedula: string;
    n_insai: string;
    n_cmv: string;
  };
  jefe_osa: {
    nombre: string;
  };
  certificado_vacunacion_n: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  observaciones: string;
}
