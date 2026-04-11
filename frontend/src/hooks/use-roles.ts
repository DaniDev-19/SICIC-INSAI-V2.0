import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { roleService } from '../services/role.service';
import { toast } from 'sonner';
import type { UpdateRoleDto } from '../types/role';

export function useRoles() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['roles', page, limit],
    queryFn: () => roleService.getRoles(page, limit),
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
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) => 
      roleService.updateRole(id, data),
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
    mutationFn: ({ id, status }: { id: number; status: boolean }) => 
      roleService.updateRoleStatus(id, status),
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
    setPage,
    setLimit,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    updateRoleStatus: updateStatusMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    deleteManyRoles: deleteManyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending || deleteManyMutation.isPending,
  };
}

