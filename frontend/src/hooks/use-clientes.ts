import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { clientesService } from '@/services/clientes.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useClientes(initialSearch = '', initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['clientes', page, limit, debouncedSearch],
    queryFn: () => clientesService.getAll({
      page,
      limit,
      q: debouncedSearch,
    }),
  });

  const createMutation = useMutation({
    mutationFn: clientesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Productor registrado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar el productor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: clientesService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Datos del productor actualizados');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el productor');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clientesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Productor eliminado');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: clientesService.deleteMany,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      if (data.status === 'warning') {
        toast.warning(data.message);
      } else {
        toast.success('Productores eliminados correctamente');
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error en el borrado masivo');
    },
  });

  return {
    clientes: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: initialLimit },
    isLoading,
    error,
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    createCliente: createMutation.mutateAsync,
    updateCliente: updateMutation.mutateAsync,
    deleteCliente: deleteMutation.mutateAsync,
    deleteManyClientes: deleteManyMutation.mutateAsync,
    exportClientes: clientesService.export,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
