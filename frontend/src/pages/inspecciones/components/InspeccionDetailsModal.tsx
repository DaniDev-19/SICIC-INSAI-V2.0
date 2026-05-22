import type { ComponentType, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInspeccion } from '@/hooks/use-inspecciones';
import {
  Eye,
  Loader2,
  Calendar,
  Clock,
  User,
  FileText,
  Link as LinkIcon,
  ClipboardList,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InspeccionStatus } from '@/types/inspecciones';

const STATUS_STYLES: Record<InspeccionStatus, string> = {
  PENDIENTE: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20',
  INSPECCIONANDO: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  FINALIZADA: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  NO_APROBADA: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  SEGUIMIENTO: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  CUARENTENA: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  NO_ATENDIDA: 'bg-stone-500/10 text-stone-600 border-stone-500/20',
};

interface InspeccionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspeccionId: number | null;
  onEdit?: () => void;
}

function formatTime(iso: string | null) {
  if (!iso) return '—';
  try {
    const t = iso.includes('T') ? iso.split('T')[1] : iso;
    const [h, m] = t.split(':');
    const hours = parseInt(h, 10);
    const minutes = m?.slice(0, 2) || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  } catch {
    return iso;
  }
}

export function InspeccionDetailsModal({
  isOpen,
  onClose,
  inspeccionId,
  onEdit,
}: InspeccionDetailsModalProps) {
  const { inspeccion, isLoading } = useInspeccion(isOpen ? inspeccionId : null);

  const plan = inspeccion?.planificaciones;
  const solic = plan?.solicitudes;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-8 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Eye className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-wide">
                  Ficha de Inspección
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {inspeccion?.n_control || 'Cargando registro...'}
                </DialogDescription>
              </div>
            </div>
            {onEdit && inspeccion && (
              <Button variant="outline" size="sm" onClick={onEdit} className="cursor-pointer shrink-0">
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Cargando detalles...</p>
          </div>
        ) : !inspeccion ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró la inspección.</p>
        ) : (
          <div className="p-8 space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  'inline-flex px-3 py-1 rounded-lg text-xs font-black border',
                  STATUS_STYLES[inspeccion.status]
                )}
              >
                {inspeccion.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                Formulario: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
              </span>
            </div>

            <section className="grid md:grid-cols-2 gap-4">
              <DetailCard icon={Calendar} label="Fecha de inspección">
                {new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-VE')}
              </DetailCard>
              <DetailCard icon={Clock} label="Hora">
                {formatTime(inspeccion.hora_inspeccion)}
              </DetailCard>
              <DetailCard icon={ClipboardList} label="Planificación">
                {plan?.codigo || `#${plan?.id}`} — {solic?.codigo || 'Sin solicitud'}
              </DetailCard>
              <DetailCard icon={User} label="Productor / Predio">
                {solic?.clientes?.nombre || '—'} / {solic?.propiedades?.nombre || '—'}
              </DetailCard>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Persona atendida
              </h4>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <p><span className="font-bold">Nombre:</span> {inspeccion.atendido_por_nombre || '—'}</p>
                <p><span className="font-bold">Cédula:</span> {inspeccion.atendido_por_cedula || '—'}</p>
                <p><span className="font-bold">Teléfono:</span> {inspeccion.atendido_por_tlf || '—'}</p>
                <p><span className="font-bold">Email:</span> {inspeccion.atendido_por_email || '—'}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Ubicación de campo
              </h4>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <p><span className="font-bold">UTM N:</span> {inspeccion.insp_utm_norte ?? '—'}</p>
                <p><span className="font-bold">UTM E:</span> {inspeccion.insp_utm_este ?? '—'}</p>
                <p><span className="font-bold">Zona:</span> {inspeccion.insp_utm_zona || '—'}</p>
              </div>
              {inspeccion.google_maps_url && (
                <a
                  href={inspeccion.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
                >
                  <LinkIcon className="size-4" />
                  Abrir en Google Maps
                </a>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Informe técnico
              </h4>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-bold mb-1">Aspectos constatados</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {inspeccion.aspectos_constatados || '—'}
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-1">Medidas ordenadas</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {inspeccion.medidas_ordenadas || '—'}
                  </p>
                </div>
                <p>
                  <span className="font-bold">Certificado fitosanitario:</span>{' '}
                  {inspeccion.posee_certificado || '—'}
                  {inspeccion.vigencia_dias ? ` (${inspeccion.vigencia_dias} días)` : ''}
                </p>
              </div>
            </section>

            {inspeccion.finalidad_inspeccion && inspeccion.finalidad_inspeccion.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Finalidades
                </h4>
                <ul className="space-y-2">
                  {inspeccion.finalidad_inspeccion.map((fi) => (
                    <li
                      key={fi.id}
                      className="p-3 rounded-xl border border-border/50 bg-muted/20 text-sm"
                    >
                      <span className="font-bold">{fi.finalidad?.nombre || `Finalidad #${fi.finalidad_id}`}</span>
                      {fi.objetivo && (
                        <p className="text-muted-foreground mt-1">{fi.objetivo}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {inspeccion.inspeccion_fotos && inspeccion.inspeccion_fotos.length > 0 && (
              <section className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="size-4" />
                  Evidencias fotográficas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {inspeccion.inspeccion_fotos.map((foto) => (
                    <a
                      key={foto.id}
                      href={foto.imagen}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square rounded-xl overflow-hidden border border-border hover:ring-2 ring-primary/30 transition-all"
                    >
                      <img src={foto.imagen} alt="Evidencia" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {(inspeccion.avales_sanitarios?.length ?? 0) > 0 && (
              <p className="text-xs text-amber-600 font-semibold flex items-center gap-2">
                <FileText className="size-4" />
                Esta inspección tiene avales sanitarios vinculados.
              </p>
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
