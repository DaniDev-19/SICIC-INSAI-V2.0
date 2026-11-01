import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Activity,
  AlertCircle,
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
import { useSolicitudes } from '@/hooks/use-solicitudes';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { SolicitudTable } from './components/SolicitudTable';
import { SolicitudModal } from './components/SolicitudModal';
import { SolicitudWizard } from './components/SolicitudWizard';

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  CREADA: 'Creadas',
  DIAGNOSTICADA: 'Diagnosticadas',
  PLANIFICADA: 'Planificadas',
  INSPECCIONANDO: 'En Inspección',
  FINALIZADA: 'Finalizadas',
  NO_APROBADA: 'No Aprobadas',
  SEGUIMIENTO: 'Seguimiento',
  CUARENTENA: 'Cuarentena',
  NO_ATENDIDA: 'No Atendidas',
};

const Solicitudes: React.FC = () => {
  const navigate = useNavigate();
  const {
    solicitudes,
    tipos,
    pagination,
    isLoading,
    search,
    estatus,
    prioridad,
    setPage,
    setLimit,
    setSearch,
    setEstatus,
    setPrioridad,
    deleteSolicitud,
    createTipo,
    updateTipo,
    deleteTipo,
    exportSolicitudes,
    exportSolicitudesPdf,
  } = useSolicitudes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [initialFechaProgramada, setInitialFechaProgramada] = useState<string | undefined>(undefined);

  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openWizard') === 'true') {
      const fecha = params.get('fecha');
      if (fecha) {
        setInitialFechaProgramada(fecha);
      } else {
        setInitialFechaProgramada(undefined);
      }
      setIsWizardOpen(true);
      navigate('/home/solicitudes', { replace: true });
    }
  }, [location, navigate]);

  const handleOpenCreate = () => {
    setIsWizardOpen(true);
  };

  const handleOpenEdit = (solicitud: any) => {
    setSelectedSolicitud(solicitud);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteSolicitud(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 sm:max-w-7xl max-w-2xl animate-in fade-in duration-500 pb-28 sm:pb-32">

      {/* ── Header + Filtros (patrón Inspecciones) ── */}
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 border-b border-border/10 pb-4 md:pb-5">

          {/* Título */}
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
                Gestión de Solicitudes
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm sm:text-base pl-2 pr-20 sm:pr-0 sm:pl-12">
              Administra los requerimientos de inspección y vigilancia del sistema.
            </p>
          </div>

          {/* Barra de filtros + acciones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center justify-center md:justify-normal gap-2 bg-muted/30 p-3 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0">

              {/* Filtro Estatus */}
              <Select value={estatus} onValueChange={setEstatus}>
                <SelectTrigger
                  title="Filtrar por Estatus"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    estatus !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <Activity className={cn('size-4 shrink-0', estatus !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="sr-only"><SelectValue /></span>
                </SelectTrigger>
                <SelectContent position="popper" className="glass-effect border-border max-h-72">
                  <SelectItem value="all" className="cursor-pointer">Todos los Estados</SelectItem>
                  <SelectItem value="CREADA" className="cursor-pointer">Creadas</SelectItem>
                  <SelectItem value="DIAGNOSTICADA" className="cursor-pointer">Diagnosticadas</SelectItem>
                  <SelectItem value="PLANIFICADA" className="cursor-pointer">Planificadas</SelectItem>
                  <SelectItem value="INSPECCIONANDO" className="cursor-pointer">En Inspección</SelectItem>
                  <SelectItem value="FINALIZADA" className="cursor-pointer">Finalizadas</SelectItem>
                  <SelectItem value="NO_APROBADA" className="cursor-pointer">No Aprobadas</SelectItem>
                  <SelectItem value="SEGUIMIENTO" className="cursor-pointer">Seguimiento</SelectItem>
                  <SelectItem value="CUARENTENA" className="cursor-pointer">Cuarentena</SelectItem>
                  <SelectItem value="NO_ATENDIDA" className="cursor-pointer">No Atendidas</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro Prioridad */}
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger
                  title="Filtrar por Prioridad"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    prioridad !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <AlertCircle className={cn('size-4 shrink-0', prioridad !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="sr-only"><SelectValue /></span>
                </SelectTrigger>
                <SelectContent position="popper" className="glass-effect border-border">
                  <SelectItem value="all" className="cursor-pointer">Todas las Prioridades</SelectItem>
                  <SelectItem value="BAJA" className="cursor-pointer">Baja</SelectItem>
                  <SelectItem value="MEDIA" className="cursor-pointer">Media</SelectItem>
                  <SelectItem value="ALTA" className="cursor-pointer font-bold">Alta</SelectItem>
                  <SelectItem value="URGENTE" className="cursor-pointer text-rose-500 font-bold">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              {/* Búsqueda */}
              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-56">
                <SearchInput
                  placeholder="Buscar por código o descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <ModuleToolbarActions
                screen="solicitudes"
                onExport={exportSolicitudes}
                onExportPdf={exportSolicitudesPdf}
                exportAction="see"
                exportTitle="Exportar en excel"
                exportPdfTitle="Exportar en PDF"
                onCreate={handleOpenCreate}
                createLabel="Nueva Solicitud"
                createTitle="Crear nueva solicitud"
              />
            </div>
          </div>
        </div>

        {/* Badge filtro activo */}
        {estatus !== 'all' && (
          <p className="text-xs font-semibold text-muted-foreground -mt-2 sm:pl-12">
            Filtro activo:{' '}
            <span className="text-primary">{STATUS_LABELS[estatus] ?? estatus}</span>
          </p>
        )}
      </div>

      {/* ── Contenido principal ── */}
      <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 bg-card/30 m-3 sm:m-4 rounded-2xl border border-dashed">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-base">
              Cargando solicitudes...
            </p>
          </div>
        ) : (
          <>
            <SolicitudTable
              solicitudes={solicitudes}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
            />
            <div className="w-full px-3 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted/20">
              <Pagination
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </div>
          </>
        )}
      </div>

      <SolicitudModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSolicitud(null);
        }}
        solicitud={selectedSolicitud}
        tipos={tipos}
        onCreateTipo={createTipo}
        onUpdateTipo={updateTipo}
        onDeleteTipo={deleteTipo}
      />

      <SolicitudWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialFechaProgramada={initialFechaProgramada}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 w-[calc(100vw-1.5rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR SOLICITUD?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-2 sm:px-4 text-sm">
              Esta acción borrará permanentemente la solicitud. Si tiene planificaciones asociadas, el sistema impedirá la eliminación por seguridad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-center gap-2 sm:gap-3 pt-2 sm:pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer w-full sm:w-auto">
              Mantener
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20 w-full sm:w-auto"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Solicitudes;
