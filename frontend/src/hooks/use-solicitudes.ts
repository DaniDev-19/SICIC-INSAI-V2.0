import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { solicitudesService } from '@/services/solicitudes.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useSolicitudes(initialSearch = '', initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [estatus, setEstatus] = useState<string>('all');
  const [prioridad, setPrioridad] = useState<string>('all');

  const debouncedSearch = useDebounce(search, 500);

  // Reset page to 1 when filters change to prevent empty pages
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, estatus, prioridad]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['solicitudes', page, limit, debouncedSearch, estatus, prioridad],
    queryFn: () => solicitudesService.getAll({
      page,
      limit,
      q: debouncedSearch,
      estatus: estatus === 'all' ? undefined : estatus,
      prioridad: prioridad === 'all' ? undefined : prioridad,
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['solicitudes-tipos'],
    queryFn: solicitudesService.getTipos,
  });

  const createMutation = useMutation({
    mutationFn: solicitudesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Solicitud creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la solicitud');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (args: { id: number; data: any }) => solicitudesService.update({ id: args.id, data: args.data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Solicitud actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la solicitud');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: solicitudesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Solicitud eliminada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la solicitud');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: solicitudesService.deleteMany,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      if (data.status === 'warning') {
        toast.warning(data.message);
      } else {
        toast.success('Solicitudes eliminadas correctamente');
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  const createTipoMutation = useMutation({
    mutationFn: solicitudesService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-tipos'] });
      toast.success('Tipo de solicitud creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: solicitudesService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-tipos'] });
      toast.success('Tipo de solicitud actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: solicitudesService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes-tipos'] });
      toast.success('Tipo de solicitud eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el tipo');
    },
  });

  return {
    solicitudes: response?.data || [],
    tipos: tiposResponse?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    search,
    estatus,
    prioridad,
    setPage,
    setLimit,
    setSearch,
    setEstatus,
    setPrioridad,
    createSolicitud: createMutation.mutateAsync,
    updateSolicitud: updateMutation.mutateAsync,
    deleteSolicitud: deleteMutation.mutateAsync,
    deleteManySolicitudes: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    exportSolicitudes: solicitudesService.export,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useSolicitud(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: () => solicitudesService.getById(id!),
    enabled: !!id,
  });

  return {
    solicitud: response?.data,
    isLoading,
    error,
  };
}
