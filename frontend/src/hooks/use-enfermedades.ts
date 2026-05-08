import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { enfermedadesService } from '@/services/enfermedades.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useEnfermedades(initialSearch = '', initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [tipoId, setTipoId] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['enfermedades', page, limit, debouncedSearch, tipoId],
    queryFn: () => enfermedadesService.getAll({
      page,
      limit,
      search: debouncedSearch,
      tipo_id: tipoId === 'all' ? undefined : tipoId,
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['enfermedades-tipos'],
    queryFn: enfermedadesService.getTipos,
  });

  const createMutation = useMutation({
    mutationFn: enfermedadesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades'] });
      toast.success('Enfermedad creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la enfermedad');
    },
  });

  const updateMutation = useMutation({
    mutationFn: enfermedadesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades'] });
      toast.success('Enfermedad actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la enfermedad');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: enfermedadesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades'] });
      toast.success('Enfermedad eliminada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la enfermedad');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: enfermedadesService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades'] });
      toast.success('Enfermedades eliminadas correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  const createTipoMutation = useMutation({
    mutationFn: enfermedadesService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades-tipos'] });
      toast.success('Tipo de enfermedad creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo de enfermedad');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: enfermedadesService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades-tipos'] });
      queryClient.invalidateQueries({ queryKey: ['enfermedades'] });
      toast.success('Tipo de enfermedad actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo de enfermedad');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: enfermedadesService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enfermedades-tipos'] });
      toast.success('Tipo de enfermedad eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el tipo de enfermedad');
    },
  });

  return {
    enfermedades: (Array.isArray(response?.data) ? response?.data : []) as any[],
    tipos: tiposResponse?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    search,
    tipoId,
    setPage,
    setLimit,
    setSearch,
    setTipoId,
    createEnfermedad: createMutation.mutateAsync,
    updateEnfermedad: updateMutation.mutateAsync,
    deleteEnfermedad: deleteMutation.mutateAsync,
    deleteManyEnfermedades: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useEnfermedad(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['enfermedad', id],
    queryFn: () => enfermedadesService.getById(id!),
    enabled: !!id,
  });

  return {
    enfermedad: response?.data,
    isLoading,
    error,
  };
}
