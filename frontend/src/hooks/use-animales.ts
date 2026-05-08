import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { animalesService } from '@/services/animales.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useAnimales() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [tipoId, setTipoId] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['animales', page, limit, debouncedSearch, tipoId],
    queryFn: () => animalesService.getAll({
      page,
      limit,
      search: debouncedSearch,
      tipo_id: tipoId === 'all' ? undefined : tipoId
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['animales-tipos'],
    queryFn: animalesService.getTipos,
  });

  const createMutation = useMutation({
    mutationFn: animalesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      toast.success('Animal creado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el animal');
    },
  });

  const updateMutation = useMutation({
    mutationFn: animalesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      toast.success('Animal actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el animal');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: animalesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      toast.success('Animal eliminado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el animal');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: animalesService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      toast.success('Animales eliminados correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  // --- Tipo CRUD ---
  const createTipoMutation = useMutation({
    mutationFn: animalesService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales-tipos'] });
      toast.success('Tipo de animal creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: animalesService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales-tipos'] });
      queryClient.invalidateQueries({ queryKey: ['animales'] });
      toast.success('Tipo de animal actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: animalesService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animales-tipos'] });
      toast.success('Tipo de animal eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el tipo');
    },
  });

  return {
    animales: (Array.isArray(response?.data) ? response?.data : []) as any[],
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
    createAnimal: createMutation.mutateAsync,
    updateAnimal: updateMutation.mutateAsync,
    deleteAnimal: deleteMutation.mutateAsync,
    deleteManyAnimales: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useAnimal(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => animalesService.getById(id!),
    enabled: !!id,
  });

  return {
    animal: response?.data,
    isLoading,
    error,
  };
};

