import { useState } from 'react';
import { useRoles } from '@/hooks/use-roles';
import { PANTALLAS, ACCIONES } from '@/lib/permisusers';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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

function Roles() {
  const navigate = useNavigate();
  const { roles, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating } = useRoles();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<UpdateRoleDto>({
    nombre: '',
    descripcion: '',
    permisos: {},
    status: true
  });

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
      let newPermissions;

      if (currentPermissions.includes(action)) {
        newPermissions = currentPermissions.filter((a) => a !== action);
      } else {
        newPermissions = [...currentPermissions, action];
      }

      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [screen]: newPermissions,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, data: formData });
      } else {
        await createRole(formData as CreateRoleDto);
      }
      setIsOpen(false);
    } catch {
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteRole(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all"
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
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
          <Plus className="size-4 text-white" /> <span className="text-white">Nuevo Rol</span>
        </Button>
      </div>

      {/* Roles List */}
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
            <Button variant="outline" onClick={handleOpenCreate}>Crear primer rol</Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border shadow-xl overflow-hidden glass-effect">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre</th>
                    <th className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Descripción</th>
                    <th className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {roles.map((role: Role) => (
                    <tr key={role.id} className="group hover:bg-primary/5 transition-all duration-300">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <ShieldCheck className="size-5" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{role.nombre}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{role.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground font-medium max-w-sm">
                        <p className="line-clamp-1">{role.descripcion || 'Sin descripción detallada'}</p>
                      </td>
                      <td className="px-6 py-5">
                        {role.status ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVO
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                            <div className="size-2 rounded-full bg-rose-500" /> INACTIVO
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(role)}
                            className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(role.id)}
                            className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl glass-effect">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  {editingRole ? <Settings2 className="size-6 text-white" /> : <Plus className="size-6 text-white" />}
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight italic uppercase">
                    {editingRole ? 'Configurar Rol Existente' : 'Arquitectar Nuevo Rol'}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium">
                    Gestiona la identidad y el alcance de este nivel de acceso.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre de Identidad</label>
                    <Input
                      placeholder="Ej: SUPER_ADMIN, AUDITOR_EXTERNO..."
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="bg-muted/30 border-none h-12 text-base font-bold focus-visible:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Operativa</label>
                    <Input
                      placeholder="Breve explicación de las facultades de este rol"
                      value={formData.descripcion || ''}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="bg-muted/50 dark:bg-muted/20 border-border/30 h-12 focus-visible:ring-primary/30 font-medium"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 border border-primary/20">
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Estado del Rol</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Activa o desactiva este rol globalmente</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold transition-colors ${!formData.status ? 'text-rose-500' : 'text-muted-foreground'}`}>INACTIVO</span>
                    <Switch
                      checked={formData.status}
                      onCheckedChange={(val) => setFormData({ ...formData, status: val })}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                    <span className={`text-xs font-bold transition-colors ${formData.status ? 'text-emerald-500' : 'text-muted-foreground'}`}>ACTIVO</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <ShieldAlert className="size-5 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-black italic uppercase tracking-tight">Matriz de Privilegios</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-emerald-500" /> Habilitado</div>
                    <div className="flex items-center gap-1"><div className="size-2 rounded-full bg-muted-foreground/30" /> No Aplica</div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-2xl bg-card/60 dark:bg-card/40 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/60 dark:bg-muted/40 border-b border-border/50">
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground">Módulo / Pantalla</th>
                          {ACCIONES.map(accion => (
                            <th key={accion.key} className="px-4 py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                              {accion.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {PANTALLAS.map(pantalla => (
                          <tr key={pantalla.key} className="hover:bg-primary/5 group transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm text-foreground">{pantalla.label}</span>
                                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">scope: {pantalla.key}</span>
                              </div>
                            </td>
                            {ACCIONES.map(accion => {
                              const isSupported = pantalla.ACCIONES.includes(accion.key);
                              const isChecked = formData.permisos?.[pantalla.key]?.includes(accion.key);

                              return (
                                <td key={accion.key} className="px-4 py-4 text-center">
                                  {isSupported ? (
                                    <div className="flex justify-center">
                                      <Switch
                                        checked={isChecked}
                                        onCheckedChange={() => handleTogglePermission(pantalla.key, accion.key)}
                                        className="scale-90 data-[state=checked]:bg-primary"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-black text-muted-foreground/20 italic">n/a</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic pl-2">
                  * Los cambios en la matriz se aplicarán de forma inmediata tras guardar el rol.
                </p>
              </div>
            </div>

            <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isCreating || isUpdating}
                className="font-bold text-muted-foreground hover:text-foreground"
              >
                Cerrar sin guardar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-11 shadow-lg shadow-primary/20"
              >
                {(isCreating || isUpdating) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {editingRole ? 'Sincronizar Cambios' : 'Inicializar Rol'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted">Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20"
            >
              Destruir Rol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .glass-effect {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
        }
        .dark .glass-effect {
          background: rgba(10, 15, 30, 0.85) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

export default Roles;
