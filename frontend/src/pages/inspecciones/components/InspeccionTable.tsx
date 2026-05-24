import type { Inspeccion } from '@/types/inspecciones';
import { formatHoraInspeccion } from '@/utils/inspeccion-time';
import { Eye, Edit, Trash2, Calendar, User, MapPin, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30 border-b">
          <TableRow>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Inspección / Control</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Productor y Predio</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Fecha / Hora</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estatus</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/50">
          {inspecciones.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Eye className="size-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold italic text-foreground">No se encontraron inspecciones registradas</p>
                  <p className="text-xs text-muted-foreground">Registra la primera inspección usando el botón de arriba</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            inspecciones.map((inspeccion) => {
              const status = STATUS_CONFIG[inspeccion.status] || { label: inspeccion.status, color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' };
              const plan = inspeccion.planificaciones;
              const solic = plan?.solicitudes;

              return (
                <TableRow
                  key={inspeccion.id}
                  className="group transition-all duration-300 hover:bg-primary/5"
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <Eye className="size-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                          {inspeccion.n_control}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mt-0.5">
                          Form: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <User className="size-3.5 text-primary shrink-0" />
                        <span>{solic?.clientes?.nombre || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{solic?.propiedades?.nombre || '—'}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>{new Date(inspeccion.fecha_inspeccion).toLocaleDateString()}</span>
                      </div>
                      {inspeccion.hora_inspeccion && (
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block pl-5">
                          {formatHoraInspeccion(inspeccion.hora_inspeccion)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border ${status.color}`}>
                      {status.label}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver Detalles"
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
