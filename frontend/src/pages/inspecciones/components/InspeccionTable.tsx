import type { Inspeccion } from '@/types/inspecciones';
import { formatHoraInspeccion } from '@/utils/inspeccion-time';
import { Eye, Edit, Trash2, Calendar, User, MapPin, FileText, Loader2, ClipboardList } from 'lucide-react';
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

interface InspeccionTableProps {
  inspecciones: Inspeccion[];
  onEdit: (inspeccion: Inspeccion) => void;
  onDelete: (id: number) => void;
  onView: (inspeccion: Inspeccion) => void;
  onPdf: (id: number) => void;
  pdfLoadingId?: number | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'PENDIENTE', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' },
  INSPECCIONANDO: { label: 'INSPECCIONANDO', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  FINALIZADA: { label: 'FINALIZADA', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  NO_APROBADA: { label: 'NO APROBADA', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  SEGUIMIENTO: { label: 'SEGUIMIENTO', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  CUARENTENA: { label: 'CUARENTENA', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  NO_ATENDIDA: { label: 'NO ATENDIDA', color: 'bg-stone-500/10 text-stone-600 border-stone-500/20' },
};

function getStatus(inspeccion: Inspeccion) {
  return STATUS_CONFIG[inspeccion.status] || {
    label: inspeccion.status,
    color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
  };
}

function InspeccionActions({
  inspeccion,
  onView,
  onPdf,
  onEdit,
  onDelete,
  pdfLoadingId,
  canEdit,
  canDelete,
  className,
}: {
  inspeccion: Inspeccion;
  onView: (i: Inspeccion) => void;
  onPdf: (id: number) => void;
  onEdit: (i: Inspeccion) => void;
  onDelete: (id: number) => void;
  pdfLoadingId: number | null;
  canEdit: boolean;
  canDelete: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
      <Button
        variant="ghost"
        size="icon"
        title="Ver detalles"
        onClick={() => onView(inspeccion)}
        className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Acta PDF"
        disabled={pdfLoadingId !== null}
        onClick={() => onPdf(inspeccion.id)}
        className="size-9 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer disabled:opacity-50"
      >
        {pdfLoadingId === inspeccion.id ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
      </Button>
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          title="Editar"
          onClick={() => onEdit(inspeccion)}
          className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
        >
          <Edit className="size-4" />
        </Button>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          title="Eliminar"
          onClick={() => onDelete(inspeccion.id)}
          className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 sm:size-20 rounded-2xl bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <ClipboardList className="size-8 sm:size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-bold text-foreground text-base sm:text-lg">
          No se encontraron inspecciones registradas
        </p>
        <p className="text-sm text-muted-foreground">
          Registra la primera inspección con el botón «Nueva Inspección» o ajusta los filtros de búsqueda.
        </p>
      </div>
    </div>
  );
}

export function InspeccionTable({
  inspecciones,
  onEdit,
  onDelete,
  onView,
  onPdf,
  pdfLoadingId = null,
  canEdit = true,
  canDelete = true,
}: InspeccionTableProps) {
  if (inspecciones.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {inspecciones.map((inspeccion) => {
          const status = getStatus(inspeccion);
          const solic = inspeccion.planificaciones?.solicitudes;

          return (
            <article
              key={inspeccion.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Eye className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">{inspeccion.n_control}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      Form: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border',
                    status.color
                  )}
                >
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0 text-foreground font-medium">
                  <User className="size-4 text-primary shrink-0" />
                  <span className="truncate">{solic?.clientes?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{solic?.propiedades?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span>{new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-VE')}</span>
                  {inspeccion.hora_inspeccion && (
                    <span className="text-muted-foreground text-xs">
                      · {formatHoraInspeccion(inspeccion.hora_inspeccion)}
                    </span>
                  )}
                </div>
              </div>

              <InspeccionActions
                inspeccion={inspeccion}
                onView={onView}
                onPdf={onPdf}
                onEdit={onEdit}
                onDelete={onDelete}
                pdfLoadingId={pdfLoadingId}
                canEdit={canEdit}
                canDelete={canDelete}
                className="justify-end pt-1 border-t border-border/40"
              />
            </article>
          );
        })}
      </div>

      <div className="hidden lg:block rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Inspección / Control
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Productor y Predio
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Fecha / Hora
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Estatus
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {inspecciones.map((inspeccion) => {
              const status = getStatus(inspeccion);
              const solic = inspeccion.planificaciones?.solicitudes;

              return (
                <TableRow
                  key={inspeccion.id}
                  className="group transition-colors hover:bg-primary/5"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Eye className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">
                          {inspeccion.n_control}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mt-0.5">
                          Form: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 max-w-[14rem] xl:max-w-xs">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold min-w-0">
                        <User className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{solic?.clientes?.nombre || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium min-w-0">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{solic?.propiedades?.nombre || '—'}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>{new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-VE')}</span>
                      </div>
                      {inspeccion.hora_inspeccion && (
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block pl-5">
                          {formatHoraInspeccion(inspeccion.hora_inspeccion)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border',
                        status.color
                      )}
                    >
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <InspeccionActions
                      inspeccion={inspeccion}
                      onView={onView}
                      onPdf={onPdf}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      pdfLoadingId={pdfLoadingId}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      className="justify-end"
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
