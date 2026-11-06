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
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-140 glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0 flex flex-col max-h-[min(92vh,48rem)]">
        <div className="bg-primary/5 p-4 sm:p-6 pr-12 pb-4 border-b border-border/50 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate">
              <Server className="size-5 sm:size-6 text-primary shrink-0" />
              <span className="truncate">Usuarios — {instance?.nombre_mostrable}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground italic py-8 text-center">
              No hay usuarios vinculados a esta instancia.
            </p>
          ) : (
            <ul className="space-y-2">
              {assignments.map((a) => (
                <li
                  key={`${a.usuario_id}-${a.instancia_id}`}
                  className="flex items-center gap-3 rounded-xl border border-border p-3 sm:px-4 sm:py-3"
                >
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm break-words">
                      {a.usuarios?.username ?? `Usuario #${a.usuario_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {a.usuarios?.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
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

        <DialogFooter className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 shrink-0 flex items-center justify-end w-full">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-10 sm:h-11 px-6 cursor-pointer w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
