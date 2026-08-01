import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  seguimientosService,
  type GetSeguimientosParams,
} from '@/services/seguimientos.service';
import type { CreateSeguimientoDTO, UpdateSeguimientoDTO } from '@/types/seguimientos';
import { useDebounce } from '@/hooks/use-debounce';

export function useSeguimientos(initialInspeccionId?: number) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inspeccionIdFilter, setInspeccionIdFilter] = useState<number | undefined>(initialInspeccionId);

  const debouncedSearch = useDebounce(search, 500);

  const queryParams: GetSeguimientosParams = {
    page,
    limit,
    q: debouncedSearch.trim() || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    inspeccion_id: inspeccionIdFilter,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['seguimientos', queryParams],
    queryFn: () => seguimientosService.getAll(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSeguimientoDTO) => seguimientosService.create(dto),
    onSuccess: () => {
      toast.success('Seguimiento registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['seguimientos'] });
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al registrar seguimiento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSeguimientoDTO }) =>
      seguimientosService.update(id, dto),
    onSuccess: () => {
      toast.success('Seguimiento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['seguimientos'] });
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar seguimiento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => seguimientosService.delete(id),
    onSuccess: () => {
      toast.success('Seguimiento eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['seguimientos'] });
      queryClient.invalidateQueries({ queryKey: ['inspecciones'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar seguimiento');
    },
  });

  return {
    seguimientos: data?.data || [],
    pagination: data?.pagination || { currentPage: 1, limit: 10, totalCount: 0, totalPages: 1 },
    isLoading,
    isError,
    error,
    page,
    limit,
    search,
    statusFilter,
    inspeccionIdFilter,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    setInspeccionIdFilter,
    refetch,
    createSeguimiento: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSeguimiento: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSeguimiento: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSeguimiento(id: number | null) {
  return useQuery({
    queryKey: ['seguimientos', id],
    queryFn: async () => (id ? (await seguimientosService.getById(id)).data : null),
    enabled: !!id,
  });
}
