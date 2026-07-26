export interface AvalHallazgosBovBuf {
  id?: number;
  aval_id?: number;
  t_toros?: number;
  t_vacas?: number;
  t_novillos?: number;
  t_novillas?: number;
  t_mautes_m?: number;
  t_mautes_h?: number;
  t_becerros?: number;
  t_becerras?: number;
  t_bufalos?: number;
  t_bufalas?: number;
  t_buvillos?: number;
  t_buvillas?: number;
  t_bumautes_m?: number;
  t_bumautes_h?: number;
  t_bucerros?: number;
  t_bucerras?: number;
  total_bov_buf?: number;
}

export interface AvalHallazgosOtras {
  id?: number;
  aval_id?: number;
  tipo_animal_id: number;
  machos: number;
  hembras: number;
  crias: number;
  total?: number;
  t_animales?: {
    id: number;
    nombre: string;
  };
}

export interface AvalBiologico {
  id?: number;
  aval_id?: number;
  insumo_id: number;
  oficina_id?: number;
  cantidad?: number;
  lote?: string;
  fecha_vacunacion?: string;
  pruebas_diagnosticas?: string;
  insumos?: {
    id: number;
    nombre: string;
    codigo?: string;
    t_unidades?: {
      nombre: string;
    };
  };
}

export interface AvalHierro {
  id?: number;
  aval_id?: number;
  hierro_img_url: string;
}

export interface AvalSanitario {
  id: number;
  numero_aval: string;
  codigo_predio?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  certificado_vacunacion_n?: string;
  observaciones?: string;
  inspeccion_id?: number;
  medico_responsable_id?: number;
  jefe_osa_id?: number;
  created_at?: string;

  // Relaciones
  inspecciones?: {
    id: number;
    n_control: string;
    fecha_inspeccion?: string;
    atendido_por_nombre?: string;
  };
  empleados_avales_sanitarios_medico_responsable_idToempleados?: {
    id: number;
    nombre: string;
    apellido: string;
    cedula?: string;
  };
  empleados_avales_sanitarios_jefe_osa_idToempleados?: {
    id: number;
    nombre: string;
    apellido: string;
    cedula?: string;
  };

  aval_hallazgos_bov_buf?: AvalHallazgosBovBuf[];
  aval_hallazgos_otras?: AvalHallazgosOtras[];
  aval_biologicos?: AvalBiologico[];
  aval_hierros?: AvalHierro[];
}

export interface CreateAvalDTO {
  numero_aval: string;
  codigo_predio?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  certificado_vacunacion_n?: string;
  observaciones?: string;
  inspeccion_id?: number | null;
  medico_responsable_id?: number | null;
  jefe_osa_id?: number | null;
  hallazgos_bov_buf?: AvalHallazgosBovBuf;
  hallazgos_otras?: AvalHallazgosOtras[];
  biologicos?: {
    insumo_id: number;
    oficina_id: number;
    cantidad: number;
    lote?: string;
    fecha_vacunacion?: string;
    pruebas_diagnosticas?: string;
  }[];
  hierros?: File[];
}

export type UpdateAvalDTO = Partial<CreateAvalDTO>;
