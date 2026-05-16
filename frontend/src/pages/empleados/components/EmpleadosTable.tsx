import type { Empleado } from '@/types/empleados';
import { User, Mail, Phone, Edit, Trash2, BadgeCheck, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onDelete: (id: number) => void;
  onSelect?: (empleado: Empleado) => void;
  selectedId?: number | null;
}

export function EmpleadosTable({
  empleados,
  onEdit,
  onDelete,
  onSelect,
  selectedId,
}: EmpleadosTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/30 border-b">
        <TableRow>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Empleado</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Contacto</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Departamento / Cargo</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estatus</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/50">
        {empleados.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <User className="size-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-bold not-italic">No se encontraron empleados</p>
                  <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          empleados.map((empleado: Empleado) => (
            <TableRow
              key={empleado.id}
              onClick={() => onSelect?.(empleado)}
              className={`group transition-all duration-300 cursor-pointer ${selectedId === empleado.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-primary/5'}`}
            >
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {empleado.empleado_foto && empleado.empleado_foto.length > 0 ? (
                      <img 
                        src={empleado.empleado_foto[0].foto_url} 
                        alt={empleado.nombre}
                        className="size-12 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
                      />
                    ) : (
                      <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <User className="size-6" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background ${empleado.status_laboral === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                      {empleado.nombre} {empleado.apellido}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      C.I: {empleado.cedula}
                    </span>
                  </div>
                </div>
              </TableCell>
              
              <TableCell className="px-6 py-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Mail className="size-3 text-primary/60" />
                    {empleado.email || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Phone className="size-3 text-primary/60" />
                    {empleado.telefono || 'N/A'}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                    <Building2 className="size-3.5 text-blue-500/70" />
                    {empleado.departamentos?.nombre || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Briefcase className="size-3.5 text-amber-500/70" />
                    {empleado.cargos?.nombre || 'N/A'}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  empleado.status_laboral === 'ACTIVO' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  <BadgeCheck className={`size-3 ${empleado.status_laboral === 'ACTIVO' ? 'text-emerald-500' : 'text-rose-500'}`} />
                  {empleado.status_laboral}
                </div>
              </TableCell>

              <TableCell className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Editar"
                    onClick={(e) => { e.stopPropagation(); onEdit(empleado); }}
                    className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Eliminar"
                    onClick={(e) => { e.stopPropagation(); onDelete(empleado.id); }}
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
  );
}
