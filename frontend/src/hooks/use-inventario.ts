import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventarioService, type GetMovimientosParams } from '@/services/inventario.service';
import type {
  CreateInsumoDTO,
  UpdateInsumoDTO,
  ManualMovimientoDTO,
} from '@/types/inventario';

export function useInventario() {
  const queryClient = useQueryClient();

  // Insumo Pagination & Search
  const [insumoSearch, setInsumoSearch] = useState('');
  const [insumoPage, setInsumoPage] = useState(1);
  const [insumoLimit, setInsumoLimit] = useState(10);

  // Stock Pagination & Search
  const [stockSearch, setStockSearch] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const [stockLimit, setStockLimit] = useState(10);
  const [selectedOficinaId, setSelectedOficinaId] = useState<number | undefined>(undefined);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Kardex Pagination & Search
  const [kardexSearch, setKardexSearch] = useState('');
  const [kardexPage, setKardexPage] = useState(1);
  const [kardexLimit, setKardexLimit] = useState(10);
  const [kardexInsumoId, setKardexInsumoId] = useState<number | undefined>(undefined);
  const [kardexOficinaId, setKardexOficinaId] = useState<number | undefined>(undefined);
  const [kardexTipoMov, setKardexTipoMov] = useState<string>('ALL');

  const insumosQuery = useQuery({
    queryKey: ['insumos', insumoSearch, insumoPage, insumoLimit],
    queryFn: () =>
      inventarioService.getInsumos({
        search: insumoSearch.trim() || undefined,
        page: insumoPage,
        limit: insumoLimit,
      }),
  });

  const categoriasQuery = useQuery({
    queryKey: ['c_insumos'],
    queryFn: () => inventarioService.getCategorias(),
  });

  const unidadesQuery = useQuery({
    queryKey: ['t_unidades'],
    queryFn: () => inventarioService.getUnidades(),
  });

  const stockQuery = useQuery({
    queryKey: ['insumos_stock', selectedOficinaId, stockSearch, onlyLowStock, stockPage, stockLimit],
    queryFn: () =>
      inventarioService.getAllStock({
        oficina_id: selectedOficinaId,
        q: stockSearch.trim() || undefined,
        low_stock: onlyLowStock,
        page: stockPage,
        limit: stockLimit,
      }),
  });

  const kpisQuery = useQuery({
    queryKey: ['insumos_stock_kpis'],
    queryFn: () => inventarioService.getKPIs(),
  });

  const kardexParams: GetMovimientosParams = {
    search: kardexSearch.trim() || undefined,
    insumo_id: kardexInsumoId,
    oficina_id: kardexOficinaId,
    tipo_movimiento: kardexTipoMov !== 'ALL' ? kardexTipoMov : undefined,
    page: kardexPage,
    limit: kardexLimit,
  };

  const kardexQuery = useQuery({
    queryKey: ['movimientos_insumos', kardexParams],
    queryFn: () => inventarioService.getMovimientos(kardexParams),
  });

  const createInsumoMutation = useMutation({
    mutationFn: (dto: CreateInsumoDTO) => inventarioService.createInsumo(dto),
    onSuccess: () => {
      toast.success('Insumo registrado correctamente');
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock_kpis'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al registrar insumo');
    },
  });

  const updateInsumoMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateInsumoDTO }) =>
      inventarioService.updateInsumo(id, dto),
    onSuccess: () => {
      toast.success('Insumo actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar insumo');
    },
  });

  const deleteInsumoMutation = useMutation({
    mutationFn: (id: number) => inventarioService.deleteInsumo(id),
    onSuccess: () => {
      toast.success('Insumo eliminado del catálogo');
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock_kpis'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar insumo');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => inventarioService.deleteManyInsumos(ids),
    onSuccess: () => {
      toast.success('Insumos seleccionados eliminados correctamente');
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock_kpis'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al eliminar insumos seleccionados');
    },
  });

  const movimientoManualMutation = useMutation({
    mutationFn: (dto: ManualMovimientoDTO) => inventarioService.registrarMovimientoManual(dto),
    onSuccess: () => {
      toast.success('Movimiento de Kardex registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['movimientos_insumos'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock_kpis'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al registrar movimiento en Kardex');
    },
  });

  const updateStockItemMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: { stock_minimo?: number; lote?: string; fecha_vencimiento?: string } }) =>
      inventarioService.updateStockItem(id, dto),
    onSuccess: () => {
      toast.success('Configuración de stock actualizada correctamente');
      queryClient.invalidateQueries({ queryKey: ['insumos_stock'] });
      queryClient.invalidateQueries({ queryKey: ['insumos_stock_kpis'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al actualizar configuración de stock');
    },
  });

  return {
    // Data
    insumos: insumosQuery.data?.data || [],
    categorias: categoriasQuery.data?.data || [],
    unidades: unidadesQuery.data?.data || [],
    stock: stockQuery.data?.data || [],
    kpis: kpisQuery.data?.data,
    movimientos: kardexQuery.data?.data || [],

    // Paginations
    insumosPagination: insumosQuery.data?.pagination || { currentPage: 1, limit: 10, totalCount: 0, totalPages: 1 },
    stockPagination: stockQuery.data?.pagination || { currentPage: 1, limit: 10, totalCount: 0, totalPages: 1 },
    kardexPagination: kardexQuery.data?.pagination || { currentPage: 1, limit: 10, totalCount: 0, totalPages: 1 },

    // Loadings
    isLoadingInsumos: insumosQuery.isLoading,
    isLoadingStock: stockQuery.isLoading,
    isLoadingKpis: kpisQuery.isLoading,
    isLoadingKardex: kardexQuery.isLoading,

    // Insumo Filters & Pagination State
    insumoSearch,
    setInsumoSearch,
    insumoPage,
    setInsumoPage,
    insumoLimit,
    setInsumoLimit,

    // Stock Filters & Pagination State
    stockSearch,
    setStockSearch,
    stockPage,
    setStockPage,
    stockLimit,
    setStockLimit,
    selectedOficinaId,
    setSelectedOficinaId,
    onlyLowStock,
    setOnlyLowStock,

    // Kardex Filters & Pagination State
    kardexSearch,
    setKardexSearch,
    kardexPage,
    setKardexPage,
    kardexLimit,
    setKardexLimit,
    kardexInsumoId,
    setKardexInsumoId,
    kardexOficinaId,
    setKardexOficinaId,
    kardexTipoMov,
    setKardexTipoMov,

    // Refetching
    refetchInsumos: insumosQuery.refetch,
    refetchStock: stockQuery.refetch,
    refetchKardex: kardexQuery.refetch,

    // Actions
    createInsumo: createInsumoMutation.mutateAsync,
    isCreatingInsumo: createInsumoMutation.isPending,

    updateInsumo: updateInsumoMutation.mutateAsync,
    isUpdatingInsumo: updateInsumoMutation.isPending,

    deleteInsumo: deleteInsumoMutation.mutateAsync,
    isDeletingInsumo: deleteInsumoMutation.isPending,

    bulkDeleteInsumos: bulkDeleteMutation.mutateAsync,
    isBulkDeleting: bulkDeleteMutation.isPending,

    registrarMovimientoManual: movimientoManualMutation.mutateAsync,
    isRegistrandoMovimiento: movimientoManualMutation.isPending,

    updateStockItem: updateStockItemMutation.mutateAsync,
    isUpdatingStock: updateStockItemMutation.isPending,
  };
}
