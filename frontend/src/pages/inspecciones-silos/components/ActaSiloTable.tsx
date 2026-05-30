import type { ActaSilo } from '@/types/acta_silos';
import { Eye, Edit, Trash2, Calendar, User, MapPin, FileText, Loader2, Warehouse } from 'lucide-react';
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

interface ActaSiloTableProps {
  actaSilos: ActaSilo[];
  onEdit: (actaSilo: ActaSilo) => void;
  onDelete: (id: number) => void;
  onView: (actaSilo: ActaSilo) => void;
  onPdf: (id: number) => void;
  pdfLoadingId?: number | null;
  canEdit?: boolean;
  canDelete?: boolean;
}

function ActaSiloActions({
  actaSilo,
  onView,
  onPdf,
  onEdit,
  onDelete,
  pdfLoadingId,
  canEdit,
  canDelete,
  className,
}: {
  actaSilo: ActaSilo;
  onView: (a: ActaSilo) => void;
  onPdf: (id: number) => void;
  onEdit: (a: ActaSilo) => void;
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
        onClick={() => onView(actaSilo)}
        className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Acta PDF"
        disabled={pdfLoadingId !== null}
        onClick={() => onPdf(actaSilo.id)}
        className="size-9 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer disabled:opacity-50"
      >
        {pdfLoadingId === actaSilo.id ? (
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
          onClick={() => onEdit(actaSilo)}
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
          onClick={() => onDelete(actaSilo.id)}
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
        <Warehouse className="size-8 sm:size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-bold text-foreground text-base sm:text-lg">
          No se encontraron actas de silos registradas
        </p>
        <p className="text-sm text-muted-foreground">
          Crea tu primera acta de silo desde una planificación finalizada o filtra los resultados de búsqueda.
        </p>
      </div>
    </div>
  );
}

export function ActaSiloTable({
  actaSilos,
  onEdit,
  onDelete,
  onView,
  onPdf,
  pdfLoadingId = null,
  canEdit = false,
  canDelete = false,
}: ActaSiloTableProps) {
  if (actaSilos.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {actaSilos.map((acta) => {
          const solic = acta.planificaciones?.solicitudes;
          const controlLabel = acta.planificaciones?.codigo ? `ACTA-SILO-${acta.planificaciones.codigo}` : `ACTA-SILO-${acta.id.toString().padStart(4, '0')}`;

          return (
            <article
              key={acta.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Warehouse className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">{controlLabel}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      Seman. Epid: {acta.semana_epid || 'N/A'}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  FINALIZADA
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0 text-foreground font-medium">
                  <User className="size-4 text-primary shrink-0" />
                  <span className="truncate">{solic?.clientes?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{acta.lugar_ubicacion || solic?.propiedades?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span>
                    {acta.fecha_notificacion 
                      ? new Date(acta.fecha_notificacion).toLocaleDateString('es-VE') 
                      : '—'}
                  </span>
                </div>
              </div>

              <ActaSiloActions
                actaSilo={acta}
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
                Acta / Control
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Productor y Ubicación
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Fecha Notificación
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Epidemiología
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {actaSilos.map((acta) => {
              const solic = acta.planificaciones?.solicitudes;
              const controlLabel = acta.planificaciones?.codigo ? `ACTA-SILO-${acta.planificaciones.codigo}` : `ACTA-SILO-${acta.id.toString().padStart(4, '0')}`;

              return (
                <TableRow
                  key={acta.id}
                  className="group transition-colors hover:bg-primary/5"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Warehouse className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">
                          {controlLabel}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mt-0.5">
                          Silos: {acta.n_silos || '0'} | Galpones: {acta.n_galpones || '0'}
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
                        <span className="truncate">{acta.lugar_ubicacion || solic?.propiedades?.nombre || '—'}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                      <Calendar className="size-3.5 text-primary shrink-0" />
                      <span>
                        {acta.fecha_notificacion 
                          ? new Date(acta.fecha_notificacion).toLocaleDateString('es-VE') 
                          : '—'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="space-y-0.5">
                      <span className="text-xs text-foreground font-semibold block">
                        Semana: {acta.semana_epid || 'N/A'}
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold block">
                        Afectación: {acta.cant_afectado_porcentaje && !isNaN(Number(acta.cant_afectado_porcentaje)) ? `${Number(acta.cant_afectado_porcentaje).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <ActaSiloActions
                      actaSilo={acta}
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
