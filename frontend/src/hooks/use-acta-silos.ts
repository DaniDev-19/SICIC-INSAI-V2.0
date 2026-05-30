import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { actaSilosService } from '@/services/acta-silos.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useActaSilos(initialLimit = 10) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [planificacionFilter, setPlanificacionFilter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setPage(1);
  }, [planificacionFilter, debouncedSearch]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['acta_silos', page, limit, planificacionFilter, debouncedSearch],
    queryFn: () =>
      actaSilosService.getAll({
        page,
        limit,
        planificacion_id: planificacionFilter,
        q: debouncedSearch || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: actaSilosService.create,
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ['acta_silos'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Acta de Silo registrada con éxito');
      
      // Auto-open PDF immediately upon registration
      if (res?.data?.id) {
        try {
          await actaSilosService.openPdfReport(res.data.id);
        } catch (pdfErr) {
          console.error('Error auto-opening PDF:', pdfErr);
          toast.error('No se pudo abrir el PDF automáticamente, pero el acta fue guardada.');
        }
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar el acta de silo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: actaSilosService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acta_silos'] });
      queryClient.invalidateQueries({ queryKey: ['acta_silo'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Acta de Silo actualizada con éxito');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el acta de silo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: actaSilosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acta_silos'] });
      queryClient.invalidateQueries({ queryKey: ['planificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['propiedades'] });
      toast.success('Acta de Silo eliminada y stock revertido');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el acta de silo');
    },
  });

  const openPdfReport = async (id: number) => {
    if (pdfLoadingId !== null) return;
    setPdfLoadingId(id);
    const toastId = toast.loading('Generando acta PDF...');
    try {
      await actaSilosService.openPdfReport(id);
      toast.dismiss(toastId);
      toast.success('Acta PDF abierta en nueva pestaña');
    } catch (error) {
      toast.dismiss(toastId);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Error al generar el acta PDF');
    } finally {
      setPdfLoadingId(null);
    }
  };

  return {
    actaSilos: response?.data || [],
    pagination: response?.pagination || {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: initialLimit,
    },
    isLoading,
    error,
    page,
    limit,
    planificacionFilter,
    searchQuery,
    setPage,
    setLimit,
    setPlanificacionFilter,
    setSearchQuery,
    createActaSilo: createMutation.mutateAsync,
    updateActaSilo: updateMutation.mutateAsync,
    deleteActaSilo: deleteMutation.mutateAsync,
    openPdfReport,
    pdfLoadingId,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useActaSilo(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['acta_silo', id],
    queryFn: () => actaSilosService.getById(id!),
    enabled: !!id,
  });

  return {
    actaSilo: response?.data,
    isLoading,
    error,
  };
}
