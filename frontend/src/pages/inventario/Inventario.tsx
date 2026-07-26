import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Package,
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  Trash2,
  History,
  Warehouse,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Can from '@/components/auth/Can';
import { useInventario } from '@/hooks/use-inventario';
import { useOficinas } from '@/hooks/use-oficinas';
import { InsumosCatalogTable } from './components/InsumosCatalogTable';
import { StockExistenciasTable } from './components/StockExistenciasTable';
import { KardexMovimientosTable } from './components/KardexMovimientosTable';
import { InsumoModal } from './components/InsumoModal';
import { MovimientoStockModal } from './components/MovimientoStockModal';
import { EditStockModal } from './components/EditStockModal';
import { InsumoDetailModal } from './components/InsumoDetailModal';
import type { Insumo, InsumoStock } from '@/types/inventario';

const Inventario: React.FC = () => {
  const navigate = useNavigate();
  const {
    insumos,
    categorias,
    unidades,
    stock,
    kpis,
    movimientos,
    insumosPagination,
    stockPagination,
    kardexPagination,
    isLoadingInsumos,
    isLoadingStock,
    isLoadingKpis,
    isLoadingKardex,
    insumoSearch,
    setInsumoSearch,
    insumoPage,
    setInsumoPage,
    insumoLimit,
    setInsumoLimit,
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
    kardexSearch,
    setKardexSearch,
    kardexPage,
    setKardexPage,
    kardexLimit,
    setKardexLimit,
    kardexTipoMov,
    setKardexTipoMov,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    bulkDeleteInsumos,
    registrarMovimientoManual,
    updateStockItem,
  } = useInventario();

  const { oficinas } = useOficinas();

  const [activeTab, setActiveTab] = useState<'catalogo' | 'existencias' | 'kardex'>('catalogo');

  // Modals state
  const [isInsumoModalOpen, setIsInsumoModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
  const [preselectedInsumoId, setPreselectedInsumoId] = useState<number | null>(null);

  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [editingStockItem, setEditingStockItem] = useState<InsumoStock | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailInsumo, setDetailInsumo] = useState<Insumo | null>(null);

  // Deletions state
  const [deleteInsumoId, setDeleteInsumoId] = useState<number | null>(null);
  const [selectedInsumoIds, setSelectedInsumoIds] = useState<number[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Category filter for catalog tab
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredInsumos = insumos.filter((i) => {
    if (categoryFilter !== 'ALL' && String(i.categoria_id) !== categoryFilter) {
      return false;
    }
    return true;
  });

  const handleOpenCreateInsumo = () => {
    setEditingInsumo(null);
    setIsInsumoModalOpen(true);
  };

  const handleOpenEditInsumo = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setIsInsumoModalOpen(true);
  };

  const handleOpenMovimientoModal = (insumoId?: number) => {
    setPreselectedInsumoId(insumoId || null);
    setIsMovimientoModalOpen(true);
  };

  const handleOpenDetail = (insumo: Insumo) => {
    setDetailInsumo(insumo);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditStock = (stockItem: InsumoStock) => {
    setEditingStockItem(stockItem);
    setIsEditStockModalOpen(true);
  };

  const confirmDeleteInsumo = async () => {
    if (deleteInsumoId) {
      await deleteInsumo(deleteInsumoId);
      setDeleteInsumoId(null);
    }
  };

  const handleBulkDeleteInsumos = async () => {
    if (selectedInsumoIds.length > 0) {
      await bulkDeleteInsumos(selectedInsumoIds);
      setSelectedInsumoIds([]);
      setIsBulkDeleteOpen(false);
    }
  };

  const toggleSelectInsumo = (id: number) => {
    setSelectedInsumoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllInsumos = () => {
    if (selectedInsumoIds.length === filteredInsumos.length) {
      setSelectedInsumoIds([]);
    } else {
      setSelectedInsumoIds(filteredInsumos.map((i) => i.id));
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-emerald-500/10 hover:text-emerald-500 transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
              <Package className="size-8 text-emerald-500" />
              Inventario de Insumos & Kardex
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Control de productos, vacunas, insumos fitosanitarios y auditoría de movimientos por sede.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Can screen="insumos" action="create">
            <Button
              onClick={handleOpenCreateInsumo}
              variant="outline"
              className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 rounded-xl font-bold shadow-sm cursor-pointer"
            >
              <Plus className="size-4 mr-2" /> Insumo Maestro
            </Button>
          </Can>

          <Can screen="insumos" action="update">
            <Button
              onClick={() => handleOpenMovimientoModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <ArrowLeftRight className="size-4 mr-2" /> Movimiento Kardex
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-card p-5 rounded-2xl border border-border glass-effect flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Package className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              CATÁLOGO MAESTRO
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {isLoadingKpis ? '...' : kpis?.totalInsumos || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground">items</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-card p-5 rounded-2xl border border-border glass-effect flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${
            (kpis?.stockBajoCount || 0) > 0
              ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          }`}>
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              STOCK CRÍTICO
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-2xl font-black ${
                (kpis?.stockBajoCount || 0) > 0 ? 'text-rose-500' : 'text-foreground'
              }`}>
                {isLoadingKpis ? '...' : kpis?.stockBajoCount || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground">con alerta</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-card p-5 rounded-2xl border border-border glass-effect flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <ArrowLeftRight className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              KARDEX MOVIMIENTOS
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {isLoadingKpis ? '...' : kpis?.totalMovimientos || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground">reg.</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-card p-5 rounded-2xl border border-border glass-effect flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Building2 className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              SEDES REGISTRADAS
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-foreground">
                {oficinas?.length || 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground">oficinas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
          <TabsList className="bg-muted/40 p-1 rounded-2xl border border-border glass-effect">
            <TabsTrigger
              value="catalogo"
              className="rounded-xl px-4 py-2 font-bold text-xs cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
            >
              <Package className="size-4 mr-2" /> Catálogo Maestro
            </TabsTrigger>
            <TabsTrigger
              value="existencias"
              className="rounded-xl px-4 py-2 font-bold text-xs cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
            >
              <Warehouse className="size-4 mr-2" /> Existencias / Stock
            </TabsTrigger>
            <TabsTrigger
              value="kardex"
              className="rounded-xl px-4 py-2 font-bold text-xs cursor-pointer data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
            >
              <History className="size-4 mr-2" /> Kardex
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: CATÁLOGO MAESTRO */}
        <TabsContent value="catalogo" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border glass-effect">
            <div className="w-full sm:w-[320px]">
              <SearchInput
                placeholder="Buscar por código, nombre o marca..."
                value={insumoSearch}
                onChange={(e) => {
                  setInsumoSearch(e.target.value);
                  setInsumoPage(1);
                }}
                onClear={() => {
                  setInsumoSearch('');
                  setInsumoPage(1);
                }}
                className="h-10 rounded-xl bg-background/80"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background/80 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Todas las Categorías" />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="ALL">Todas las Categorías</SelectItem>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedInsumoIds.length > 0 && (
                <Can screen="insumos" action="delete">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteOpen(true)}
                    className="h-10 px-3 rounded-xl text-xs font-bold animate-in fade-in"
                  >
                    <Trash2 className="size-4 mr-1.5" />
                    Eliminar ({selectedInsumoIds.length})
                  </Button>
                </Can>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
            <InsumosCatalogTable
              insumos={filteredInsumos}
              selectedInsumoIds={selectedInsumoIds}
              onToggleSelectAll={toggleSelectAllInsumos}
              onToggleSelectInsumo={toggleSelectInsumo}
              onOpenDetail={handleOpenDetail}
              onOpenMovimientoModal={handleOpenMovimientoModal}
              onOpenEdit={handleOpenEditInsumo}
              onDelete={setDeleteInsumoId}
              isLoading={isLoadingInsumos}
            />

            {!isLoadingInsumos && filteredInsumos.length > 0 && (
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <Pagination
                  pagination={insumosPagination}
                  onPageChange={setInsumoPage}
                  onLimitChange={setInsumoLimit}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: EXISTENCIAS Y STOCK POR OFICINA */}
        <TabsContent value="existencias" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border glass-effect">
            <div className="w-full sm:w-[320px]">
              <SearchInput
                placeholder="Buscar por insumo o código..."
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
                onClear={() => {
                  setStockSearch('');
                  setStockPage(1);
                }}
                className="h-10 rounded-xl bg-background/80"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={selectedOficinaId ? String(selectedOficinaId) : 'ALL'}
                onValueChange={(val) => {
                  setSelectedOficinaId(val === 'ALL' ? undefined : Number(val));
                  setStockPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px] h-10 bg-background/80 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Todas las oficinas / sedes" />
                </SelectTrigger>
                <SelectContent className="glass-effect max-h-60">
                  <SelectItem value="ALL">Todas las Sedes</SelectItem>
                  {oficinas.map((of) => (
                    <SelectItem key={of.id} value={String(of.id)}>
                      {of.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={onlyLowStock ? 'destructive' : 'outline'}
                onClick={() => {
                  setOnlyLowStock(!onlyLowStock);
                  setStockPage(1);
                }}
                className="h-10 rounded-xl text-xs font-bold cursor-pointer"
              >
                <AlertTriangle className="size-4 mr-1.5" />
                {onlyLowStock ? 'Mostrando Stock Crítico' : 'Filtrar Stock Crítico'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
            <StockExistenciasTable
              stock={stock}
              isLoading={isLoadingStock}
              onOpenEditStock={handleOpenEditStock}
              onOpenMovimientoModal={handleOpenMovimientoModal}
            />

            {!isLoadingStock && stock.length > 0 && (
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <Pagination
                  pagination={stockPagination}
                  onPageChange={setStockPage}
                  onLimitChange={setStockLimit}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: KARDEX DE MOVIMIENTOS */}
        <TabsContent value="kardex" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border glass-effect">
            <div className="w-full sm:w-[320px]">
              <SearchInput
                placeholder="Buscar por insumo, lote u observación..."
                value={kardexSearch}
                onChange={(e) => {
                  setKardexSearch(e.target.value);
                  setKardexPage(1);
                }}
                onClear={() => {
                  setKardexSearch('');
                  setKardexPage(1);
                }}
                className="h-10 rounded-xl bg-background/80"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={kardexTipoMov}
                onValueChange={(val) => {
                  setKardexTipoMov(val);
                  setKardexPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-10 bg-background/80 rounded-xl text-xs font-semibold">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="glass-effect">
                  <SelectItem value="ALL">Todos los Movimientos</SelectItem>
                  <SelectItem value="ENTRADA">Entradas (+)</SelectItem>
                  <SelectItem value="SALIDA">Salidas (-)</SelectItem>
                  <SelectItem value="CONSUMO">Consumos Campo</SelectItem>
                  <SelectItem value="AJUSTE_MAS">Ajuste Positivo (+)</SelectItem>
                  <SelectItem value="AJUSTE_MENOS">Ajuste Negativo (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
            <KardexMovimientosTable
              movimientos={movimientos}
              isLoading={isLoadingKardex}
            />

            {!isLoadingKardex && movimientos.length > 0 && (
              <div className="px-6 py-4 border-t border-border bg-muted/20">
                <Pagination
                  pagination={kardexPagination}
                  onPageChange={setKardexPage}
                  onLimitChange={setKardexLimit}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Single Insumo Dialog */}
      <AlertDialog open={!!deleteInsumoId} onOpenChange={(open) => !open && setDeleteInsumoId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
              <AlertTriangle className="size-7 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-center uppercase tracking-tight">
              ¿Eliminar insumo del catálogo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-xs">
              Esta acción eliminará el registro maestro del insumo. No se podrá eliminar si tiene registros de stock o movimientos en Kardex vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 pt-3">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInsumo}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer shadow-lg shadow-rose-500/20"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Insumos Dialog */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3 border border-rose-500/20">
              <Trash2 className="size-7 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-center uppercase tracking-tight">
              ¿Eliminar {selectedInsumoIds.length} insumos seleccionados?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium text-xs">
              Se intentará eliminar en lote los insumos seleccionados. Aquellos insumos que posean existencias o movimientos activos se omitirán automáticamente por seguridad de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 pt-3">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteInsumos}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer shadow-lg shadow-rose-500/20"
            >
              Eliminar Selección
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Insumo (Crear / Editar) */}
      <InsumoModal
        isOpen={isInsumoModalOpen}
        onClose={() => {
          setIsInsumoModalOpen(false);
          setEditingInsumo(null);
        }}
        insumo={editingInsumo}
        categorias={categorias}
        unidades={unidades}
        onSave={async (data) => {
          if (editingInsumo) {
            await updateInsumo({ id: editingInsumo.id, dto: data });
          } else {
            await createInsumo(data);
          }
        }}
      />

      {/* Modal Movimiento Manual Kardex */}
      <MovimientoStockModal
        isOpen={isMovimientoModalOpen}
        onClose={() => {
          setIsMovimientoModalOpen(false);
          setPreselectedInsumoId(null);
        }}
        insumos={insumos}
        oficinas={oficinas}
        preselectedInsumoId={preselectedInsumoId}
        onSave={async (data) => {
          await registrarMovimientoManual(data);
        }}
      />

      {/* Modal Editar Config Stock (Lote, Vencimiento, Mínimo) */}
      <EditStockModal
        isOpen={isEditStockModalOpen}
        onClose={() => {
          setIsEditStockModalOpen(false);
          setEditingStockItem(null);
        }}
        stockItem={editingStockItem}
        onSave={async (dto) => {
          if (editingStockItem) {
            await updateStockItem({ id: editingStockItem.id, dto });
          }
        }}
      />

      {/* Modal Detalle Insumo */}
      <InsumoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailInsumo(null);
        }}
        insumo={detailInsumo}
        onEdit={handleOpenEditInsumo}
      />
    </div>
  );
};

export default Inventario;
