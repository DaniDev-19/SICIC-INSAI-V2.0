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

  const debouncedSearch = useDebounce(search, 500);

  // Reset page to 1 when filters change to prevent empty pages
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, fechaProgramada]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['planificaciones', page, limit, debouncedSearch, status, fechaProgramada],
    queryFn: () => planificacionesService.getAll({
      page,
      limit,
      q: debouncedSearch || undefined,
      status: status === 'all' ? undefined : status,
      fecha_programada: fechaProgramada || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: planificacionesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      // Invalidate solicitudes as they status changes to PLANIFICADA
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
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setFechaProgramada,
    createPlanificacion: createMutation.mutateAsync,
    updatePlanificacion: updateMutation.mutateAsync,
    deletePlanificacion: deleteMutation.mutateAsync,
    exportPlanificaciones: planificacionesService.export,
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
