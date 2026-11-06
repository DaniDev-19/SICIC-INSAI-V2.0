import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Server, Trash2 } from 'lucide-react';
import { useUsers, useMasterUser } from '@/hooks/use-users';
import { useInstancesOptions } from '@/hooks/use-instances';
import { roleService } from '@/services/role.service';
import type { MasterUser } from '@/types/user';

interface UsuarioInstanciasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: MasterUser | null;
}

export function UsuarioInstanciasDialog({ isOpen, onClose, user }: UsuarioInstanciasDialogProps) {
  const { assignInstance, removeInstance, isAssigning } = useUsers();
  const [instanciaId, setInstanciaId] = useState('');
  const [rolId, setRolId] = useState('');

  const { data: userDetail, isLoading: loadingUser } = useMasterUser(isOpen && user ? user.id : null);
  const { data: instances = [], isLoading: loadingInstances } = useInstancesOptions(isOpen);

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles-options'],
    queryFn: () => roleService.getRoles({ limit: 200, status: 'true' }),
    enabled: isOpen,
    select: (res) => res.data || [],
  });

  const assignments = userDetail?.usuario_instancia ?? user?.usuario_instancia ?? [];

  const assignedInstanceIds = new Set(assignments.map((a) => a.instancia_id));
  const availableInstances = instances.filter((i) => !assignedInstanceIds.has(i.id));

  const handleAssign = async () => {
    if (!user || !instanciaId || !rolId) return;
    await assignInstance({
      userId: user.id,
      instancia_id: Number(instanciaId),
      rol_id: Number(rolId),
    });
    setInstanciaId('');
    setRolId('');
  };

  const handleRemove = async (instanciaIdToRemove: number) => {
    if (!user) return;
    await removeInstance({ userId: user.id, instanciaId: instanciaIdToRemove });
  };

  const isLoading = loadingUser || loadingInstances || loadingRoles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[560px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0 flex flex-col max-h-[min(92vh,48rem)]">
        <div className="bg-primary/5 p-4 sm:p-6 pr-12 pb-4 border-b border-border/50 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate">
              <Server className="size-5 sm:size-6 text-primary shrink-0" />
              <span className="truncate">Instancias — {user?.username}</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl border border-border p-3.5 sm:p-4 bg-muted/20">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Nueva asignación
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Instancia</Label>
                    <Select value={instanciaId} onValueChange={setInstanciaId}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Seleccionar sede" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-w-[calc(100vw-2rem)] sm:max-w-xs">
                        {availableInstances.map((inst) => (
                          <SelectItem key={inst.id} value={String(inst.id)}>
                            {inst.nombre_mostrable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select value={rolId} onValueChange={setRolId}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-w-[calc(100vw-2rem)] sm:max-w-xs">
                        {roles.map((rol) => (
                          <SelectItem key={rol.id} value={String(rol.id)}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full h-11 rounded-xl font-bold cursor-pointer"
                  disabled={!instanciaId || !rolId || isAssigning}
                  onClick={handleAssign}
                >
                  {isAssigning && <Loader2 className="size-4 animate-spin mr-2" />}
                  Asignar acceso
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Accesos actuales ({assignments.length})
                </p>
                {assignments.length === 0 ? (
                  <p className="text-xs sm:text-sm text-muted-foreground italic py-4 text-center">
                    Este usuario no tiene instancias asignadas.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {assignments.map((a) => (
                      <li
                        key={a.instancia_id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 sm:px-4 sm:py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm break-words">
                            {a.instancias?.nombre_mostrable ?? `Instancia #${a.instancia_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground break-words">
                            Rol: {a.roles?.nombre ?? a.rol_id}
                            {a.instancias?.db_name ? ` · ${a.instancias.db_name}` : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:bg-rose-500/10 shrink-0 cursor-pointer"
                          disabled={isAssigning}
                          onClick={() => handleRemove(a.instancia_id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
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
