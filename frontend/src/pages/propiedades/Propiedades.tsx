import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Download,
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
import { usePropiedades } from '@/hooks/use-propiedades';
import { PropertyTable } from './components/PropertyTable';
import { PropertyModal } from './components/PropertyModal';
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
  } = usePropiedades();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(null);

  const confirmDelete = async () => {
    if (deleteId) {
      await deletePropiedad(deleteId);
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
              Predios y Propiedades
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Inventario nacional de unidades de producción y predios rurales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            <Select value={tipoPropiedadId} onValueChange={setTipoPropiedadId}>
              <SelectTrigger
                title="Filtrar por Tipo"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
              >
                <Filter className={`size-4 ${tipoPropiedadId !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Tipo" />
                </span>
              </SelectTrigger>
              <SelectContent className="glass-effect border-border top-9 right-15">
                <SelectItem value="all" className="cursor-pointer">Todos los Tipos</SelectItem>
                {tipos.map(t => <SelectItem key={t.id} value={t.id.toString()} className="cursor-pointer">{t.nombre}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="w-50 lg:w-70">
              <SearchInput
                placeholder="Nombre o Código INSAI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <Button title='Exportar en excel' variant="ghost" size="icon" onClick={exportPropiedades} className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer">
              <Download className="size-5" />
            </Button>
          </div>

          <Button onClick={() => navigate('/home/clientes')} title="Registrar nuevo predio" variant="primary">
            <Plus className="size-5 text-white" /> <span className="text-white">Registrar en Productor</span>
          </Button>
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
    </div>
  );
};

export default Propiedades;
