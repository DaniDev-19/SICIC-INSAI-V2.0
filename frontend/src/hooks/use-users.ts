import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { usersService } from '@/services/users.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['master-users', page, limit, debouncedSearch, status],
    queryFn: () =>
      usersService.getAll({
        page,
        limit,
        search: debouncedSearch,
        status: status === 'all' ? undefined : status,
      }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['master-users'] });
    queryClient.invalidateQueries({ queryKey: ['master-user'] });
    queryClient.invalidateQueries({ queryKey: ['login-instances'] });
  };

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      invalidate();
      toast.success('Usuario creado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: usersService.update,
    onSuccess: () => {
      invalidate();
      toast.success('Usuario actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el usuario');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: usersService.updateStatus,
    onSuccess: (_, { status }) => {
      invalidate();
      toast.success(status ? 'Usuario activado' : 'Usuario desactivado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.delete,
    onSuccess: () => {
      invalidate();
      toast.success('Usuario eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el usuario');
    },
  });

  const assignMutation = useMutation({
    mutationFn: usersService.assignInstance,
    onSuccess: () => {
      invalidate();
      toast.success('Instancia asignada correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al asignar instancia');
    },
  });

  const removeInstanceMutation = useMutation({
    mutationFn: usersService.removeInstance,
    onSuccess: () => {
      invalidate();
      toast.success('Acceso a instancia removido');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al remover instancia');
    },
  });

  return {
    users: response?.data || [],
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
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    updateUserStatus: updateStatusMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
    assignInstance: assignMutation.mutateAsync,
    removeInstance: removeInstanceMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending || removeInstanceMutation.isPending,
  };
}

export function useMasterUser(id: number | null) {
  return useQuery({
    queryKey: ['master-user', id],
    queryFn: () => usersService.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}
