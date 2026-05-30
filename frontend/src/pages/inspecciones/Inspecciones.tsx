import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Activity,
  Download,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInspecciones } from '@/hooks/use-inspecciones';
import Can from '@/components/auth/Can';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import { InspeccionTable } from './components/InspeccionTable';
import { InspeccionModal } from './components/InspeccionModal';
import { InspeccionDetailsModal } from './components/InspeccionDetailsModal';
import type { Inspeccion } from '@/types/inspecciones';

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  PENDIENTE: 'Pendientes',
  INSPECCIONANDO: 'En inspección',
  FINALIZADA: 'Finalizadas',
  NO_APROBADA: 'No aprobadas',
  SEGUIMIENTO: 'Seguimiento',
  CUARENTENA: 'Cuarentena',
  NO_ATENDIDA: 'No atendidas',
};

export default function Inspecciones() {
  const navigate = useNavigate();
  const location = useLocation();
  const { canUpdate, canDelete } = useModulePermissions('inspecciones');

  const {
    inspecciones,
    pagination,
    isLoading,
    searchQuery,
    statusFilter,
    setPage,
    setLimit,
    setSearchQuery,
    setStatusFilter,
    deleteInspeccion,
    exportInspecciones,
    exportInspeccionesPdf,
    openPdfReport,
    pdfLoadingId,
  } = useInspecciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedInspeccion, setSelectedInspeccion] = useState<Inspeccion | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [initialPlanificacionId, setInitialPlanificacionId] = useState<number | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const planId = params.get('planificacion_id');
    if (params.get('openModal') === 'true') {
      if (planId) setInitialPlanificacionId(Number(planId));
      setSelectedInspeccion(null);
      setIsModalOpen(true);
      navigate('/home/inspecciones', { replace: true });
    }
  }, [location.search, navigate]);

  const handleOpenCreate = () => {
    setSelectedInspeccion(null);
    setInitialPlanificacionId(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inspeccion: Inspeccion) => {
    setSelectedInspeccion(inspeccion);
    setIsModalOpen(true);
  };

  const handleOpenView = (inspeccion: Inspeccion) => {
    setDetailsId(inspeccion.id);
    setIsDetailsOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteInspeccion(deleteId);
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Inspecciones Generales
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm sm:text-base pl-0 sm:pl-12">
              Registro y seguimiento de inspecciones de campo vinculadas a planificaciones.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  title="Filtrar por estatus"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    statusFilter !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <Activity
                    className={cn(
                      'size-4 shrink-0',
                      statusFilter !== 'all' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span className="sr-only">
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent position="popper" className="glass-effect border-border max-h-72">
                  <SelectItem value="all" className="cursor-pointer">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="PENDIENTE" className="cursor-pointer">
                    Pendientes
                  </SelectItem>
                  <SelectItem value="INSPECCIONANDO" className="cursor-pointer font-bold text-blue-500">
                    En inspección
                  </SelectItem>
                  <SelectItem value="FINALIZADA" className="cursor-pointer text-emerald-500 font-bold">
                    Finalizadas
                  </SelectItem>
                  <SelectItem value="NO_APROBADA" className="cursor-pointer text-rose-500">
                    No aprobadas
                  </SelectItem>
                  <SelectItem value="SEGUIMIENTO" className="cursor-pointer text-indigo-500">
                    Seguimiento
                  </SelectItem>
                  <SelectItem value="CUARENTENA" className="cursor-pointer text-orange-500 font-semibold">
                    Cuarentena
                  </SelectItem>
                  <SelectItem value="NO_ATENDIDA" className="cursor-pointer text-slate-500">
                    No atendidas
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-[16rem]">
                <SearchInput
                  placeholder="N° control, código, atendido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <ModuleToolbarActions
                screen="inspecciones"
                onExport={exportInspecciones}
                onExportPdf={exportInspeccionesPdf}
                exportTitle="Exportar en excel"
                exportPdfTitle="Exportar en PDF"
                onCreate={handleOpenCreate}
                createLabel="Nueva Inspección"
                createTitle="Registrar nueva inspección"
              />
            </div>
          </div>
        </div>

        {statusFilter !== 'all' && (
          <p className="text-xs font-semibold text-muted-foreground -mt-2 sm:pl-12">
            Filtro activo:{' '}
            <span className="text-primary">{STATUS_LABELS[statusFilter] ?? statusFilter}</span>
          </p>
        )}
      </div>

      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 bg-card/30 m-3 sm:m-4 rounded-2xl border border-dashed">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-base">
              Cargando inspecciones...
            </p>
          </div>
        ) : (
          <>
            <InspeccionTable
              inspecciones={inspecciones}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onPdf={openPdfReport}
              pdfLoadingId={pdfLoadingId}
              canEdit={canUpdate}
              canDelete={canDelete}
            />
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-border bg-muted/20">
              <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
            </div>
          </>
        )}
      </div>

      <InspeccionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInspeccion(null);
          setInitialPlanificacionId(undefined);
        }}
        inspeccion={selectedInspeccion}
        initialPlanificacionId={initialPlanificacionId}
      />

      <InspeccionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsId(null);
        }}
        inspeccionId={detailsId}
        onPdf={openPdfReport}
        pdfLoadingId={pdfLoadingId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 w-[calc(100vw-1.5rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-center italic uppercase leading-tight">
              ¿Eliminar inspección?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-2 sm:px-4 text-sm">
              Se restaurará el inventario de insumos consumidos. No se puede eliminar si tiene avales o
              hallazgos epidemiológicos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-center gap-2 sm:gap-3 pt-2 sm:pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20 w-full sm:w-auto"
            >
              Confirmar eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
