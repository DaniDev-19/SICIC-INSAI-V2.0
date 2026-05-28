import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, Server, AlertTriangle } from 'lucide-react';
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
import { usePermissions } from '@/hooks/use-permissions';
import { InstanciasTable } from './components/InstanciasTable';
import { InstanciaModal } from './components/InstanciaModal';
import { InstanciaUsuariosDialog } from './components/InstanciaUsuariosDialog';
import type { MasterInstance } from '@/types/instance';

export default function Instancias() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('instancias', 'create');

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
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Server className="size-8 text-primary" />
              Instancias / Sedes
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Registro de sedes operativas vinculadas a bases de datos tenant.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="true">Activas</SelectItem>
              <SelectItem value="false">Inactivas</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[240px] lg:w-[280px]">
            <SearchInput
              placeholder="Buscar por nombre o DB..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="h-10 rounded-xl"
            />
          </div>

          {canCreate && (
            <Button onClick={handleOpenCreate} variant="primary" className="shadow-lg shadow-primary/20">
              <Plus className="size-5 text-white" />
              <span className="text-white">Nueva instancia</span>
            </Button>
          )}
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
            <div className="px-6 py-4 border-t border-border bg-muted/20">
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
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center uppercase">
              ¿Eliminar instancia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Solo se puede eliminar si no hay usuarios vinculados. De lo contrario, desactívela o remueva las asignaciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600 text-white"
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
