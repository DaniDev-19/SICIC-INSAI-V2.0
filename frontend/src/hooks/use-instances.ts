import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { instancesService } from '@/services/instances.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useInstances() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['master-instances', page, limit, debouncedSearch, status],
    queryFn: () =>
      instancesService.getAll({
        page,
        limit,
        search: debouncedSearch,
        status: status === 'all' ? undefined : status,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['master-instances'] });
    queryClient.invalidateQueries({ queryKey: ['master-instance'] });
    queryClient.invalidateQueries({ queryKey: ['master-instances-options'] });
    queryClient.invalidateQueries({ queryKey: ['login-instances'] });
  };

  const createMutation = useMutation({
    mutationFn: instancesService.create,
    onSuccess: () => {
      invalidate();
      toast.success('Instancia creada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear la instancia');
    },
  });

  const updateMutation = useMutation({
    mutationFn: instancesService.update,
    onSuccess: () => {
      invalidate();
      toast.success('Instancia actualizada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la instancia');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: instancesService.updateStatus,
    onSuccess: (_, { status }) => {
      invalidate();
      toast.success(status ? 'Instancia activada' : 'Instancia desactivada');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: instancesService.delete,
    onSuccess: () => {
      invalidate();
      toast.success('Instancia eliminada');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la instancia');
    },
  });

  return {
    instances: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: 10 },
    isLoading,
    error,
    page,
    limit,
    search,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    createInstance: createMutation.mutateAsync,
    updateInstance: updateMutation.mutateAsync,
    updateInstanceStatus: updateStatusMutation.mutateAsync,
    deleteInstance: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useInstancesOptions(enabled = true) {
  return useQuery({
    queryKey: ['master-instances-options'],
    queryFn: () => instancesService.getAll({ limit: 200, status: 'true' }),
    enabled,
    select: (res) => res.data || [],
  });
}

export function useMasterInstance(id: number | null) {
  return useQuery({
    queryKey: ['master-instance', id],
    queryFn: () => instancesService.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
