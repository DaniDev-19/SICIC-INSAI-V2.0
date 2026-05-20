import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { vehiculosService } from '@/services/vehiculos.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useVehiculos(initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');

  const debouncedStatus = useDebounce(statusFilter, 300);
  const debouncedTipo = useDebounce(tipoFilter, 300);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['vehiculos', page, limit, debouncedStatus, debouncedTipo],
    queryFn: () => vehiculosService.getAll({
      page,
      limit,
      status: debouncedStatus || undefined,
      tipo: debouncedTipo || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: vehiculosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo registrado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar el vehículo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: vehiculosService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el vehículo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vehiculosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      toast.success('Vehículo eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: vehiculosService.deleteMany,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
      if (data.status === 'warning') {
        toast.warning(data.message);
      } else {
        toast.success('Vehículos eliminados correctamente');
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  return {
    vehiculos: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    statusFilter,
    tipoFilter,
    setPage,
    setLimit,
    setStatusFilter,
    setTipoFilter,
    createVehiculo: createMutation.mutateAsync,
    updateVehiculo: updateMutation.mutateAsync,
    deleteVehiculo: deleteMutation.mutateAsync,
    deleteManyVehiculos: deleteManyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
