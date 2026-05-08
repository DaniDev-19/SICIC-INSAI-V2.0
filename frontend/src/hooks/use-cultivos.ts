import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { cultivosService } from '@/services/cultivos.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useCultivos() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [tipoId, setTipoId] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['cultivos', page, limit, debouncedSearch, tipoId],
    queryFn: () => cultivosService.getAll({ 
      page, 
      limit, 
      search: debouncedSearch, 
      tipo_id: tipoId === 'all' ? undefined : tipoId 
    }),
  });

  const { data: tiposResponse } = useQuery({
    queryKey: ['cultivos-tipos'],
    queryFn: cultivosService.getTipos,
  });

  const createMutation = useMutation({
    mutationFn: cultivosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Cultivo creado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el cultivo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: cultivosService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Cultivo actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el cultivo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cultivosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Cultivo eliminado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el cultivo');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: cultivosService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Cultivos eliminados correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  // --- Tipo CRUD ---
  const createTipoMutation = useMutation({
    mutationFn: cultivosService.createTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos-tipos'] });
      toast.success('Tipo de cultivo creado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo');
    },
  });

  const updateTipoMutation = useMutation({
    mutationFn: cultivosService.updateTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos-tipos'] });
      queryClient.invalidateQueries({ queryKey: ['cultivos'] });
      toast.success('Tipo de cultivo actualizado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo');
    },
  });

  const deleteTipoMutation = useMutation({
    mutationFn: cultivosService.deleteTipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cultivos-tipos'] });
      toast.success('Tipo de cultivo eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el tipo');
    },
  });

  return {
    cultivos: (Array.isArray(response?.data) ? response?.data : []) as any[],
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
    createCultivo: createMutation.mutateAsync,
    updateCultivo: updateMutation.mutateAsync,
    deleteCultivo: deleteMutation.mutateAsync,
    deleteManyCultivos: deleteManyMutation.mutateAsync,
    createTipo: createTipoMutation.mutateAsync,
    updateTipo: updateTipoMutation.mutateAsync,
    deleteTipo: deleteTipoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

export function useCultivo(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['cultivo', id],
    queryFn: () => cultivosService.getById(id!),
    enabled: !!id,
  });

  return {
    cultivo: response?.data,
    isLoading,
    error,
  };
}

