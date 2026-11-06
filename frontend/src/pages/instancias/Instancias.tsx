import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, Server, AlertTriangle, Power } from 'lucide-react';
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
import { useInstances } from '@/hooks/use-instances';
import Can from '@/components/auth/Can';
import { InstanciasTable } from './components/InstanciasTable';
import { InstanciaModal } from './components/InstanciaModal';
import { InstanciaUsuariosDialog } from './components/InstanciaUsuariosDialog';
import type { MasterInstance } from '@/types/instance';

export default function Instancias() {
  const navigate = useNavigate();

  const {
    instances,
    pagination,
    isLoading,
    search,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    updateInstanceStatus,
    deleteInstance,
    isDeleting,
  } = useInstances();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<MasterInstance | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenCreate = () => {
    setSelectedInstance(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (instance: MasterInstance) => {
    setSelectedInstance(instance);
    setIsModalOpen(true);
  };

  const handleViewUsers = (instance: MasterInstance) => {
    setSelectedInstance(instance);
    setIsUsersOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteInstance(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await updateInstanceStatus({ id, status: !currentStatus });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-hidden sm:overflow-visible animate-in fade-in duration-500 pb-28 sm:pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 min-w-0">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2 truncate">
              <Server className="size-7 sm:size-8 text-primary shrink-0" />
              <span className="truncate">Instancias / Sedes</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium pl-9 sm:pl-12 break-words">
            Registro de sedes operativas vinculadas a bases de datos tenant.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10 w-full sm:w-auto min-w-0">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                title="Filtrar por Estado"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden shrink-0"
              >
                <Power className={`size-4 ${status !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Estado" />
                </span>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-w-[calc(100vw-2rem)] sm:max-w-xs">
                <SelectItem value="all" className="cursor-pointer">Todas</SelectItem>
                <SelectItem value="true" className="cursor-pointer">Activas</SelectItem>
                <SelectItem value="false" className="cursor-pointer">Inactivas</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block shrink-0" />

            <div className="flex-1 min-w-0 w-full sm:w-64 lg:w-80">
              <SearchInput
                placeholder="Buscar por nombre o DB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background w-full"
              />
            </div>
          </div>

          <Can screen="instancias" action="create">
            <Button onClick={handleOpenCreate} variant="primary" className="w-full sm:w-auto shrink-0 justify-center shadow-lg shadow-primary/20">
              <Plus className="size-5 text-white" />
              <span className="text-white">Nueva instancia</span>
            </Button>
          </Can>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="size-10 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <InstanciasTable
              instances={instances}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onToggleStatus={handleToggleStatus}
              onViewUsers={handleViewUsers}
            />
            <div className="p-4 sm:px-6 sm:py-4 border-t border-border bg-muted/20">
              <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
            </div>
          </>
        )}
      </div>

      <InstanciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instance={selectedInstance}
      />

      <InstanciaUsuariosDialog
        isOpen={isUsersOpen}
        onClose={() => setIsUsersOpen(false)}
        instance={selectedInstance}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center uppercase">
              ¿Eliminar instancia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-2">
              Solo se puede eliminar si no hay usuarios vinculados. De lo contrario, desactívela o remueva las asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin mr-2" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
