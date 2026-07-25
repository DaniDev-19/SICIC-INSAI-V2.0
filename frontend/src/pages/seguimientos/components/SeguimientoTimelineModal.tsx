import React from 'react';
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
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl border-none shadow-2xl glass-effect p-0 custom-scrollbar max-h-[92vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
                <Activity className="size-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-black uppercase tracking-wide truncate">
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl gap-1.5 cursor-pointer shrink-0"
              >
                <Activity className="size-4" />
                + Nuevo Seguimiento
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Ficha Resumen de Inspección Inicial */}
          <div className="bg-card/80 p-5 rounded-2xl border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                Inspección Inicial de Campo
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {inspeccion.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Productor:</span>
                <span className="font-bold text-foreground">{prodName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Propiedad / Predio:</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Building2 className="size-3.5 text-primary" />
                  {propName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Fecha Inspección:</span>
                <span className="font-bold text-foreground">
                  {inspeccion.fecha_inspeccion ? new Date(inspeccion.fecha_inspeccion).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Vigencia Medidas:</span>
                <span className="font-bold text-amber-600">{inspeccion.vigencia_dias || 30} días</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground font-medium block">Medidas Ordenadas:</span>
              <p className="text-foreground font-semibold italic mt-0.5 bg-muted/30 p-2.5 rounded-xl border border-border">
                {inspeccion.medidas_ordenadas || 'Ninguna observación especial'}
              </p>
            </div>
          </div>

          {/* Timeline Vertical */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
              <Clock className="size-4 text-indigo-500" />
              Historial de Visitas de Control ({seguimientos.length})
            </h3>

            {seguimientos.length === 0 ? (
              <div className="p-8 text-center bg-muted/10 rounded-2xl border border-dashed border-border space-y-2">
                <Sparkles className="size-8 text-muted-foreground/50 mx-auto" />
                <p className="text-sm font-bold text-muted-foreground">
                  Aún no se han registrado visitas de seguimiento para esta inspección.
                </p>
                <p className="text-xs text-muted-foreground">
                  Haga clic en "+ Nuevo Seguimiento" para agregar la primera verificación de campo.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-8 ml-3">
                {seguimientos.map((seg, idx) => (
                  <div key={seg.id} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] top-1 size-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-background text-[10px] font-black shadow-md">
                      {seguimientos.length - idx}
                    </div>

                    {/* Card Content */}
                    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3 hover:border-indigo-500/30 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-indigo-500" />
                          <span className="text-xs font-black text-foreground">
                            Visita del {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {seg.recomendaciones_cumplidas ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              <CheckCircle2 className="size-3" />
                              Recomendaciones Cumplidas
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              <AlertTriangle className="size-3" />
                              Recomendaciones Pendientes
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border">
                            {seg.status}
                          </span>
                        </div>
                      </div>

                      {/* Hallazgos */}
                      <div className="text-xs space-y-1">
                        <span className="text-muted-foreground font-bold">Hallazgos y Avances Constatados:</span>
                        <p className="text-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/50">
                          {seg.hallazgos_seguimiento || 'Sin anotaciones adicionales.'}
                        </p>
                      </div>

                      {/* Fotos de Evidencia */}
                      {seg.seguimiento_fotos && seg.seguimiento_fotos.length > 0 && (
                        <div className="pt-2">
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
                                className="block rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={resolveMediaUrl(foto.imagen)}
                                  alt="Evidencia"
                                  className="size-16 object-cover"
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
