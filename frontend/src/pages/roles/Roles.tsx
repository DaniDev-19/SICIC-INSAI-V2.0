import { useState } from 'react';
import {
  Users,
  Plus,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  Trash2,
  X,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useRoles } from '@/hooks/use-roles';


import { RolesTable } from './components/RolesTable';
import { RoleDialog } from './components/RoleDialog';

function Roles() {
  const navigate = useNavigate();
  const {
    roles,
    pagination,
    isLoading,
    search,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    updateRoleStatus,
    deleteRole,
    deleteManyRoles,
    isDeleting
  } = useRoles();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingRole, setEditingRole] = useState<typeof roles[0] | null>(null);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (role: typeof roles[0]) => {
    setEditingRole(role);
    setIsOpen(true);
  };



  const confirmDelete = async () => {
    if (deleteId) {
      await deleteRole(deleteId);
      setDeleteId(null);
      setSelectedIds(prev => prev.filter(id => id !== deleteId));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteManyRoles(selectedIds);
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateRoleStatus({ id, status: !currentStatus });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              title='volver'
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Gestión de Roles
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12 md:pl-12">
            Administra los niveles de acceso y permisos del sistema de forma granular.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                title="Filtrar por Estado"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
              >
                <ShieldCheck className={`size-4 ${status !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Estado" />
                </span>
              </SelectTrigger>
              <SelectContent className="glass-effect border-border top-9 right-15">
                <SelectItem value="all" className="cursor-pointer">Todos</SelectItem>
                <SelectItem value="true" className="cursor-pointer">Activos</SelectItem>
                <SelectItem value="false" className="cursor-pointer">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="w-[200px] lg:w-[280px]">
              <SearchInput
                placeholder="Buscar roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>
          </div>

          <Button onClick={handleOpenCreate} title='crea un nuevo rol' variant={'primary'}>
            <Plus className="size-4" /> <span className="hidden sm:inline">Nuevo Rol</span>
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
            <p className="text-muted-foreground font-medium animate-pulse">Sincronizando base de datos...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-20 bg-card/30 border-2 border-dashed rounded-2xl m-4 transition-all hover:bg-card/50">
            <div className="size-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="size-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold">No hay roles configurados</h3>
            <p className="text-muted-foreground mb-6">Comienza creando el primer nivel de acceso para tu personal.</p>
            <Button variant="outline" className='cursor-pointer' onClick={handleOpenCreate}>Crear primer rol</Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <RolesTable
                roles={roles}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeleteId(id)}
                onToggleStatus={handleToggleStatus}
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

      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-foreground text-background dark:bg-card dark:text-foreground px-6 py-4 rounded-2xl shadow-2xl border border-background/10 flex items-center gap-8 glass-effect">
            <div className="flex items-center gap-3 pr-8 border-r border-background/10 dark:border-foreground/10">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                {selectedIds.length}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Seleccionados</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                title='Eliminar seleccionados'
                className="font-bold cursor-pointer hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-inherit"
                onClick={() => setIsBulkDeleteOpen(true)}
              >
                <Trash2 className="size-4 mr-2" /> Eliminar Masivo
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title='Limpiar selección'
                className="rounded-full hover:bg-white/10 dark:hover:bg-foreground/10 cursor-pointer text-inherit"
                onClick={() => setSelectedIds([])}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <RoleDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        role={editingRole}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿Eliminar Jerarquía?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará permanentemente este rol. Los usuarios asociados perderán sus facultades de inmediato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
            >
              Destruir Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿Eliminar {selectedIds.length} Roles?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Se intentará eliminar todos los roles seleccionados (máx 50). Aquellos que estén asignados a usuarios serán omitidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted">Abortar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin size-4" /> : 'Confirmar Purga'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Roles;
