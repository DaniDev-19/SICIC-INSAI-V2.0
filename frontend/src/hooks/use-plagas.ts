import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { plagasService } from '@/services/plagas.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function usePlagas() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [tipoId, setTipoId] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['plagas', page, limit, debouncedSearch, tipoId],
    queryFn: () => plagasService.getAll({
      page,
      limit,
      search: debouncedSearch,
      tipo_id: tipoId === 'all' ? undefined : tipoId
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['plagas-tipos'],
    queryFn: plagasService.getTipos
  });

  const createMutation = useMutation({
    mutationFn: plagasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas'] });
      toast.success('Plaga creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la plaga');
    },
  });

  const updatePlagaMutation = useMutation({
    mutationFn: plagasService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas'] });
      toast.success('Plaga actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la plaga')
    }
  });

  const deletePlagaMutation = useMutation({
    mutationFn: plagasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas'] });
      toast.success('Plaga eliminada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la plaga');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: plagasService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas'] });
      toast.success('Plagas eliminadas correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    }
  });

  // --- Tipo CRUD ---
  const createTipoMutation = useMutation({
    mutationFn: plagasService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas-tipos'] });
      toast.success('Tipo de plaga creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo de plaga');
    }
  });

  const updateTipoMutation = useMutation({
    mutationFn: plagasService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas-tipos'] });
      queryClient.invalidateQueries({ queryKey: ['plagas'] });
      toast.success('Tipo de plaga actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo de plaga');
    }
  });

  const deleteTipoMutation = useMutation({
    mutationFn: plagasService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plagas-tipos'] });
      toast.success('Tipo de plaga eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el tipo de plaga');
    }
  });

  return {
    plagas: (Array.isArray(response?.data) ? response?.data : []) as any[],
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
    createPlaga: createMutation.mutateAsync,
    updatePlaga: updatePlagaMutation.mutateAsync,
    deletePlaga: deletePlagaMutation.mutateAsync,
    deleteManyPlagas: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updatePlagaMutation.isPending,
  };
}

export function usePlaga(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['plaga', id],
    queryFn: () => plagasService.getById(id!),
    enabled: !!id,
  });

  return {
    plaga: response?.data,
    isLoading,
    error,
  };
};