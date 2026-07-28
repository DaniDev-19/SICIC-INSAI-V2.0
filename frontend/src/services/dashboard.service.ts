import apiClient from '@/lib/api-client';

export interface AdminMetrics {
  totalPlanificaciones: number;
  totalInspecciones: number;
  totalEmpleados: number;
  totalPropiedades: number;
  totalProgramas: number;
  planificacionesPendientes: number;
  planificacionesEnProceso: number;
  planificacionesFinalizadas: number;
}

export interface InspectorMetrics {
  misPlanificaciones: number;
  misPendientes: number;
  misEnProceso: number;
  misFinalizadas: number;
  misInspecciones: number;
}

export interface TopInspector {
  id: number;
  nombreCompleto: string;
  cedula: string;
  planificacionesAsignadas: number;
}

export interface RecentActivityItem {
  id: number;
  n_control?: string;
  fecha_evaluacion?: string;
  status: string;
  propiedades?: {
    nombre_predio: string;
    codigo_propiedad: string;
  };
  programas?: {
    nombre: string;
  };
}

export interface ChartDataItem {
  name: string;
  planificaciones?: number;
  inspecciones?: number;
  misPlanificaciones?: number;
}

export interface DashboardResponse {
  status: string;
  roleType: 'admin' | 'inspector';
  data: {
    metrics: AdminMetrics | InspectorMetrics;
    recentActivity: RecentActivityItem[];
    topInspectores?: TopInspector[];
    chartData: ChartDataItem[];
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardResponse> => {
    const { data } = await apiClient.get<DashboardResponse>('/dashboard/stats');
    return data;
  },
};
