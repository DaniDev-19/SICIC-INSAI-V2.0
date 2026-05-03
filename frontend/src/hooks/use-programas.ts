import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { programasService } from '../services/programas.service';
import { toast } from 'sonner';
import { useDebounce } from './use-debounce';

export function useProgramas() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [tipoId, setTipoId] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['programas', page, limit, debouncedSearch, tipoId],
    queryFn: () => programasService.getAll({ 
      page, 
      limit, 
      search: debouncedSearch, 
      tipo_programa_id: tipoId === 'all' ? undefined : tipoId 
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['tipos-programas'],
    queryFn: () => programasService.getTipos(),
  });

  const createMutation = useMutation({
    mutationFn: programasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programa creado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el programa');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => programasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programa actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el programa');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: programasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programa eliminado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el programa');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: programasService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programas'] });
      toast.success('Programas eliminados correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  const createTipoMutation = useMutation({
    mutationFn: programasService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-programas'] });
      toast.success('Tipo de programa creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear tipo');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: ({ id, nombre }: { id: number; nombre: string }) => programasService.updateTipo(id, nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-programas'] });
      toast.success('Tipo de programa actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar tipo');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: programasService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-programas'] });
      toast.success('Tipo de programa eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar tipo');
    },
  });

  return {
    programas: (Array.isArray(response?.data) ? response?.data : []) as any[],
    tipos: tiposResponse?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: 5 },
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
    createPrograma: createMutation.mutateAsync,
    updatePrograma: updateMutation.mutateAsync,
    deletePrograma: deleteMutation.mutateAsync,
    deleteManyProgramas: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending || deleteManyMutation.isPending,
  };
}

export function usePrograma(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['programa', id],
    queryFn: () => programasService.getById(id!),
    enabled: !!id,
  });

  return {
    programa: response?.data,
    isLoading,
    error,
  };
}
