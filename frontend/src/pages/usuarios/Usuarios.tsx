import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, User, AlertTriangle, Power } from 'lucide-react';
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
import { useUsers } from '@/hooks/use-users';
import Can from '@/components/auth/Can';
import { UsuariosTable } from './components/UsuariosTable';
import { UsuarioModal } from './components/UsuarioModal';
import { UsuarioInstanciasDialog } from './components/UsuarioInstanciasDialog';
import type { MasterUser } from '@/types/user';

export default function Usuarios() {
  const navigate = useNavigate();

  const {
    users,
    pagination,
    isLoading,
    search,
    status,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    updateUserStatus,
    deleteUser,
    isDeleting,
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstancesOpen, setIsInstancesOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MasterUser | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: MasterUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleManageInstances = (user: MasterUser) => {
    setSelectedUser(user);
    setIsInstancesOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteUser(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await updateUserStatus({ id, status: !currentStatus });
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
              <User className="size-7 sm:size-8 text-primary shrink-0" />
              <span className="truncate">Usuarios del sistema</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium pl-9 sm:pl-12 wrap-break-words">
            Cuentas globales, credenciales y acceso por instancia.
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
                <SelectItem value="all" className="cursor-pointer">Todos los Estados</SelectItem>
                <SelectItem value="true" className="cursor-pointer">Activos</SelectItem>
                <SelectItem value="false" className="cursor-pointer">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block shrink-0" />

            <div className="flex-1 min-w-0 w-full sm:w-64 lg:w-80">
              <SearchInput
                placeholder="Buscar usuario o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background w-full"
              />
            </div>
          </div>

          <Can screen="usuarios" action="create">
            <Button onClick={handleOpenCreate} variant="primary" className="w-full sm:w-auto shrink-0 justify-center shadow-lg shadow-primary/20">
              <Plus className="size-5 text-white" />
              <span className="text-white">Nuevo usuario</span>
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
            <UsuariosTable
              users={users}
              onEdit={handleOpenEdit}
              onDelete={setDeleteId}
              onManageInstances={handleManageInstances}
              onToggleStatus={handleToggleStatus}
            />
            <div className="p-4 sm:px-6 sm:py-4 border-t border-border bg-muted/20">
              <Pagination pagination={pagination} onPageChange={setPage} onLimitChange={setLimit} />
            </div>
          </>
        )}
      </div>

      <UsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />

      <UsuarioInstanciasDialog
        isOpen={isInstancesOpen}
        onClose={() => setIsInstancesOpen(false)}
        user={selectedUser}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 w-[calc(100vw-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center uppercase">
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Se eliminará la cuenta y todas sus asignaciones a instancias. Esta acción no se puede deshacer.
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
