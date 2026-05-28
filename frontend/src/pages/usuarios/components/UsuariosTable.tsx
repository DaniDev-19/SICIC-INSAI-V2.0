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

  return (
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
        {users.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <User className="size-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-bold not-italic">No se encontraron usuarios</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
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
                      className="rounded-xl hover:bg-primary/10 hover:text-primary"
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
                      className="rounded-xl hover:bg-amber-500/10 hover:text-amber-600"
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
                      className="rounded-xl hover:bg-primary/10 hover:text-primary"
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
                      className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
