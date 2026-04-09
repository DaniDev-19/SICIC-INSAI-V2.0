import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { roleService } from '../services/role.service';
import { toast } from 'sonner';
import type { UpdateRoleDto } from '../types/role';

export function useRoles() {
  const queryClient = useQueryClient();

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
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

  return {
    roles: roles || [],
    isLoading,
    error,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
