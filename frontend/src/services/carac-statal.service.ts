import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { openCaracStatalPdf } from '@/reports/ejecutivos/generateEjecutivoNuevosPdf';

export interface CaracStatalMunicipioRow {
  id: number;
  municipio: string;
  estado: string;
  area_km2: number;
  area_km2_formatted: string;
  num_veterinarios_oficiales: number;
  num_paraveterinarios_oficiales: number;
  num_administrativos_oficiales: number;
  num_vehiculos_operativos: number;
  num_predios: number;
  bovinos: number;
  bufalinos: number;
  porcinos: number;
  pequenos_rumiantes: number;
  equidos: number;
  aves: number;
}

export interface CaracStatalReporteData {
  estado: string;
  records: CaracStatalMunicipioRow[];
  totales: {
    area_km2: number;
    num_veterinarios_oficiales: number;
    num_paraveterinarios_oficiales: number;
    num_administrativos_oficiales: number;
    num_vehiculos_operativos: number;
    num_predios: number;
    bovinos: number;
    bufalinos: number;
    porcinos: number;
    pequenos_rumiantes: number;
    equidos: number;
    aves: number;
  };
}

export const caracStatalService = {
  getReporte: async (estadoId?: number | string): Promise<CaracStatalReporteData> => {
    const params: any = {};
    if (estadoId && estadoId !== 'todos' && estadoId !== 'all') {
      params.estado_id = estadoId;
    }
    const { data } = await apiClient.get<{ status: string; data: CaracStatalReporteData }>('/carac_statal/reporte', {
      params,
    });
    return data.data;
  },

  exportExcel: async (estadoId?: number | string) => {
    const toastId = toast.loading('Generando Caracterización Estatal en Excel...');
    try {
      const params: any = {};
      if (estadoId && estadoId !== 'todos' && estadoId !== 'all') {
        params.estado_id = estadoId;
      }
      const response = await apiClient.get('/carac_statal/export/excel', {
        params,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'caracterizacion_estatal_oficial.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo Excel descargado con éxito', { id: toastId });
    } catch (error) {
      console.error('Error al exportar Excel de Caracterización Estatal:', error);
      toast.error('Error al generar el archivo Excel de Caracterización Estatal', { id: toastId });
    }
  },

  exportPdf: async (reporteData?: CaracStatalReporteData, estadoId?: number | string) => {
    const toastId = toast.loading('Compilando Caracterización Estatal en PDF...');
    try {
      let data = reporteData;
      if (!data) {
        data = await caracStatalService.getReporte(estadoId);
      }
      await openCaracStatalPdf(data);
      toast.success('Documento PDF generado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error al generar PDF de Caracterización:', error);
      toast.error('Error al compilar el documento PDF', { id: toastId });
    }
  },
};
