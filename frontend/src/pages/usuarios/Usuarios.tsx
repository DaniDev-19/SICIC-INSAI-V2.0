import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Loader2, User, AlertTriangle } from 'lucide-react';
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
              <User className="size-8 text-primary" />
              Usuarios del sistema
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Cuentas globales, credenciales y acceso por instancia.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-[240px] lg:w-[280px]">
            <SearchInput
              placeholder="Buscar usuario o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="h-10 rounded-xl"
            />
          </div>

          <Can screen="usuarios" action="create">
            <Button onClick={handleOpenCreate} variant="primary" className="shadow-lg shadow-primary/20">
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
            <div className="px-6 py-4 border-t border-border bg-muted/20">
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
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
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
