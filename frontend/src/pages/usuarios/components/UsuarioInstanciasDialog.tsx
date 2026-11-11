import { useState, useEffect } from 'react';
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
import { Loader2, Server, Trash2, Edit2, Plus, Check } from 'lucide-react';
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
  const [editingInstanceId, setEditingInstanceId] = useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: userDetail, isLoading: loadingUser } = useMasterUser(isOpen && user ? user.id : null);
  const { data: instances = [], isLoading: loadingInstances } = useInstancesOptions(isOpen);

  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles-options'],
    queryFn: () => roleService.getRoles({ limit: 200, status: 'true' }),
    enabled: isOpen,
    select: (res) => res.data || [],
  });

  const assignments = userDetail?.usuario_instancia ?? user?.usuario_instancia ?? [];

  // Al abrir el modal o cambiar de usuario, precargar automáticamente su asignación actual
  useEffect(() => {
    if (!isOpen) {
      setInstanciaId('');
      setRolId('');
      setEditingInstanceId(null);
      setHasInitialized(false);
      return;
    }

    if (!hasInitialized && assignments.length > 0) {
      const first = assignments[0];
      setInstanciaId(String(first.instancia_id));
      setRolId(String(first.rol_id));
      setEditingInstanceId(first.instancia_id);
      setHasInitialized(true);
    }
  }, [isOpen, assignments, hasInitialized]);

  const assignedInstanceIds = new Set(assignments.map((a) => a.instancia_id));

  // Las instancias disponibles incluyen aquellas sin asignar O la que se está editando actualmente
  const availableInstances = instances.filter(
    (i) => !assignedInstanceIds.has(i.id) || (editingInstanceId !== null && i.id === editingInstanceId) || i.id === Number(instanciaId)
  );

  const handleEditAssignment = (instId: number, currentRolId: number) => {
    setInstanciaId(String(instId));
    setRolId(String(currentRolId));
    setEditingInstanceId(instId);
  };

  const handleResetToNew = () => {
    setInstanciaId('');
    setRolId('');
    setEditingInstanceId(null);
  };

  const handleAssign = async () => {
    if (!user || !instanciaId || !rolId) return;
    await assignInstance({
      userId: user.id,
      instancia_id: Number(instanciaId),
      rol_id: Number(rolId),
    });
    setEditingInstanceId(Number(instanciaId));
  };

  const handleRemove = async (instanciaIdToRemove: number) => {
    if (!user) return;
    await removeInstance({ userId: user.id, instanciaId: instanciaIdToRemove });
    if (editingInstanceId === instanciaIdToRemove) {
      handleResetToNew();
    }
  };

  const isLoading = loadingUser || loadingInstances || loadingRoles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-140 glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0 flex flex-col max-h-[min(92vh,48rem)]">
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
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    {editingInstanceId ? 'Editar rol en sede asignada' : 'Nueva asignación de sede'}
                  </p>
                  {editingInstanceId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetToNew}
                      className="h-7 text-xs text-primary hover:bg-primary/10 gap-1 rounded-lg"
                    >
                      <Plus className="size-3.5" />
                      <span>Nueva asignación</span>
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Instancia / Sede</Label>
                    <Select
                      value={instanciaId}
                      onValueChange={(val) => {
                        setInstanciaId(val);
                        // Si cambia de sede en modo edición, verifica si esa sede ya tenía un rol
                        const existing = assignments.find((a) => a.instancia_id === Number(val));
                        if (existing) {
                          setRolId(String(existing.rol_id));
                          setEditingInstanceId(existing.instancia_id);
                        } else {
                          setEditingInstanceId(null);
                        }
                      }}
                      disabled={editingInstanceId !== null}
                    >
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
                    <Label>Rol en esta sede</Label>
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
                  className="w-full h-11 rounded-xl font-bold cursor-pointer gap-2"
                  disabled={!instanciaId || !rolId || isAssigning}
                  onClick={handleAssign}
                >
                  {isAssigning ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : editingInstanceId ? (
                    <Check className="size-4" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  <span>{editingInstanceId ? 'Actualizar rol' : 'Asignar acceso'}</span>
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
                    {assignments.map((a) => {
                      const isCurrentlyEditing = editingInstanceId === a.instancia_id;
                      return (
                        <li
                          key={a.instancia_id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 sm:px-4 sm:py-3 transition-all ${isCurrentlyEditing
                            ? 'border-primary bg-primary/10 shadow-xs'
                            : 'border-border hover:bg-muted/30'
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm wrap-break-words flex items-center gap-2">
                              <span>{a.instancias?.nombre_mostrable ?? `Instancia #${a.instancia_id}`}</span>
                              {isCurrentlyEditing && (
                                <span className="text-[10px] bg-primary/20 text-primary font-bold px-1.5 py-0.5 rounded-md">
                                  Editando
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground wrap-break-words mt-0.5">
                              Rol: <span className="font-medium text-foreground">{a.roles?.nombre ?? a.rol_id}</span>
                              {a.instancias?.db_name ? ` · ${a.instancias.db_name}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Editar rol de esta sede"
                              className={`size-8 rounded-lg cursor-pointer ${isCurrentlyEditing
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'text-primary hover:bg-primary/10'
                                }`}
                              disabled={isAssigning}
                              onClick={() => handleEditAssignment(a.instancia_id, a.rol_id)}
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title="Remover acceso"
                              className="size-8 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              disabled={isAssigning}
                              onClick={() => handleRemove(a.instancia_id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
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
