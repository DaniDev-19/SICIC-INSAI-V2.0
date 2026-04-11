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
import type { Role, UpdateRoleDto } from '@/types/role';

interface RoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole: Role | null;
  formData: UpdateRoleDto;
  setFormData: React.Dispatch<React.SetStateAction<UpdateRoleDto>>;
  isCreating: boolean;
  isUpdating: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePermission: (screen: string, action: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleScope: (screen: string, checked: boolean) => void;
}

export function RoleDialog({
  isOpen,
  onOpenChange,
  editingRole,
  formData,
  setFormData,
  isCreating,
  isUpdating,
  onSubmit,
  onTogglePermission,
  onToggleAll,
  onToggleScope,
}: RoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl glass-effect">
        <form onSubmit={onSubmit} className="flex flex-col h-full overflow-hidden">
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
                    placeholder="Ej: MODERADOR, AUDITOR_EXTERNO..."
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="bg-muted/30 border-none h-12 text-base font-bold focus-visible:ring-primary/30 mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Operativa</label>
                  <Input
                    placeholder="Breve explicación de las facultades de este rol"
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="bg-muted/50 dark:bg-muted/20 border-border/30 h-12 focus-visible:ring-primary/30 font-medium mt-1"
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
                    className="data-[state=checked]:bg-emerald-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold transition-colors ${formData.status ? 'text-emerald-500' : 'text-muted-foreground'}`}>ACTIVO</span>
                </div>
              </div>
            </div>

            <PermissionsMatrix
              permisos={formData.permisos || {}}
              onTogglePermission={onTogglePermission}
              onToggleAll={onToggleAll}
              onToggleScope={onToggleScope}
            />
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
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
              {editingRole ? 'Sincronizar Cambios' : 'Inicializar Rol'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
