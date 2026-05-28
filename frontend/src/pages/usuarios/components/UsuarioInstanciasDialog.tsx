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
      <DialogContent className="sm:max-w-[560px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Server className="size-6 text-primary" />
              Instancias — {user?.username}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-xl border border-border p-4 bg-muted/20">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Nueva asignación
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Instancia</Label>
                    <Select value={instanciaId} onValueChange={setInstanciaId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Seleccionar sede" />
                      </SelectTrigger>
                      <SelectContent>
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
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
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
                  className="w-full rounded-xl"
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
                  <p className="text-sm text-muted-foreground italic py-4 text-center">
                    Este usuario no tiene instancias asignadas.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {assignments.map((a) => (
                      <li
                        key={a.instancia_id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            {a.instancias?.nombre_mostrable ?? `Instancia #${a.instancia_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rol: {a.roles?.nombre ?? a.rol_id}
                            {a.instancias?.db_name ? ` · ${a.instancias.db_name}` : ''}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:bg-rose-500/10 shrink-0"
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

        <DialogFooter className="p-4 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
