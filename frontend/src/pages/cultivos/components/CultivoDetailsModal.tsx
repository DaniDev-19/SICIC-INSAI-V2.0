import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Sprout, Tag, FileText } from 'lucide-react';
import type { Cultivo } from '@/types/cultivos';

interface CultivoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cultivo: Cultivo | null;
}

export function CultivoDetailsModal({ isOpen, onClose, cultivo }: CultivoDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[min(92vh,40rem)] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-6 sm:p-8 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="size-11 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                Ficha del Cultivo
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 truncate">
                {cultivo?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!cultivo ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró el cultivo.</p>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Tipo badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Tag className="size-3" />
                {cultivo.t_cultivo?.nombre || 'Sin tipo'}
              </span>
            </div>

            {/* Info grid */}
            <section className="grid sm:grid-cols-2 gap-4">
              <DetailCard icon={Sprout} label="Nombre común">
                {cultivo.nombre}
              </DetailCard>
              <DetailCard icon={Sprout} label="Nombre científico">
                <span className="italic">{cultivo.nombre_cientifico || '—'}</span>
              </DetailCard>
              <DetailCard icon={Tag} label="Tipo de cultivo">
                {cultivo.t_cultivo?.nombre || '—'}
              </DetailCard>
              <DetailCard icon={Tag} label="ID de registro">
                #{cultivo.id}
              </DetailCard>
            </section>

            {cultivo.descripcion && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="size-3.5 text-primary" />
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 rounded-xl p-4 border border-border/50">
                  {cultivo.descripcion}
                </p>
              </section>
            )}

            <div className="pt-2 flex justify-end">
              <Button onClick={onClose} className="rounded-xl h-11 px-8 font-bold cursor-pointer">
                Cerrar
              </Button>
            </div>
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
