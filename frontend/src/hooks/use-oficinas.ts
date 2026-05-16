import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { oficinasService } from '@/services/oficinas.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useOficinas() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['oficinas', page, limit, debouncedSearch],
    queryFn: () => oficinasService.getAll({ 
      page, 
      limit, 
      search: debouncedSearch 
    }),
  });

  const createMutation = useMutation({
    mutationFn: oficinasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      toast.success('Oficina creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la oficina');
    },
  });

  const updateMutation = useMutation({
    mutationFn: oficinasService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      toast.success('Oficina actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la oficina');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: oficinasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      toast.success('Oficina eliminada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la oficina');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: oficinasService.deleteMany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      toast.success('Oficinas eliminadas correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  return {
    oficinas: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: 10 },
    isLoading,
    error,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    createOficina: createMutation.mutateAsync,
    updateOficina: updateMutation.mutateAsync,
    deleteOficina: deleteMutation.mutateAsync,
    deleteManyOficinas: deleteManyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending || deleteManyMutation.isPending,
  };
}

export function useOficina(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['oficina', id],
    queryFn: () => oficinasService.getById(id!),
    enabled: !!id,
  });

  return {
    oficina: response?.data,
    isLoading,
    error,
  };
}
