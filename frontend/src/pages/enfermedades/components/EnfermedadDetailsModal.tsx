import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Stethoscope, Tag, FileText, AlertTriangle } from 'lucide-react';
import type { Enfermedad } from '@/types/enfermedades';

interface EnfermedadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enfermedad: Enfermedad | null;
}

export function EnfermedadDetailsModal({ isOpen, onClose, enfermedad }: EnfermedadDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[min(92vh,44rem)] flex flex-col overflow-hidden border-none shadow-2xl glass-effect p-0">
        <DialogHeader className="p-4 sm:p-6 pr-12 pb-4 bg-muted/40 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="size-10 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-wide truncate">
                Ficha de la Enfermedad
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {enfermedad?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!enfermedad ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró la enfermedad.</p>
        ) : (
          <>
            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Tipo badge + Zoonótica */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Tag className="size-3" />
                  {enfermedad.t_enfermedades?.nombre || 'Sin tipo'}
                </span>
                {enfermedad.zoonatica && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <AlertTriangle className="size-3" />
                    {enfermedad.zoonatica}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <DetailCard icon={Stethoscope} label="Nombre común">
                  {enfermedad.nombre}
                </DetailCard>
                <DetailCard icon={Stethoscope} label="Nombre científico">
                  <span className="italic">{enfermedad.nombre_cientifico || '—'}</span>
                </DetailCard>
                <DetailCard icon={Tag} label="Tipo de enfermedad">
                  {enfermedad.t_enfermedades?.nombre || '—'}
                </DetailCard>
                <DetailCard icon={AlertTriangle} label="Condición zoonótica">
                  {enfermedad.zoonatica || 'No aplica'}
                </DetailCard>
              </section>

              {enfermedad.descripcion && (
                <section className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="size-3.5 text-primary" />
                    Descripción
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 rounded-xl p-3 sm:p-4 border border-border/50">
                    {enfermedad.descripcion}
                  </p>
                </section>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 shrink-0 flex items-center justify-end w-full">
              <Button onClick={onClose} className="rounded-xl h-10 sm:h-11 px-6 sm:px-8 font-bold cursor-pointer w-full sm:w-auto">
                Cerrar
              </Button>
            </div>
          </>
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
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
