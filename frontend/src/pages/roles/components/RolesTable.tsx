import type { Role } from '@/types/role';
import { ShieldCheck, Edit, Trash2, Power } from 'lucide-react';
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

  return (
    <>

      <Table>
        <TableHeader className="bg-muted/30 border-b">
          <TableRow>
            <TableHead className="w-12 px-6">
              <Checkbox
                checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                onCheckedChange={handleSelectAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Descripción</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estado</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/50">
          {roles.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <ShieldCheck className="size-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground font-bold not-italic">No se encontraron roles</p>
                    <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role: Role) => (
              <TableRow
                key={role.id}
                className={`group hover:bg-primary/5 transition-all duration-300 ${selectedIds.includes(role.id) ? 'bg-primary/5' : ''}`}
              >
                <TableCell className="px-6">
                  <Checkbox
                    checked={selectedIds.includes(role.id)}
                    onCheckedChange={(checked) => handleSelectRow(role.id, !!checked)}
                    aria-label={`Seleccionar ${role.nombre}`}
                  />
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

                    <Button
                      variant="ghost"
                      size="icon"
                      title={role.status ? 'Desactivar Rol' : 'Activar Rol'}
                      onClick={() => onToggleStatus(role.id, !!role.status)}
                      className={`size-9 rounded-lg transition-colors cursor-pointer ${role.status
                        ? "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                        : "text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                        }`}
                    >
                      <Power className={`size-4 ${role.status ? "fill-emerald-500/20" : ""}`} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      title='Editar'
                      onClick={() => onEdit(role)}
                      className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      title="eliminar"
                      onClick={() => onDelete(role.id)}
                      className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
