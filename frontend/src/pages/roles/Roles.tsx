import { useState, useMemo } from 'react';
import { z } from 'zod';
import { useRoles } from '@/hooks/use-roles';
import { toast } from 'sonner';


import { PANTALLAS } from '@/lib/permisusers';
import {
  Users,
  Plus,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  Trash2,
  X,
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
import { useNavigate } from 'react-router-dom';
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/types/role';

import { RolesTable } from './components/RolesTable';
import { RoleDialog } from './components/RoleDialog';

function Roles() {
  const navigate = useNavigate();
  const {
    roles,
    pagination,
    isLoading,
    setPage,
    setLimit,

    createRole,
    updateRole,
    deleteRole,
    deleteManyRoles,
    updateRoleStatus,
    isCreating,
    isUpdating,
    isDeleting
  } = useRoles();


  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [localSearch, setLocalSearch] = useState('');

  const [formData, setFormData] = useState<UpdateRoleDto>({
    nombre: '',
    descripcion: '',
    permisos: {},
    status: true
  });


  const filteredRoles = useMemo(() => {
    if (!localSearch) return roles;
    const term = localSearch.toLowerCase();
    return roles.filter((role: Role) => {
      const statusText = role.status ? 'activo' : 'inactivo';
      return (
        role.nombre.toLowerCase().includes(term) ||
        (role.descripcion && role.descripcion.toLowerCase().includes(term)) ||
        statusText.includes(term)
      );
    });
  }, [roles, localSearch]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      nombre: '',
      descripcion: '',
      permisos: {},
      status: true
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      nombre: role.nombre,
      descripcion: role.descripcion,
      permisos: role.permisos || {},
      status: role.status ?? true,
    });
    setIsOpen(true);
  };

  const handleTogglePermission = (screen: string, action: string) => {
    setFormData((prev) => {
      const currentPermissions = prev.permisos?.[screen] || [];
      const newPermissions = currentPermissions.includes(action)
        ? currentPermissions.filter((a) => a !== action)
        : [...currentPermissions, action];

      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [screen]: newPermissions,
        },
      };
    });
  };

  const handleToggleAllPermissions = (checked: boolean) => {
    if (checked) {
      const allPerms: Record<string, string[]> = {};
      PANTALLAS.forEach(p => {
        allPerms[p.key] = [...p.ACCIONES];
      });
      setFormData(prev => ({ ...prev, permisos: allPerms }));
    } else {
      setFormData(prev => ({ ...prev, permisos: {} }));
    }
  };

  const handleToggleScopePermissions = (screen: string, checked: boolean) => {
    setFormData(prev => {
      const newPerms = { ...prev.permisos };
      if (checked) {
        const screenDef = PANTALLAS.find(p => p.key === screen);
        if (screenDef) {
          newPerms[screen] = [...screenDef.ACCIONES];
        }
      } else {
        delete newPerms[screen];
      }
      return { ...prev, permisos: newPerms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleSchema = z.object({
      nombre: z.string()
        .min(3, 'El nombre de identidad debe tener al menos 3 caracteres')
        .max(50, 'El nombre es demasiado largo')
        .regex(/^[A-Z0-9_]+$/, 'El nombre debe ser en MAYÚSCULAS y sin espacios (formato IDENTITY)'),
      descripcion: z.string().optional(),
    });

    const validation = roleSchema.safeParse(formData);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }


    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, data: formData });
      } else {
        await createRole(formData as CreateRoleDto);
      }
      setIsOpen(false);
    } catch {
      // Los errores del servidor (como nombre duplicado) 
      // ya se manejan automáticamente en el hook useRoles
    }
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
          {/* Local Table Search */}
          <div className="hidden sm:block">
            <SearchInput
              placeholder="Filtrar vista actual..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onClear={() => setLocalSearch("")}
              className="w-[200px] lg:w-[250px]"
            />
          </div>
          <Button onClick={handleOpenCreate} title='crea un nuevo rol' className="flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
            <Plus className="size-4 text-white" /> <span className="text-white">Nuevo Rol</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="sm:hidden w-full">
        <SearchInput
          placeholder="Filtrar vista actual..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onClear={() => setLocalSearch("")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <Loader2 className="size-10 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Sincronizando base de datos...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-20 bg-card/30 border-2 border-dashed rounded-2xl transition-all hover:bg-card/50">
            <div className="size-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="size-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold">No hay roles configurados</h3>
            <p className="text-muted-foreground mb-6">Comienza creando el primer nivel de acceso para tu personal.</p>
            <Button variant="outline" className='cursor-pointer' onClick={handleOpenCreate}>Crear primer rol</Button>
          </div>
        ) : (
          <>
            <RolesTable
              roles={filteredRoles}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteId(id)}
              onToggleStatus={handleToggleStatus}
            />


            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalCount={filteredRoles.length}
              limit={pagination.limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
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
        onOpenChange={setIsOpen}
        editingRole={editingRole}
        formData={formData}
        setFormData={setFormData}
        isCreating={isCreating}
        isUpdating={isUpdating}
        onSubmit={handleSubmit}
        onTogglePermission={handleTogglePermission}
        onToggleAll={handleToggleAllPermissions}
        onToggleScope={handleToggleScopePermissions}
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
