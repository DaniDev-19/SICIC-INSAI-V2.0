import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { avalesService } from '@/services/avales.service';
import type { CreateAvalDTO, UpdateAvalDTO } from '@/types/avales';
import { useDebounce } from '@/hooks/use-debounce';

export function useAvales() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const avalesQuery = useQuery({
    queryKey: ['avales', page, limit, debouncedSearch],
    queryFn: () =>
      avalesService.getAll({
        page,
        limit,
        q: debouncedSearch.trim() || undefined,
      }),
  });

  const createAvalMutation = useMutation({
    mutationFn: (dto: CreateAvalDTO) => avalesService.create(dto),
    onSuccess: () => {
      toast.success('Aval Sanitario registrado correctamente');
      queryClient.invalidateQueries({ queryKey: ['avales'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar Aval: ${error.message}`);
    },
  });

  const updateAvalMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateAvalDTO }) =>
      avalesService.update(id, dto),
    onSuccess: () => {
      toast.success('Aval Sanitario actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['avales'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar Aval: ${error.message}`);
    },
  });

  const deleteAvalMutation = useMutation({
    mutationFn: (id: number) => avalesService.delete(id),
    onSuccess: () => {
      toast.success('Aval Sanitario eliminado y stock restaurado');
      queryClient.invalidateQueries({ queryKey: ['avales'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar Aval: ${error.message}`);
    },
  });

  return {
    avales: avalesQuery.data?.data || [],
    pagination: avalesQuery.data?.pagination,
    isLoading: avalesQuery.isLoading,
    isError: avalesQuery.isError,
    error: avalesQuery.error,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    createAval: createAvalMutation.mutateAsync,
    isCreating: createAvalMutation.isPending,
    updateAval: updateAvalMutation.mutateAsync,
    isUpdating: updateAvalMutation.isPending,
    deleteAval: deleteAvalMutation.mutateAsync,
    isDeleting: deleteAvalMutation.isPending,
  };
}
