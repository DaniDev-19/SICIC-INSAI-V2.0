import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Activity,
  AlertCircle,
  Download
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
import { SolicitudTable } from './components/SolicitudTable';
import { SolicitudModal } from './components/SolicitudModal';
import { SolicitudWizard } from './components/SolicitudWizard';

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
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Gestión de Solicitudes
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Administra los requerimientos de inspección y vigilancia del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            {/* Filtro Estatus */}
            <Select value={estatus} onValueChange={setEstatus}>
              <SelectTrigger
                title="Filtrar por Estatus"
                className={cn(
                  "w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden",
                  estatus !== 'all' && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <Activity className={`size-4 ${estatus !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="hidden"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent position="popper" className="glass-effect border-border">
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
                  "w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden",
                  prioridad !== 'all' && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <AlertCircle className={`size-4 ${prioridad !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="hidden"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent position="popper" className="glass-effect border-border">
                <SelectItem value="all" className="cursor-pointer">Todas las Prioridades</SelectItem>
                <SelectItem value="BAJA" className="cursor-pointer">Baja</SelectItem>
                <SelectItem value="MEDIA" className="cursor-pointer">Media</SelectItem>
                <SelectItem value="ALTA" className="cursor-pointer font-bold">Alta</SelectItem>
                <SelectItem value="URGENTE" className="cursor-pointer text-rose-500 font-bold">Urgente</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="w-full sm:w-[18rem] lg:w-[22rem]">
              <SearchInput
                placeholder="Buscar por código o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>
            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <Button title='Exportar en excel' variant="ghost" size="icon" onClick={exportSolicitudes} className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer">
              <Download className="size-5" />
            </Button>
          </div>

          <Button onClick={handleOpenCreate} title="crear nueva solicitud" variant={"primary"}>
            <Plus className="size-5 text-white" /> <span className="text-white">Nueva Solicitud</span>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Cargando solicitudes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <SolicitudTable
                solicitudes={solicitudes}
                onEdit={handleOpenEdit}
                onDelete={setDeleteId}
              />
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/20">
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
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR SOLICITUD?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará permanentemente la solicitud. Si tiene planificaciones asociadas, el sistema impedirá la eliminación por seguridad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
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
