import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { inspectionsService } from '@/services/inspecciones.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useInspecciones(initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planificacionFilter, setPlanificacionFilter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedStatus = useDebounce(statusFilter === 'all' ? '' : statusFilter, 300);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedStatus, planificacionFilter, debouncedSearch]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['inspecciones', page, limit, debouncedStatus, planificacionFilter, debouncedSearch],
    queryFn: () =>
      inspectionsService.getAll({
        page,
        limit,
        status: debouncedStatus || undefined,
        planificacion_id: planificacionFilter,
        q: debouncedSearch || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: inspectionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Inspección registrada con éxito');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar la inspección');
    },
  });

  const updateMutation = useMutation({
    mutationFn: inspectionsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['inspeccion'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Inspección actualizada con éxito');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la inspección');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inspectionsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Inspección eliminada');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la inspección');
    },
  });

  return {
    inspecciones: response?.data || [],
    pagination: response?.pagination || {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: initialLimit,
    },
    isLoading,
    error,
    page,
    limit,
    statusFilter,
    planificacionFilter,
    searchQuery,
    setPage,
    setLimit,
    setStatusFilter,
    setPlanificacionFilter,
    setSearchQuery,
    createInspeccion: createMutation.mutateAsync,
    updateInspeccion: updateMutation.mutateAsync,
    deleteInspeccion: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useInspeccion(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['inspeccion', id],
    queryFn: () => inspectionsService.getById(id!),
    enabled: !!id,
  });

  return {
    inspeccion: response?.data,
    isLoading,
    error,
  };
}
