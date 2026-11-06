import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Filter,
  UserPlus,
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
import { usePropiedades } from '@/hooks/use-propiedades';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { PropertyTable } from './components/PropertyTable';
import { PropertyModal } from './components/PropertyModal';
import { PropertyDetallesModal } from './components/PropertyDetallesModal';
import { CrearPropiedadModal } from './components/CrearPropiedadModal';
import type { Propiedad } from '@/types/propiedades';

const Propiedades: React.FC = () => {
  const navigate = useNavigate();
  const {
    propiedades,
    tipos,
    pagination,
    isLoading,
    search,
    tipoPropiedadId,
    setPage,
    setLimit,
    setSearch,
    setTipoPropiedadId,
    deletePropiedad,
    exportPropiedades,
    exportPropiedadesPdf,
  } = usePropiedades();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(null);
  const [viewingPropertyId, setViewingPropertyId] = useState<number | null>(null);

  const confirmDelete = async () => {
    if (deleteId) {
      await deletePropiedad(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-28 sm:pb-32 min-w-0 w-full overflow-hidden sm:overflow-visible">
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
                Predios y Propiedades
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm md:text-base pl-2 sm:pl-12">
              Inventario nacional de unidades de producción y predios rurales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0 min-w-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center justify-center md:justify-normal gap-2 bg-muted/30 p-2 sm:p-2.5 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0 w-full">
              <Select value={tipoPropiedadId} onValueChange={setTipoPropiedadId}>
                <SelectTrigger
                  title="Filtrar por Tipo"
                  className={cn(
                    'h-10 w-10 shrink-0 p-0 rounded-xl bg-background/80 border-border hover:bg-background cursor-pointer justify-center [&>svg:last-child]:hidden',
                    tipoPropiedadId !== 'all' && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                  )}
                >
                  <Filter className={cn('size-4 shrink-0', tipoPropiedadId !== 'all' ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="sr-only">
                    <SelectValue placeholder="Tipo" />
                  </span>
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-h-72 max-w-[calc(100vw-2rem)] sm:max-w-xs">
                  <SelectItem value="all" className="cursor-pointer">Todos los Tipos</SelectItem>
                  {tipos.map(t => <SelectItem key={t.id} value={t.id.toString()} className="cursor-pointer">{t.nombre}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-64">
                <SearchInput
                  placeholder="Nombre o Código INSAI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <Button
                variant="outline"
                onClick={() => navigate('/home/clientes')}
                className="rounded-xl border-dashed border-border hover:bg-muted/50 cursor-pointer flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground h-10 px-2.5 sm:px-3 shrink-0"
                title="Inscribir productor y predio mediante el asistente guiado"
              >
                <UserPlus className="size-4 text-primary shrink-0" />
                <span className="hidden sm:inline">Inscribir con Productor</span>
                <span className="sm:hidden text-[11px] font-semibold">Productor</span>
              </Button>

              <ModuleToolbarActions
                screen="propiedades"
                onExport={exportPropiedades}
                onExportPdf={exportPropiedadesPdf}
                exportTitle="Exportar en excel"
                exportPdfTitle="Exportar en PDF"
                onCreate={() => setIsCreateModalOpen(true)}
                createLabel="Nueva Propiedad"
                createTitle="Registrar nueva propiedad para un productor"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Cargando inventario de predios...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <PropertyTable
                propiedades={propiedades}
                onView={(propiedad) => setViewingPropertyId(propiedad.id)}
                onEdit={setEditingPropiedad}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR PREDIO?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará permanentemente la propiedad. Si tiene solicitudes o inspecciones históricas, el sistema impedirá su eliminación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PropertyModal
        isOpen={!!editingPropiedad}
        onClose={() => setEditingPropiedad(null)}
        propiedad={editingPropiedad}
      />

      <PropertyDetallesModal
        isOpen={!!viewingPropertyId}
        onClose={() => setViewingPropertyId(null)}
        propertyId={viewingPropertyId}
      />

      <CrearPropiedadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Propiedades;
