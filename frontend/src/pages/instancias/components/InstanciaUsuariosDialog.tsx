import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Server, User } from 'lucide-react';
import { useMasterInstance } from '@/hooks/use-instances';
import type { MasterInstance } from '@/types/instance';

interface InstanciaUsuariosDialogProps {
  isOpen: boolean;
  onClose: () => void;
  instance: MasterInstance | null;
}

export function InstanciaUsuariosDialog({ isOpen, onClose, instance }: InstanciaUsuariosDialogProps) {
  const { data: detail, isLoading } = useMasterInstance(isOpen && instance ? instance.id : null);
  const assignments = detail?.usuario_instancia ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-140 glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Server className="size-6 text-primary" />
              Usuarios — {instance?.nombre_mostrable}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic py-8 text-center">
              No hay usuarios vinculados a esta instancia.
            </p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li
                  key={`${a.usuario_id}-${a.instancia_id}`}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {a.usuarios?.username ?? `Usuario #${a.usuario_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {a.usuarios?.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rol: {a.roles?.nombre ?? a.rol_id}
                      {!a.usuarios?.status && ' · Inactivo'}
                    </p>
                  </div>
                  {a.usuarios?.status ? (
                    <span className="text-[10px] font-bold uppercase text-emerald-600 shrink-0">Activo</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-rose-600 shrink-0">Inactivo</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
