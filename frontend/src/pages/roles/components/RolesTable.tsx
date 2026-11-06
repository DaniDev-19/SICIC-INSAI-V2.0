import type { Role } from '@/types/role';
import { ShieldCheck, Power } from 'lucide-react';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


interface RolesTableProps {
  roles: Role[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, currentStatus: boolean) => void;
}

export function RolesTable({
  roles,
  selectedIds,
  onSelectionChange,
  onEdit,
  onDelete,
  onToggleStatus
}: RolesTableProps) {
  const { canUpdate, canDelete } = useModulePermissions('roles');

  const isAllSelected = roles.length > 0 && selectedIds.length === roles.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < roles.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(roles.map(r => r.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (roleId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, roleId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== roleId));
    }
  };

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <ShieldCheck className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron roles</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          Intenta ajustar tus criterios de búsqueda o filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Vista Móvil / Tarjetas (lg:hidden) ── */}
      <div className="divide-y divide-border/50 lg:hidden">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-4 transition-all duration-200 space-y-3 ${
              selectedIds.includes(role.id) ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-primary/5 active:bg-muted/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {canDelete && (
                  <Checkbox
                    checked={selectedIds.includes(role.id)}
                    onCheckedChange={(checked) => handleSelectRow(role.id, !!checked)}
                    aria-label={`Seleccionar ${role.nombre}`}
                    className="shrink-0"
                  />
                )}
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block break-words whitespace-normal">
                    {role.nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold block">
                    ID: #{role.id}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title={role.status ? 'Desactivar Rol' : 'Activar Rol'}
                    onClick={() => onToggleStatus(role.id, !!role.status)}
                    className={`size-8 rounded-lg transition-colors cursor-pointer ${
                      role.status
                        ? 'text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600'
                        : 'text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600'
                    }`}
                  >
                    <Power className={`size-4 ${role.status ? 'fill-emerald-500/20' : ''}`} />
                  </Button>
                )}
                <CrudTableActions
                  screen="roles"
                  onEdit={() => onEdit(role)}
                  onDelete={() => onDelete(role.id)}
                />
              </div>
            </div>

            {role.descripcion && (
              <p className="text-xs text-muted-foreground font-medium break-words">
                {role.descripcion}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {role.status ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVO
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
                  <div className="size-1.5 rounded-full bg-rose-500" /> INACTIVO
                </div>
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
              <TableHead className="w-12 px-6">
                {canDelete && (
                  <Checkbox
                    checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                )}
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Descripción</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {roles.map((role: Role) => (
              <TableRow
                key={role.id}
                className={`group hover:bg-primary/5 transition-all duration-300 ${selectedIds.includes(role.id) ? 'bg-primary/5' : ''}`}
              >
                <TableCell className="px-6">
                  {canDelete && (
                    <Checkbox
                      checked={selectedIds.includes(role.id)}
                      onCheckedChange={(checked) => handleSelectRow(role.id, !!checked)}
                      aria-label={`Seleccionar ${role.nombre}`}
                    />
                  )}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{role.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{role.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-muted-foreground font-medium max-w-sm">
                  <p className="line-clamp-1">{role.descripcion || 'Sin descripción detallada'}</p>
                </TableCell>
                <TableCell className="px-6 py-5">
                  {role.status ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVO
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      <div className="size-2 rounded-full bg-rose-500" /> INACTIVO
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 transition-all duration-300">
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={role.status ? 'Desactivar Rol' : 'Activar Rol'}
                        onClick={() => onToggleStatus(role.id, !!role.status)}
                        className={`size-9 rounded-lg transition-colors cursor-pointer ${
                          role.status
                            ? "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                            : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                        }`}
                      >
                        <Power className={`size-4 ${role.status ? "fill-emerald-500/20" : ""}`} />
                      </Button>
                    )}
                    <CrudTableActions
                      screen="roles"
                      onEdit={() => onEdit(role)}
                      onDelete={() => onDelete(role.id)}
                    />
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
