import type { Solicitud } from '@/types/solicitudes';
import { FileText, Eye, Calendar, User, MapPin } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SolicitudTableProps {
  solicitudes: Solicitud[];
  onEdit: (solicitud: Solicitud) => void;
  onDelete: (id: number) => void;
  onView?: (solicitud: Solicitud) => void;
}

const statusConfig: Record<string, { label: string, class: string }> = {
  CREADA: { label: 'Creada', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  DIAGNOSTICADA: { label: 'Diagnosticada', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  PLANIFICADA: { label: 'Planificada', class: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  INSPECCIONANDO: { label: 'Inspeccionando', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  FINALIZADA: { label: 'Finalizada', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  NO_APROBADA: { label: 'No Aprobada', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  SEGUIMIENTO: { label: 'Seguimiento', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  CUARENTENA: { label: 'Cuarentena', class: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  NO_ATENDIDA: { label: 'No Atendida', class: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
};

const priorityConfig: Record<string, { label: string, class: string }> = {
  BAJA: { label: 'Baja', class: 'bg-emerald-500/10 text-emerald-600' },
  MEDIA: { label: 'Media', class: 'bg-blue-500/10 text-blue-600' },
  ALTA: { label: 'Alta', class: 'bg-amber-500/10 text-amber-600' },
  URGENTE: { label: 'Urgente', class: 'bg-rose-500/10 text-rose-600' },
};

export function SolicitudTable({ solicitudes, onEdit, onDelete, onView }: SolicitudTableProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/30 border-b">
        <TableRow>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Código y Fecha</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Solicitante / Predio</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo / Descripción</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estado / Prioridad</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/50">
        {solicitudes.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-bold not-italic">No se encontraron solicitudes</p>
                  <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          solicitudes.map((solicitud: Solicitud) => (
            <TableRow key={solicitud.id} className="group hover:bg-primary/5 transition-all duration-300">
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{solicitud.codigo}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mt-0.5">
                      <Calendar className="size-3" />
                      {format(new Date(solicitud.fecha_solicitada), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 text-primary" />
                    <span className="text-sm font-bold text-foreground truncate max-w-[180px]">
                      {solicitud.clientes?.nombre || 'Desconocido'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">
                      {solicitud.propiedades?.nombre || 'Sin predio'}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                    {solicitud.t_solicitud?.nombre || 'General'}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1 max-w-[200px]">
                    {solicitud.descripcion}
                  </p>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5">
                <div className="flex flex-col gap-2">
                  <div className={cn(
                    "inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border w-fit",
                    statusConfig[solicitud.estatus]?.class || 'bg-muted text-muted-foreground'
                  )}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {statusConfig[solicitud.estatus]?.label || solicitud.estatus}
                  </div>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit",
                    priorityConfig[solicitud.prioridad]?.class || 'bg-muted text-muted-foreground'
                  )}>
                    {priorityConfig[solicitud.prioridad]?.label || solicitud.prioridad}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Ver Detalles"
                      onClick={() => onView(solicitud)}
                      className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
                    >
                      <Eye className="size-4" />
                    </Button>
                  )}
                  <CrudTableActions
                    screen="solicitudes"
                    onEdit={() => onEdit(solicitud)}
                    onDelete={() => onDelete(solicitud.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
