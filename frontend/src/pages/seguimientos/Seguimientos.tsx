import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Filter,
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
import { useSeguimientos } from '@/hooks/use-seguimientos';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { SeguimientoTable } from './components/SeguimientoTable';
import { SeguimientoModal } from './components/SeguimientoModal';
import { SeguimientoTimelineModal } from './components/SeguimientoTimelineModal';
import type { Seguimiento } from '@/types/seguimientos';

const Seguimientos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlInspeccionId = searchParams.get('inspeccion_id');
  const initialOpenModal = searchParams.get('openModal') === 'true';

  const {
    seguimientos,
    pagination,
    isLoading,
    search,
    statusFilter,
    setPage,
    setLimit,
    setSearch,
    setStatusFilter,
    createSeguimiento,
    updateSeguimiento,
    deleteSeguimiento,
  } = useSeguimientos();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingSeguimiento, setEditingSeguimiento] = useState<Seguimiento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [preselectedInspeccionId, setPreselectedInspeccionId] = useState<number | null>(
    urlInspeccionId ? Number(urlInspeccionId) : null
  );

  const [selectedTimelineSeguimiento, setSelectedTimelineSeguimiento] = useState<Seguimiento | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialOpenModal && urlInspeccionId) {
      setPreselectedInspeccionId(Number(urlInspeccionId));
      setIsModalOpen(true);
      // Clean query param
      setSearchParams({}, { replace: true });
    }
  }, [initialOpenModal, urlInspeccionId, setSearchParams]);

  const handleOpenCreateModal = () => {
    setEditingSeguimiento(null);
    setPreselectedInspeccionId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (seg: Seguimiento) => {
    setEditingSeguimiento(seg);
    setIsModalOpen(true);
  };

  const handleViewTimeline = (seg: Seguimiento) => {
    setSelectedTimelineSeguimiento(seg);
    setIsTimelineOpen(true);
  };

  const handleSave = async (data: any) => {
    if (editingSeguimiento) {
      await updateSeguimiento({ id: editingSeguimiento.id, dto: data });
    } else {
      await createSeguimiento(data);
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteSeguimiento(deleteId);
      setDeleteId(null);
    }
  };

  // Filter timeline items for selected inspection
  const timelineSeguimientos = selectedTimelineSeguimiento
    ? seguimientos.filter(
        (s) => s.inspeccion_id === selectedTimelineSeguimiento.inspeccion_id
      )
    : [];

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      {/* Header */}
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
              Seguimientos y Visitas de Control
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Verificación epidemiológica, control de recomendaciones e inspecciones de campo.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            {/* Filter by Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                title="Filtrar por Estatus"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
              >
                <Filter className={`size-4 ${statusFilter !== 'all' ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Estatus" />
                </span>
              </SelectTrigger>
              <SelectContent className="glass-effect border-border top-9 right-15">
                <SelectItem value="all" className="cursor-pointer">Todos los Estatus</SelectItem>
                <SelectItem value="EN_PROCESO" className="cursor-pointer">En Proceso</SelectItem>
                <SelectItem value="CUMPLIDO" className="cursor-pointer">Cumplido</SelectItem>
                <SelectItem value="CUARENTENA" className="cursor-pointer">Cuarentena</SelectItem>
                <SelectItem value="NO_CUMPLIDO" className="cursor-pointer">No Cumplido</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            {/* Search Bar */}
            <div className="w-full sm:w-[18rem] lg:w-[22rem]">
              <SearchInput
                placeholder="N° Control, propiedad o hallazgos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            {/* Toolbar Create & Export */}
            <ModuleToolbarActions
              screen="seguimientos"
              onCreate={handleOpenCreateModal}
              createLabel="Nuevo Seguimiento"
              createTitle="Registrar visita de seguimiento"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
            <Loader2 className="size-10 text-indigo-500 animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">
              Cargando historial de visitas de seguimiento...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <SeguimientoTable
                seguimientos={seguimientos}
                onViewTimeline={handleViewTimeline}
                onEdit={handleOpenEditModal}
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

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR SEGUIMIENTO?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4 text-xs">
              Esta acción borrará permanentemente la visita de seguimiento y sus evidencias fotográficas asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para Crear / Editar Seguimiento */}
      <SeguimientoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSeguimiento(null);
        }}
        seguimiento={editingSeguimiento}
        preselectedInspeccionId={preselectedInspeccionId}
        onSave={handleSave}
      />

      {/* Modal de Línea de Tiempo de Seguimientos */}
      <SeguimientoTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        inspeccion={selectedTimelineSeguimiento?.inspecciones || null}
        seguimientos={timelineSeguimientos}
        onAddNewSeguimiento={() => {
          if (selectedTimelineSeguimiento?.inspeccion_id) {
            setPreselectedInspeccionId(selectedTimelineSeguimiento.inspeccion_id);
            setEditingSeguimiento(null);
            setIsModalOpen(true);
          }
        }}
      />
    </div>
  );
};

export default Seguimientos;
