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

  if (instances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Server className="size-8 text-muted-foreground/40" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron instancias</p>
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
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="p-3.5 sm:p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 space-y-3 min-w-0 max-w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Server className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block break-words whitespace-normal leading-tight">
                    {instance.nombre_mostrable}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block mt-0.5">
                    ID #{instance.id}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 self-end sm:self-auto">
                {canSee && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Ver usuarios"
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
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
                    className="size-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
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
                    className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer"
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
                    className="size-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                    onClick={() => onDelete(instance.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {instance.status ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVA
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
                  <span className="size-1.5 rounded-full bg-rose-500" />
                  INACTIVA
                </div>
              )}

              <code className="text-[11px] font-mono bg-muted/60 px-2 py-0.5 rounded-md border border-border/50 text-foreground break-all">
                {instance.db_name}
              </code>

              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto shrink-0">
                <Users className="size-3.5" />
                <span>{instance._count?.usuario_instancia ?? 0} usuarios</span>
              </div>
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
            {instances.map((instance) => (
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
                        className="rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
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
                        className="rounded-xl hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
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
                        className="rounded-xl hover:bg-primary/10 hover:text-primary cursor-pointer"
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
                        className="rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        onClick={() => onDelete(instance.id)}
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
