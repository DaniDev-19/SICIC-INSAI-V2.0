import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { roleService } from '@/services/role.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useRoles() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['roles', page, limit, debouncedSearch, status],
    queryFn: () => roleService.getRoles({ 
      page, 
      limit, 
      search: debouncedSearch, 
      status: status === 'all' ? undefined : status 
    }),
  });

  const createMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol creado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al crear el rol');
    },
  });

  const updateMutation = useMutation({
    mutationFn: roleService.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Rol eliminado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el rol');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: roleService.deleteManyRoles,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      if (response.status === 'warning') {
        toast.warning(response.message, {
          duration: 6000,
        });
      } else {
        toast.success(response.message || 'Roles eliminados correctamente');
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: roleService.updateRoleStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(data.status ? 'Rol activado correctamente' : 'Rol desactivado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al cambiar el estado del rol');
    },
  });


  return {
    roles: response?.data || [],
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
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    updateRoleStatus: updateStatusMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    deleteManyRoles: deleteManyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending,
    isDeleting: deleteManyMutation.isPending,
  };
}

export function useRole(id: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getRoleById(id!),
    enabled: !!id,
  });

  return {
    role: data,
    isLoading,
    error,
  };
}

