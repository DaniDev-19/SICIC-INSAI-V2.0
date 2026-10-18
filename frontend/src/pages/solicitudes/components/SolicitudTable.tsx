import type { Solicitud } from '@/types/solicitudes';
import { FileText, Calendar, User, MapPin } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
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

const statusConfig: Record<string, { label: string; class: string }> = {
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

const priorityConfig: Record<string, { label: string; class: string }> = {
  BAJA: { label: 'Baja', class: 'bg-emerald-500/10 text-emerald-600' },
  MEDIA: { label: 'Media', class: 'bg-blue-500/10 text-blue-600' },
  ALTA: { label: 'Alta', class: 'bg-amber-500/10 text-amber-600' },
  URGENTE: { label: 'Urgente', class: 'bg-rose-500/10 text-rose-600' },
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 sm:size-20 rounded-2xl bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <FileText className="size-8 sm:size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-bold text-foreground text-base sm:text-lg">
          No se encontraron solicitudes
        </p>
        <p className="text-sm text-muted-foreground">
          Crea una nueva solicitud o ajusta los filtros de búsqueda.
        </p>
      </div>
    </div>
  );
}

export function SolicitudTable({ solicitudes, onEdit, onDelete, onView }: SolicitudTableProps) {
  if (solicitudes.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* ── Mobile / Tablet (< lg): tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {solicitudes.map((solicitud: Solicitud) => {
          const status = statusConfig[solicitud.estatus] || { label: solicitud.estatus, class: 'bg-muted text-muted-foreground border-border' };
          const priority = priorityConfig[solicitud.prioridad] || { label: solicitud.prioridad, class: 'bg-muted text-muted-foreground' };

          return (
            <article
              key={solicitud.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3"
            >
              {/* Fila 1: icono + código + badge estado */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">{solicitud.codigo}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold mt-0.5">
                      <Calendar className="size-3 shrink-0" />
                      {format(new Date(solicitud.fecha_solicitada), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </div>
                </div>

                {/* Badges estado + prioridad */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border',
                    status.class
                  )}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {status.label}
                  </span>
                  <span className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest',
                    priority.class
                  )}>
                    {priority.label}
                  </span>
                </div>
              </div>

              {/* Fila 2: solicitante y predio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0 text-foreground font-medium">
                  <User className="size-4 text-primary shrink-0" />
                  <span className="truncate">{solicitud.clientes?.nombre || 'Desconocido'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{solicitud.propiedades?.nombre || 'Sin predio'}</span>
                </div>
              </div>

              {/* Fila 3: tipo + descripción */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                  {solicitud.t_solicitud?.nombre || 'General'}
                </div>
                {solicitud.descripcion && (
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                    {solicitud.descripcion}
                  </p>
                )}
              </div>

              {/* Fila 4: acciones */}
              <div className="flex items-center justify-end pt-1 border-t border-border/40">
                <CrudTableActions
                  screen="solicitudes"
                  onView={onView ? () => onView(solicitud) : undefined}
                  onEdit={() => onEdit(solicitud)}
                  onDelete={() => onDelete(solicitud.id)}
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Desktop (lg+): tabla ── */}
      <div className="hidden lg:block rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Código y Fecha
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Solicitante / Predio
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Tipo / Descripción
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Estado / Prioridad
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {solicitudes.map((solicitud: Solicitud) => {
              const status = statusConfig[solicitud.estatus] || { label: solicitud.estatus, class: 'bg-muted text-muted-foreground border-border' };
              const priority = priorityConfig[solicitud.prioridad] || { label: solicitud.prioridad, class: 'bg-muted text-muted-foreground' };

              return (
                <TableRow key={solicitud.id} className="group hover:bg-primary/5 transition-all duration-300">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                          {solicitud.codigo}
                        </span>
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
                        <User className="size-3.5 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground truncate max-w-45">
                          {solicitud.clientes?.nombre || 'Desconocido'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground font-medium truncate max-w-45">
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
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1 max-w-50">
                        {solicitud.descripcion}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className={cn(
                        'inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border w-fit whitespace-nowrap',
                        status.class
                      )}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {status.label}
                      </div>
                      <div className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit whitespace-nowrap',
                        priority.class
                      )}>
                        {priority.label}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <CrudTableActions
                      screen="solicitudes"
                      onView={onView ? () => onView(solicitud) : undefined}
                      onEdit={() => onEdit(solicitud)}
                      onDelete={() => onDelete(solicitud.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
