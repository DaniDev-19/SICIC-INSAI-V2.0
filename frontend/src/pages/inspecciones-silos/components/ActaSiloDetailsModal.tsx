import type { ComponentType, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useActaSilo } from '@/hooks/use-acta-silos';
import {
  Loader2,
  Calendar,
  Warehouse,
  User,
  FileText,
  ClipboardList,
  Image as ImageIcon,
  TrendingUp,
} from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media-url';

interface ActaSiloDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actaSiloId: number | null;
  onPdf?: (id: number) => void;
  pdfLoadingId?: number | null;
}

export function ActaSiloDetailsModal({
  isOpen,
  onClose,
  actaSiloId,
  onPdf,
  pdfLoadingId = null,
}: ActaSiloDetailsModalProps) {
  const { actaSilo, isLoading } = useActaSilo(isOpen ? actaSiloId : null);

  const plan = actaSilo?.planificaciones;
  const solic = plan?.solicitudes;
  const controlLabel = plan?.codigo ? `ACTA-SILO-${plan.codigo}` : `ACTA-SILO-${actaSilo?.id.toString().padStart(4, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl lg:max-w-4xl max-h-[min(92vh,52rem)] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-5 sm:p-8 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="size-11 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Warehouse className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                  Acta de Inspección de Silos
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1 truncate">
                  {actaSilo ? controlLabel : 'Cargando registro...'}
                </DialogDescription>
              </div>
            </div>
            {actaSiloId && onPdf && (
              <Button
                variant="outline"
                size="sm"
                disabled={pdfLoadingId !== null}
                onClick={() => onPdf(actaSiloId)}
                className="cursor-pointer w-full sm:w-auto shrink-0 gap-2 disabled:opacity-60 font-bold"
              >
                {pdfLoadingId === actaSiloId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {pdfLoadingId === actaSiloId ? 'Generando PDF...' : 'Imprimir Acta'}
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Cargando detalles del acta...</p>
          </div>
        ) : !actaSilo ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró el acta de silo.</p>
        ) : (
          <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex px-3 py-1 rounded-lg text-xs font-black border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                REGISTRADA
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Semana Epid: {actaSilo.semana_epid || 'N/A'}
              </span>
            </div>

            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailCard icon={Calendar} label="Fecha Notificación">
                {actaSilo.fecha_notificacion 
                  ? new Date(actaSilo.fecha_notificacion).toLocaleDateString('es-VE') 
                  : '—'}
              </DetailCard>
              <DetailCard icon={ClipboardList} label="Planificación">
                {plan?.codigo || `#${plan?.id}`}
              </DetailCard>
              <DetailCard icon={User} label="Productor">
                {solic?.clientes?.nombre || '—'}
              </DetailCard>
              <DetailCard icon={TrendingUp} label="Afectación">
                {actaSilo.cant_afectado_porcentaje ? `${actaSilo.cant_afectado_porcentaje}%` : '0%'}
              </DetailCard>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Ubicación del Establecimiento
              </h4>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20 text-sm space-y-1">
                <p><span className="font-bold text-foreground">Predio/Silos:</span> {solic?.propiedades?.nombre || '—'}</p>
                <p><span className="font-bold text-foreground">Sector/Ubicación:</span> {actaSilo.lugar_ubicacion || '—'}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Métricas de Almacenamiento
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-semibold">N° Silos</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.n_silos || '0'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">N° Galpones</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.n_galpones || '0'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Evento Fitosanitario</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.t_evento?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Capacidad Instalada</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.c_instalada || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Capacidad Operativa</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.c_operativa || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Capacidad Almacenamiento</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.c_almacenamiento || '—'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Cantidades de Rubros Evaluados
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground font-semibold">Unidad de Medida</p>
                  <p className="font-bold text-base text-foreground mt-0.5">{actaSilo.t_unidades?.nombre || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Cantidad Nacional</p>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {actaSilo.cant_nacional ? actaSilo.cant_nacional.toLocaleString() : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Cantidad Importada</p>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {actaSilo.cant_importado ? actaSilo.cant_importado.toLocaleString() : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Cantidad Afectada</p>
                  <p className="font-bold text-base text-rose-500 mt-0.5">
                    {actaSilo.cant_afectado ? actaSilo.cant_afectado.toLocaleString() : '0.00'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground font-semibold">Destino / Objetivo</p>
                  <p className="font-bold text-foreground mt-0.5">{actaSilo.destino_objetivo || '—'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Informe Técnico e Indicaciones
              </h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold mb-1">Aspectos constatados (Observaciones)</p>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/40 whitespace-pre-wrap">
                    {actaSilo.observaciones || '—'}
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Medidas y recomendaciones ordenadas</p>
                  <p className="text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/40 whitespace-pre-wrap">
                    {actaSilo.medidas_recomendadas || '—'}
                  </p>
                </div>
              </div>
            </section>

            {actaSilo.silo_fotos && actaSilo.silo_fotos.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Evidencias de la inspección
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {actaSilo.silo_fotos.map((foto) => (
                    <a
                      key={foto.id}
                      href={resolveMediaUrl(foto.imagen)}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square rounded-xl overflow-hidden border border-border hover:ring-2 ring-primary/30 transition-all"
                    >
                      <img
                        src={resolveMediaUrl(foto.imagen)}
                        alt="Evidencia Silo"
                        className="w-full h-full object-cover bg-muted"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailCard({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  );
}
