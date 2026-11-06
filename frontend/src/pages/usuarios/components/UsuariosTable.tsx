import type { MasterUser } from '@/types/user';
import { User, Edit, Trash2, Server, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';

interface UsuariosTableProps {
  users: MasterUser[];
  onEdit: (user: MasterUser) => void;
  onDelete: (id: number) => void;
  onManageInstances: (user: MasterUser) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

export function UsuariosTable({
  users,
  onEdit,
  onDelete,
  onManageInstances,
  onToggleStatus,
}: UsuariosTableProps) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('usuarios', 'edit');
  const canDelete = hasPermission('usuarios', 'delete');
  const canDisable = hasPermission('usuarios', 'disable');

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <User className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron usuarios</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          Intenta ajustar tus criterios de búsqueda o filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Vista Móvil / Tarjetas (lg:hidden) ── */}
      <div className="divide-y divide-border/50 lg:hidden w-full min-w-0 max-w-full">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-3.5 sm:p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 space-y-3 min-w-0 max-w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block wrap-break-words whitespace-normal leading-tight">
                    {user.username}
                  </span>
                  <span className="text-xs text-muted-foreground wrap-break-words block mt-0.5">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 self-end sm:self-auto">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Gestionar instancias"
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
                    onClick={() => onManageInstances(user)}
                  >
                    <Server className="size-4" />
                  </Button>
                )}
                {canDisable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title={user.status ? 'Desactivar' : 'Activar'}
                    className="size-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
                    onClick={() => onToggleStatus(user.id, user.status)}
                  >
                    <Power className="size-4" />
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Editar"
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="size-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Eliminar"
                    className="size-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {user.status ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVO
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  INACTIVO
                </div>
              )}

              {(user.usuario_instancia?.length ?? 0) === 0 ? (
                <span className="text-[11px] text-muted-foreground italic">Sin sedes asignadas</span>
              ) : (
                user.usuario_instancia?.map((ui) => (
                  <span
                    key={`${ui.instancia_id}-${ui.rol_id}`}
                    className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border max-w-full wrap-break-words"
                  >
                    {ui.instancias?.nombre_mostrable} · {ui.roles?.nombre}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista Escritorio (hidden lg:block) ── */}
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Usuario
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Instancias
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {users.map((user) => (
              <TableRow key={user.id} className="group hover:bg-primary/5 transition-all">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <User className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">{user.username}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {(user.usuario_instancia?.length ?? 0) === 0 ? (
                      <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                    ) : (
                      user.usuario_instancia?.map((ui) => (
                        <span
                          key={`${ui.instancia_id}-${ui.rol_id}`}
                          className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground border border-border"
                        >
                          {ui.instancias?.nombre_mostrable} · {ui.roles?.nombre}
                        </span>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  {user.status ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ACTIVO
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      INACTIVO
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Gestionar instancias"
                        className="rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
                        onClick={() => onManageInstances(user)}
                      >
                        <Server className="size-4" />
                      </Button>
                    )}
                    {canDisable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={user.status ? 'Desactivar' : 'Activar'}
                        className="rounded-xl hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
                        onClick={() => onToggleStatus(user.id, user.status)}
                      >
                        <Power className="size-4" />
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        className="rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
                        onClick={() => onEdit(user)}
                      >
                        <Edit className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        onClick={() => onDelete(user.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

