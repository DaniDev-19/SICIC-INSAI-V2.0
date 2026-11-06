import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { resolveMediaUrl } from '@/lib/media-url';
import {
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Sparkles,
  Clock,
} from 'lucide-react';
import type { Seguimiento } from '@/types/seguimientos';
import type { Inspeccion } from '@/types/inspecciones';
import { seguimientosService } from '@/services/seguimientos.service';

interface SeguimientoTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspeccion: Inspeccion | null;
  seguimientos: Seguimiento[];
  onAddNewSeguimiento?: () => void;
}

export function SeguimientoTimelineModal({
  isOpen,
  onClose,
  inspeccion,
  seguimientos,
  onAddNewSeguimiento,
}: SeguimientoTimelineModalProps) {
  if (!inspeccion) return null;

  const propName = inspeccion.planificaciones?.solicitudes?.propiedades?.nombre || 'Propiedad no especificada';
  const prodName = inspeccion.planificaciones?.solicitudes?.clientes?.nombre || 'Productor no especificado';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl lg:max-w-4xl max-h-[min(92vh,52rem)] overflow-hidden flex flex-col border-none shadow-2xl glass-effect p-0 rounded-2xl sm:rounded-3xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/40 border-b border-border/50 shrink-0 pr-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 sm:size-11 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                <Activity className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base sm:text-xl font-black uppercase tracking-wide truncate">
                  Línea de Tiempo de Seguimientos
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                  {inspeccion.n_control} — {propName}
                </DialogDescription>
              </div>
            </div>

            {onAddNewSeguimiento && (
              <Button
                onClick={() => {
                  onClose();
                  onAddNewSeguimiento();
                }}
                size="sm"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl gap-1.5 cursor-pointer shrink-0 h-9 text-xs justify-center"
              >
                <Activity className="size-4" />
                + Nuevo Seguimiento
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-w-0 space-y-6 sm:space-y-8">
          {/* Ficha Resumen de Inspección Inicial */}
          <div className="bg-card/80 p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3 min-w-0 max-w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 truncate">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="truncate">Inspección Inicial de Campo</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                {inspeccion.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs min-w-0">
              <div className="min-w-0">
                <span className="text-muted-foreground block font-medium">Productor:</span>
                <span className="font-bold text-foreground truncate block">{prodName}</span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block font-medium">Propiedad / Predio:</span>
                <span className="font-bold text-foreground flex items-center gap-1 truncate">
                  <Building2 className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">{propName}</span>
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block font-medium">Fecha Inspección:</span>
                <span className="font-bold text-foreground">
                  {inspeccion.fecha_inspeccion ? new Date(inspeccion.fecha_inspeccion).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block font-medium">Vigencia Medidas:</span>
                <span className="font-bold text-amber-600">{inspeccion.vigencia_dias || 30} días</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 text-xs min-w-0">
              <span className="text-muted-foreground font-medium block">Medidas Ordenadas:</span>
              <p className="text-foreground font-semibold italic mt-0.5 bg-muted/30 p-2.5 rounded-xl border border-border wrap-break-words">
                {inspeccion.medidas_ordenadas || 'Ninguna observación especial'}
              </p>
            </div>
          </div>

          {/* Timeline Vertical */}
          <div className="space-y-4 min-w-0 max-w-full">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <Clock className="size-4 text-indigo-500 shrink-0" />
              Historial de Visitas de Control ({seguimientos.length})
            </h3>

            {seguimientos.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-muted/10 rounded-2xl border border-dashed border-border space-y-2">
                <Sparkles className="size-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm font-bold text-muted-foreground">
                  Aún no se han registrado visitas de seguimiento para esta inspección.
                </p>
                <p className="text-xs text-muted-foreground">
                  Haga clic en "+ Nuevo Seguimiento" para agregar la primera verificación de campo.
                </p>
              </div>
            ) : (
              <div className="relative pl-5 sm:pl-7 border-l-2 border-indigo-500/30 space-y-6 sm:space-y-8 ml-2 sm:ml-3 min-w-0 max-w-full">
                {seguimientos.map((seg, idx) => (
                  <div key={seg.id} className="relative group min-w-0 max-w-full">
                    {/* Node Dot */}
                    <div className="absolute -left-[1.65rem] sm:-left-[2.15rem] top-1 size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-background text-[10px] font-black shadow-md shrink-0">
                      {seguimientos.length - idx}
                    </div>

                    {/* Card Content */}
                    <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-5 shadow-sm space-y-3 hover:border-indigo-500/30 transition-all min-w-0 max-w-full overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/50 pb-3 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar className="size-4 text-indigo-500 shrink-0" />
                          <span className="text-xs font-black text-foreground truncate">
                            Visita del {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {seg.recomendaciones_cumplidas ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                              <CheckCircle2 className="size-3" />
                              Cumplidas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                              <AlertTriangle className="size-3" />
                              Pendientes
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border shrink-0">
                            {seg.status}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => seguimientosService.openPdfReport(seg.id)}
                            className="h-6.5 sm:h-7 px-2 text-[10px] font-bold rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer gap-1 shrink-0 ml-auto sm:ml-0"
                          >
                            <FileText className="size-3" />
                            PDF
                          </Button>
                        </div>
                      </div>

                      {/* Hallazgos */}
                      <div className="text-xs space-y-1 min-w-0">
                        <span className="text-muted-foreground font-bold">Hallazgos y Avances Constatados:</span>
                        <p className="text-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/50 wrap-break-words">
                          {seg.hallazgos_seguimiento || 'Sin anotaciones adicionales.'}
                        </p>
                      </div>

                      {/* Fotos de Evidencia */}
                      {seg.seguimiento_fotos && seg.seguimiento_fotos.length > 0 && (
                        <div className="pt-2 min-w-0">
                          <span className="text-[11px] font-bold text-muted-foreground block mb-2">
                            Evidencias Fotográficas ({seg.seguimiento_fotos.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {seg.seguimiento_fotos.map((foto) => (
                              <a
                                key={foto.id}
                                href={resolveMediaUrl(foto.imagen)}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity shrink-0"
                              >
                                <img
                                  src={resolveMediaUrl(foto.imagen)}
                                  alt="Evidencia"
                                  className="size-14 sm:size-16 object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
