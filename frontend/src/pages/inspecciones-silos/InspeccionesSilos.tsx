import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Warehouse,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { useActaSilos } from '@/hooks/use-acta-silos';
import Can from '@/components/auth/Can';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import { ActaSiloTable } from './components/ActaSiloTable';
import { ActaSiloModal } from './components/ActaSiloModal';
import { ActaSiloDetailsModal } from './components/ActaSiloDetailsModal';
import type { ActaSilo } from '@/types/acta_silos';

export default function InspeccionesSilos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canUpdate, canDelete } = useModulePermissions('acta_silos');

  const {
    actaSilos,
    pagination,
    isLoading,
    searchQuery,
    setPage,
    setLimit,
    setSearchQuery,
    deleteActaSilo,
    openPdfReport,
    pdfLoadingId,
  } = useActaSilos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedActa, setSelectedActa] = useState<ActaSilo | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [initialPlanificacionId, setInitialPlanificacionId] = useState<number | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get('planificacion_id');
    if (params.get('openModal') === 'true') {
      if (planId) setInitialPlanificacionId(Number(planId));
      setSelectedActa(null);
      setIsModalOpen(true);
      navigate('/home/inspecciones-silos', { replace: true });
    }
  }, [location.search, navigate]);

  const handleOpenCreate = () => {
    setSelectedActa(null);
    setInitialPlanificacionId(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acta: ActaSilo) => {
    setSelectedActa(acta);
    setIsModalOpen(true);
  };

  const handleOpenView = (acta: ActaSilo) => {
    setDetailsId(acta.id);
    setIsDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteActaSilo(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-28 sm:pb-32">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 border-b border-border/10 pb-4 md:pb-5">
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                <Warehouse className="size-7 text-primary" />
                Inspecciones y Registro de Silos
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm sm:text-base pl-0 sm:pl-12">
              Control de inventario, capacidades, afectaciones y resguardo fitosanitario de silos y galpones de almacenamiento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0">
              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-[16rem]">
                <SearchInput
                  placeholder="Buscar acta, silos, productor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>
            </div>

            <Can screen="acta_silos" action="create">
              <Button
                onClick={handleOpenCreate}
                variant="primary"
                className="w-full sm:w-auto shrink-0 text-white shadow-md shadow-primary/10 hover:shadow-lg transition-all cursor-pointer rounded-xl h-11 px-5 font-bold"
              >
                <Plus className="size-5 text-white" />
                <span className="text-white">Nueva Acta de Silo</span>
              </Button>
            </Can>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 bg-card/30 m-3 sm:m-4 rounded-2xl border border-dashed">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-base">
              Cargando actas de silos...
            </p>
          </div>
        ) : (
          <>
            <ActaSiloTable
              actaSilos={actaSilos}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onPdf={openPdfReport}
              pdfLoadingId={pdfLoadingId}
              canEdit={canUpdate}
              canDelete={canDelete}
            />

            {pagination.totalPages > 1 && (
              <div className="p-4 sm:p-5 border-t border-border/50 bg-muted/10">
                <Pagination
                  pagination={pagination}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                />
              </div>
            )}
          </>
        )}
      </div>

      <ActaSiloModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actaSilo={selectedActa}
        initialPlanificacionId={initialPlanificacionId}
      />

      <ActaSiloDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        actaSiloId={detailsId}
        onPdf={openPdfReport}
        pdfLoadingId={pdfLoadingId}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-none shadow-2xl rounded-3xl max-w-md">
          <AlertDialogHeader className="flex flex-col items-center gap-4 text-center">
            <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="size-7" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-black uppercase tracking-wide">
                ¿Eliminar Acta de Silo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Esta acción revertirá los movimientos de inventario asociados. Esta operación es permanente y no se puede deshacer.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="cursor-pointer font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
