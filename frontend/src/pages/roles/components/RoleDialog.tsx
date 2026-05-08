import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, Settings2, ShieldCheck } from 'lucide-react';
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
import { PermissionsMatrix } from './PermissionsMatrix';
import { useRoles } from '@/hooks/use-roles';
import type { Role } from '@/types/role';
import { cn } from '@/lib/utils';
import { PANTALLAS } from '@/lib/permisusers';

const roleSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  descripcion: z.string().default(''),
  status: z.boolean().default(true),
  permisos: z.record(z.string(), z.array(z.string())).default({}),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDialog({
  isOpen,
  onClose,
  role,
}: RoleDialogProps) {
  const { createRole, updateRole, isCreating, isUpdating } = useRoles();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      status: true,
      permisos: {},
    },
  });

  const permisos = watch('permisos') || {};
  const status = watch('status');

  useEffect(() => {
    if (isOpen) {
      if (role) {
        reset({
          nombre: role.nombre || '',
          descripcion: role.descripcion || '',
          status: role.status ?? true,
          permisos: role.permisos || {},
        });
      } else {
        reset({
          nombre: '',
          descripcion: '',
          status: true,
          permisos: {},
        });
      }
    }
  }, [role, reset, isOpen]);

  const onFormSubmit = async (data: RoleFormValues) => {
    try {
      if (role) {
        await updateRole({ id: role.id, data: data as any });
      } else {
        await createRole(data as any);
      }
      onClose();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleTogglePermission = (screen: string, action: string) => {
    const currentPermissions = (permisos as Record<string, string[]>)[screen] || [];
    const newPermissions = currentPermissions.includes(action)
      ? currentPermissions.filter((a) => a !== action)
      : [...currentPermissions, action];

    setValue('permisos', {
      ...permisos,
      [screen]: newPermissions,
    }, { shouldValidate: true });
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const allPerms: Record<string, string[]> = {};
      PANTALLAS.forEach(p => {
        allPerms[p.key] = [...p.ACCIONES];
      });
      setValue('permisos', allPerms, { shouldValidate: true });
    } else {
      setValue('permisos', {}, { shouldValidate: true });
    }
  };

  const handleToggleScope = (screen: string, checked: boolean) => {
    const newPerms = { ...permisos } as Record<string, string[]>;
    if (checked) {
      const screenDef = PANTALLAS.find(p => p.key === screen);
      if (screenDef) {
        newPerms[screen] = [...screenDef.ACCIONES];
      }
    } else {
      delete newPerms[screen];
    }
    setValue('permisos', newPerms, { shouldValidate: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl glass-effect">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                {role ? <Settings2 className="size-6 text-white" /> : <Plus className="size-6 text-white" />}
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight italic uppercase">
                  {role ? 'Configurar Rol Existente' : 'Arquitectar Nuevo Rol'}
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
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Nombre de Identidad <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="Ej: MODERADOR, AUDITOR_EXTERNO..."
                    {...register('nombre')}
                    className={cn(
                      "bg-muted/30 border-none h-12 text-base font-bold focus-visible:ring-primary/30 mt-1 transition-all",
                      errors.nombre && "bg-rose-500/10 ring-1 ring-rose-500/50"
                    )}
                  />
                  {errors.nombre && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Operativa</label>
                  <Input
                    placeholder="Breve explicación de las facultades de este rol"
                    {...register('descripcion')}
                    className="bg-muted/50 dark:bg-muted/20 border-border/30 h-12 focus-visible:ring-primary/30 font-medium mt-1 transition-all"
                  />
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 flex flex-col justify-center items-center gap-4 border border-primary/20">
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Estado del Rol</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Activa o desactiva este rol globalmente</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold transition-colors ${!status ? 'text-rose-500' : 'text-muted-foreground'}`}>INACTIVO</span>
                  <Switch
                    checked={!!status}
                    onCheckedChange={(val) => setValue('status', val)}
                    className="data-[state=checked]:bg-emerald-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold transition-colors ${status ? 'text-emerald-500' : 'text-muted-foreground'}`}>ACTIVO</span>
                </div>
              </div>
            </div>

            <PermissionsMatrix
              permisos={permisos as Record<string, string[]>}
              onTogglePermission={handleTogglePermission}
              onToggleAll={handleToggleAll}
              onToggleScope={handleToggleScope}
            />
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isCreating || isUpdating}
              className="font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cerrar sin guardar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="bg-primary cursor-pointer hover:bg-primary/90 text-white font-black px-8 h-11 shadow-lg shadow-primary/20"
            >
              {(isCreating || isUpdating) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {role ? 'Sincronizar Cambios' : 'Inicializar Rol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
