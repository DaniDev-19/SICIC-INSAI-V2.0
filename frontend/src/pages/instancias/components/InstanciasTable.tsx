import type { MasterInstance } from '@/types/instance';
import { Server, Edit, Trash2, Power, Users, Eye } from 'lucide-react';
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

interface InstanciasTableProps {
  instances: MasterInstance[];
  onEdit: (instance: MasterInstance) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
  onViewUsers: (instance: MasterInstance) => void;
}

export function InstanciasTable({
  instances,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewUsers,
}: InstanciasTableProps) {
  const { hasPermission } = usePermissions();
  const canSee = hasPermission('instancias', 'see');
  const canEdit = hasPermission('instancias', 'edit');
  const canDelete = hasPermission('instancias', 'delete');
  const canDisable = hasPermission('instancias', 'disable');

  return (
    <Table>
      <TableHeader className="bg-muted/30 border-b">
        <TableRow>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Instancia
          </TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Base de datos
          </TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Usuarios
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
        {instances.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <Server className="size-12 text-muted-foreground/40" />
                <p className="text-foreground font-bold not-italic">No se encontraron instancias</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          instances.map((instance) => (
            <TableRow key={instance.id} className="group hover:bg-primary/5 transition-all">
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Server className="size-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">{instance.nombre_mostrable}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      ID #{instance.id}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-5">
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md">{instance.db_name}</code>
              </TableCell>
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  {instance._count?.usuario_instancia ?? 0}
                </div>
              </TableCell>
              <TableCell className="px-6 py-5">
                {instance.status ? (
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    ACTIVA
                  </div>
                ) : (
                  <div className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    INACTIVA
                  </div>
                )}
              </TableCell>
              <TableCell className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-1">
                  {canSee && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver usuarios"
                      className="rounded-xl hover:bg-primary/10 hover:text-primary"
                      onClick={() => onViewUsers(instance)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  )}
                  {canDisable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title={instance.status ? 'Desactivar' : 'Activar'}
                      className="rounded-xl hover:bg-amber-500/10 hover:text-amber-600"
                      onClick={() => onToggleStatus(instance.id, instance.status)}
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
                      onClick={() => onEdit(instance)}
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
                      onClick={() => onDelete(instance.id)}
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
