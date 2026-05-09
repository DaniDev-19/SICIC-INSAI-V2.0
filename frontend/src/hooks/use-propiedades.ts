import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { propiedadesService } from '@/services/propiedades.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function usePropiedades(initialSearch = '', initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [tipoPropiedadId, setTipoPropiedadId] = useState<string>('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['propiedades', page, limit, debouncedSearch, tipoPropiedadId],
    queryFn: () => propiedadesService.getAll({
      page,
      limit,
      q: debouncedSearch,
      tipo_propiedad_id: tipoPropiedadId === 'all' ? undefined : parseInt(tipoPropiedadId),
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['propiedades-tipos'],
    queryFn: propiedadesService.getTipos,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => propiedadesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Propiedad registrada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar la propiedad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: propiedadesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Datos de la propiedad actualizados');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la propiedad');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: propiedadesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Propiedad eliminada');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: propiedadesService.deleteMany,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      if (data.status === 'warning') {
        toast.warning(data.message);
      } else {
        toast.success('Propiedades eliminadas correctamente');
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  const createTipoMutation = useMutation({
    mutationFn: propiedadesService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades-tipos'] });
      toast.success('Tipo de propiedad creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear tipo');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: propiedadesService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades-tipos'] });
      toast.success('Tipo de propiedad actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar tipo');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: propiedadesService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedades-tipos'] });
      toast.success('Tipo de propiedad eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar tipo');
    },
  });

  return {
    propiedades: response?.data || [],
    tipos: tiposResponse?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    search,
    tipoPropiedadId,
    setPage,
    setLimit,
    setSearch,
    setTipoPropiedadId,
    createPropiedad: createMutation.mutateAsync,
    updatePropiedad: updateMutation.mutateAsync,
    deletePropiedad: deleteMutation.mutateAsync,
    deleteManyPropiedades: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    exportPropiedades: propiedadesService.export,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
