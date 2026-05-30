import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { planificacionesService } from '@/services/planificaciones.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function usePlanificaciones(initialSearch = '', initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<string>('all');
  const [fechaProgramada, setFechaProgramada] = useState<string>('');
  const [periodo, setPeriodo] = useState<string>('all');

  const debouncedSearch = useDebounce(search, 500);

  // Reset page to 1 when filters change to prevent empty pages
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, fechaProgramada, periodo]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['planificaciones', page, limit, debouncedSearch, status, fechaProgramada, periodo],
    queryFn: () => planificacionesService.getAll({
      page,
      limit,
      q: debouncedSearch || undefined,
      status: status === 'all' ? undefined : status,
      fecha_programada: fechaProgramada || undefined,
      periodo: periodo === 'all' ? undefined : periodo,
    }),
  });

  const createMutation = useMutation({
    mutationFn: planificacionesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Planificación creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la planificación');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: number; data: any }) => 
      planificacionesService.update({ id: args.id, data: args.data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Planificación actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la planificación');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: planificacionesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Planificación eliminada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la planificación');
    },
  });

  const handleSetPeriodo = (p: string) => {
    setPeriodo(p);
    if (p !== 'all') {
      setFechaProgramada('');
    }
  };

  const handleSetFechaProgramada = (f: string) => {
    setFechaProgramada(f);
    if (f) {
      setPeriodo('all');
    }
  };

  const handleExport = async () => {
    const toastId = toast.loading('Generando reporte Excel...');
    try {
      await planificacionesService.export({
        status: status === 'all' ? undefined : status,
        fecha_programada: fechaProgramada || undefined,
        q: debouncedSearch || undefined,
        periodo: periodo === 'all' ? undefined : periodo,
      });
      toast.dismiss(toastId);
      toast.success('Reporte Excel generado');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Error al exportar las planificaciones');
    }
  };

  const handleExportPdf = async () => {
    const toastId = toast.loading('Generando reporte PDF...');
    try {
      await planificacionesService.exportPdf({
        status: status === 'all' ? undefined : status,
        fecha_programada: fechaProgramada || undefined,
        q: debouncedSearch || undefined,
        periodo: periodo === 'all' ? undefined : periodo,
      });
      toast.dismiss(toastId);
      toast.success('Reporte PDF generado');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Error al exportar las planificaciones en PDF');
    }
  };

  return {
    planificaciones: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    search,
    status,
    fechaProgramada,
    periodo,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setFechaProgramada: handleSetFechaProgramada,
    setPeriodo: handleSetPeriodo,
    createPlanificacion: createMutation.mutateAsync,
    updatePlanificacion: updateMutation.mutateAsync,
    deletePlanificacion: deleteMutation.mutateAsync,
    exportPlanificaciones: handleExport,
    exportPlanificacionesPdf: handleExportPdf,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function usePlanificacion(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['planificacion', id],
    queryFn: () => planificacionesService.getById(id!),
    enabled: !!id,
  });

  return {
    planificacion: response?.data,
    isLoading,
    error,
  };
}
