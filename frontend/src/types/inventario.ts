export interface CategoriaInsumo {
  id: number;
  nombre: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  tipo?: string | null;
}

export interface Insumo {
  id: number;
  codigo?: string | null;
  nombre: string;
  marca?: string | null;
  descripcion?: string | null;
  categoria_id?: number | null;
  unidad_medida_id?: number | null;
  created_at?: string;
  c_insumos?: CategoriaInsumo | null;
  t_unidades?: UnidadMedida | null;
}

export interface InsumoStock {
  id: number;
  insumo_id: number;
  oficina_id: number;
  lote?: string | null;
  fecha_vencimiento?: string | null;
  stock_actual: number | string;
  stock_minimo: number | string;
  created_at?: string;
  updated_at?: string;
  insumos?: Insumo;
  oficinas?: {
    id: number;
    nombre: string;
  };
}

export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE_MAS' | 'AJUSTE_MENOS' | 'CONSUMO';

export interface MovimientoInsumo {
  id: number;
  insumo_id: number;
  oficina_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number | string;
  lote?: string | null;
  inspeccion_id?: number | null;
  acta_silo_id?: number | null;
  seguimiento_id?: number | null;
  aval_id?: number | null;
  empleado_id?: number | null;
  observaciones?: string | null;
  created_at?: string;
  insumos?: Insumo;
  oficinas?: {
    id: number;
    nombre: string;
  };
  empleados?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
  inspecciones?: {
    id: number;
    n_control: string;
  } | null;
  avales_sanitarios?: {
    id: number;
    numero_aval: string;
  } | null;
  acta_silos?: {
    id: number;
    n_silos?: string | null;
  } | null;
}

export interface CreateInsumoDTO {
  codigo?: string;
  nombre: string;
  marca?: string;
  descripcion?: string;
  categoria_id?: number | null;
  unidad_medida_id?: number | null;
}

export interface UpdateInsumoDTO {
  codigo?: string;
  nombre?: string;
  marca?: string;
  descripcion?: string;
  categoria_id?: number | null;
  unidad_medida_id?: number | null;
}

export interface ManualMovimientoDTO {
  insumo_id: number;
  oficina_id: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  lote?: string;
  fecha_vencimiento?: string;
  observaciones?: string;
}

export interface InventarioKPIs {
  totalInsumos: number;
  totalStockItems: number;
  stockBajoCount: number;
  totalMovimientos: number;
}
