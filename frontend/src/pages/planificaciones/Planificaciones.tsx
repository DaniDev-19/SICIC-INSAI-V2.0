import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Activity,
  X,
  Download,
  Calendar as CalendarIcon,
  List,
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
import { Input } from '@/components/ui/input';
import { usePlanificaciones } from '@/hooks/use-planificaciones';
import { PlanificacionTable } from './components/PlanificacionTable';
import { PlanificacionModal } from './components/PlanificacionModal';
import { PlanificacionCalendar } from './components/PlanificacionCalendar';
import { PlanificacionDetailsModal } from './components/PlanificacionDetailsModal';

const Planificaciones: React.FC = () => {
  const navigate = useNavigate();
  const {
    planificaciones,
    pagination,
    isLoading,
    search,
    status,
    fechaProgramada,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setFechaProgramada,
    deletePlanificacion,
    exportPlanificaciones,
  } = usePlanificaciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarInitialDate, setCalendarInitialDate] = useState<string>('');
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const handleOpenCreateWithDate = (dateStr: string) => {
    navigate(`/home/solicitudes?openWizard=true&fecha=${dateStr}`);
  };

  const handleOpenCreate = () => {
    navigate('/home/solicitudes?openWizard=true');
  };

  const handleOpenEdit = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deletePlanificacion(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">

      {/* Encabezado */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border/10 pb-4">
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
            <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/85 bg-clip-text">
              Planificación y Agendamiento
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12 text-sm">
            Planifique y asigne inspectores a las visitas técnicas de inspección.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          title="Agendar nueva inspección"
          variant="primary"
          className="w-full sm:w-auto text-white shadow-md shadow-primary/10 hover:shadow-lg transition-all"
        >
          <Plus className="size-5 text-white" /> <span className="text-white">Nueva Planificación</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
        <div className="w-full flex items-center justify-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              title="Filtrar por Estatus"
              className={cn(
                "w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden",
                status !== 'all' && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              <Activity className={cn("size-4 shrink-0", status !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
              <span className="hidden"><SelectValue /></span>
            </SelectTrigger>
            <SelectContent position="popper" className="glass-effect border-border">
              <SelectItem value="all" className="cursor-pointer">Todos los Estados</SelectItem>
              <SelectItem value="PENDIENTE" className="cursor-pointer">Pendientes</SelectItem>
              <SelectItem value="INSPECCIONANDO" className="cursor-pointer font-bold text-blue-500">En Inspección</SelectItem>
              <SelectItem value="FINALIZADA" className="cursor-pointer text-emerald-500 font-bold">Finalizadas</SelectItem>
              <SelectItem value="NO_APROBADA" className="cursor-pointer text-rose-500">No Aprobadas</SelectItem>
              <SelectItem value="SEGUIMIENTO" className="cursor-pointer text-indigo-500">Seguimiento</SelectItem>
              <SelectItem value="CUARENTENA" className="cursor-pointer text-orange-500 font-semibold">Cuarentena</SelectItem>
              <SelectItem value="NO_ATENDIDA" className="cursor-pointer text-slate-500">No Atendidas</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro Fecha */}
          <div className="relative flex items-center shrink-0">
            <Input
              type="date"
              value={fechaProgramada}
              onChange={(e) => setFechaProgramada(e.target.value)}
              className={cn(
                "h-10 rounded-xl bg-background/80 border-border text-xs px-2.5 max-w-[140px] font-semibold transition-all cursor-pointer",
                fechaProgramada && "border-primary/50 bg-primary/5 ring-1 ring-primary/20 text-primary pr-8"
              )}
              title="Filtrar por Fecha Programada"
            />
            {fechaProgramada && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFechaProgramada('')}
                className="size-5 absolute right-2 rounded-full hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer text-muted-foreground transition-all"
                title="Limpiar fecha"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          {/* Buscador */}
          <div className="w-full sm:w-[18rem] lg:w-[22rem]">
            <SearchInput
              placeholder="Buscar por código, actividad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
            />
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          {/* Botón Exportar */}
          <Button
            title="Exportar en excel"
            variant="ghost"
            size="icon"
            onClick={exportPlanificaciones}
            className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer"
          >
            <Download className="size-5" />
          </Button>
        </div>


      </div>

      {/* Selector de Vista (Lista / Calendario) */}
      <div className="flex items-center justify-center border-b border-border/30 pb-3">
        <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-xl border border-border backdrop-blur-sm shadow-inner w-full sm:max-w-md">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "flex-1 flex justify-center cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'list'
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <List className="size-4" />
            Vista de Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              "flex-1 flex justify-center cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
              viewMode === 'calendar'
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            Calendario Interactivo
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <Loader2 className="size-10 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium animate-pulse">Cargando agenda de planificación...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
                <PlanificacionTable
                  planificaciones={planificaciones}
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
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-xl p-6 glass-effect">
          <PlanificacionCalendar
            planificaciones={planificaciones}
            onViewDetails={(id) => setDetailsId(id)}
            onAddVisit={handleOpenCreateWithDate}
          />
        </div>
      )}

      <PlanificacionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
          setCalendarInitialDate('');
        }}
        planificacion={selectedPlan}
        initialDate={calendarInitialDate}
      />

      <PlanificacionDetailsModal
        isOpen={!!detailsId}
        onClose={() => setDetailsId(null)}
        planId={detailsId}
        onEdit={() => {
          const plan = planificaciones.find(p => p.id === detailsId);
          if (plan) {
            handleOpenEdit(plan);
          }
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR PLANIFICACIÓN?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará permanentemente la planificación. Si tiene inspecciones o actas de silos asociadas, el sistema impedirá el borrado por seguridad.
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

export default Planificaciones;
