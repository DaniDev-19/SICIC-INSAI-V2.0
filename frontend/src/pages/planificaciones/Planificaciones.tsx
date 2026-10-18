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
  Calendar as CalendarIcon,
  CalendarDays,
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
import Can from '@/components/auth/Can';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { PlanificacionTable } from './components/PlanificacionTable';
import { PlanificacionModal } from './components/PlanificacionModal';
import { PlanificacionCalendar } from './components/PlanificacionCalendar';
import { PlanificacionDetailsModal } from './components/PlanificacionDetailsModal';
import { PlanificacionEmpleadosModal } from './components/PlanificacionEmpleadosModal';

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  PENDIENTE: 'Pendientes',
  INSPECCIONANDO: 'En Inspección',
  FINALIZADA: 'Finalizadas',
  NO_APROBADA: 'No Aprobadas',
  SEGUIMIENTO: 'Seguimiento',
  CUARENTENA: 'Cuarentena',
  NO_ATENDIDA: 'No Atendidas',
};

const Planificaciones: React.FC = () => {
  const navigate = useNavigate();
  const {
    planificaciones,
    pagination,
    isLoading,
    search,
    status,
    fechaProgramada,
    periodo,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setFechaProgramada,
    setPeriodo,
    deletePlanificacion,
    exportPlanificaciones,
    exportPlanificacionesPdf,
  } = usePlanificaciones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isEmpleadosModalOpen, setIsEmpleadosModalOpen] = useState(false);
  const [selectedEmpleadosPlan, setSelectedEmpleadosPlan] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarInitialDate, setCalendarInitialDate] = useState<string>('');
  const [detailsId, setDetailsId] = useState<number | null>(null);

  const handleOpenEditEmpleados = (plan: any) => {
    setSelectedEmpleadosPlan(plan);
    setIsEmpleadosModalOpen(true);
  };

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
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 sm:max-w-7xl max-w-2xl animate-in fade-in duration-500 pb-28 sm:pb-32">

      {/* ── Header + Filtros (mismo patrón que Inspecciones) ── */}
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
                Planificación y Agendamiento
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm sm:text-base pl-2 pr-20 sm:pr-0 sm:pl-12">
              Planifique y asigne inspectores a las visitas técnicas de inspección.
            </p>
          </div>

          {/* Barra de filtros + acciones */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center justify-center md:justify-normal gap-2 bg-muted/30 p-3 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0">

              {/* Filtro estatus */}
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  title="Filtrar por Estatus"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    status !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <Activity className={cn('size-4 shrink-0', status !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="sr-only"><SelectValue /></span>
                </SelectTrigger>
                <SelectContent position="popper" className="glass-effect border-border max-h-72">
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

              {/* Filtro período */}
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger
                  title="Filtrar por Período"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    periodo !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <CalendarDays className={cn('size-4 shrink-0', periodo !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="sr-only"><SelectValue /></span>
                </SelectTrigger>
                <SelectContent position="popper" className="glass-effect border-border">
                  <SelectItem value="all" className="cursor-pointer">Sin Filtro Temporal</SelectItem>
                  <SelectItem value="semana" className="cursor-pointer">Esta Semana</SelectItem>
                  <SelectItem value="mes" className="cursor-pointer">Este Mes</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro fecha */}
              <div className="relative flex items-center shrink-0">
                <Input
                  type="date"
                  value={fechaProgramada}
                  onChange={(e) => setFechaProgramada(e.target.value)}
                  className={cn(
                    'h-10 rounded-xl bg-background/80 border-border text-xs px-2.5 w-36 font-semibold transition-all cursor-pointer',
                    fechaProgramada && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20 text-primary pr-8'
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

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              {/* Búsqueda */}
              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-56">
                <SearchInput
                  placeholder="Buscar por código, actividad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <ModuleToolbarActions
                screen="planificacion"
                exportAction="see"
                onExport={exportPlanificaciones}
                onExportPdf={exportPlanificacionesPdf}
                exportTitle="Exportar en excel"
                exportPdfTitle="Exportar en PDF"
                createLabel="Nueva Planificación"
              />

              {/* Botón nueva planificación inline */}
              <Can screen="planificacion" action="create">
                <Button
                  onClick={handleOpenCreate}
                  title="Agendar nueva Inspección"
                  variant="primary"
                  size="sm"
                  className="shrink-0 text-white shadow-md shadow-primary/10 hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <Plus className="size-4 text-white" />
                  <span className="text-white hidden sm:inline">Nueva Planificación</span>
                  <span className="text-white sm:hidden">Nueva</span>
                </Button>
              </Can>
            </div>
          </div>
        </div>

        {/* Filtro activo badge */}
        {status !== 'all' && (
          <p className="text-xs font-semibold text-muted-foreground -mt-2 sm:pl-12">
            Filtro activo:{' '}
            <span className="text-primary">{STATUS_LABELS[status] ?? status}</span>
          </p>
        )}
      </div>

      {/* ── Selector vista Lista / Calendario ── */}
      <div className="flex items-center justify-center border-b border-border/30 pb-3">
        <div className="flex items-center gap-1.5 bg-muted/30 p-1.5 rounded-xl border border-border backdrop-blur-sm shadow-inner w-full sm:max-w-md">
          <button
            onClick={() => setViewMode('list')}
            title="Lista"
            className={cn(
              'flex-1 flex justify-center cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all',
              viewMode === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <List className="size-4" />
            Vista de Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            title="calendario"
            className={cn(
              'flex-1 flex justify-center cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all',
              viewMode === 'calendar'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            <CalendarIcon className="size-4" />
            Calendario
          </button>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      {viewMode === 'list' ? (
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xl overflow-hidden glass-effect">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4 bg-card/30 m-3 sm:m-4 rounded-2xl border border-dashed">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <Loader2 className="size-10 text-primary animate-spin" />
              </div>
              <p className="text-muted-foreground font-medium animate-pulse text-sm sm:text-base">
                Cargando agenda de planificación...
              </p>
            </div>
          ) : (
            <>
              <PlanificacionTable
                planificaciones={planificaciones}
                onView={(id) => setDetailsId(id)}
                onEdit={handleOpenEdit}
                onDelete={setDeleteId}
                onEditEmpleados={handleOpenEditEmpleados}
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
      ) : (
        <div className="bg-card rounded-2xl sm:rounded-3xl border border-border shadow-xl p-4 sm:p-6 glass-effect">
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
        onEditEmpleados={() => {
          const plan = planificaciones.find(p => p.id === detailsId);
          if (plan) {
            handleOpenEditEmpleados(plan);
          }
        }}
      />

      <PlanificacionEmpleadosModal
        isOpen={isEmpleadosModalOpen}
        onClose={() => {
          setIsEmpleadosModalOpen(false);
          setSelectedEmpleadosPlan(null);
        }}
        planificacion={selectedEmpleadosPlan}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 w-[calc(100vw-1.5rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR PLANIFICACIÓN?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-2 sm:px-4 text-sm">
              Esta acción borrará permanentemente la planificación. Si tiene inspecciones o actas de silos asociadas, el sistema impedirá el borrado por seguridad.
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

export default Planificaciones;
