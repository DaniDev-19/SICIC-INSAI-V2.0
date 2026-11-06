import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Bug, Tag, FileText } from 'lucide-react';
import type { Plaga } from '@/types/plagas';

interface PlagaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plaga: Plaga | null;
}

export function PlagaDetailsModal({ isOpen, onClose, plaga }: PlagaDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[min(92vh,44rem)] overflow-hidden flex flex-col border-none shadow-2xl glass-effect p-0 rounded-2xl sm:rounded-3xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/40 border-b border-border/50 shrink-0 pr-12 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-10 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-wide truncate">
                Ficha de la Plaga
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {plaga?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!plaga ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró la plaga.</p>
        ) : (
          <>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar min-w-0">
              {/* Tipo badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-500/10 text-orange-600 border border-orange-500/20">
                  <Bug className="size-3" />
                  {plaga.t_plagas?.nombre || 'Sin tipo'}
                </span>
              </div>

              {/* Info grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <DetailCard icon={Bug} label="Nombre común">
                  {plaga.nombre}
                </DetailCard>
                <DetailCard icon={Bug} label="Nombre científico">
                  <span className="italic">{plaga.nombre_cientifico || '—'}</span>
                </DetailCard>
                <DetailCard icon={Tag} label="Tipo de plaga">
                  {plaga.t_plagas?.nombre || '—'}
                </DetailCard>
                <DetailCard icon={Tag} label="ID de registro">
                  #{plaga.id}
                </DetailCard>
              </section>

              {plaga.descripcion && (
                <section className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="size-3.5 text-primary" />
                    Descripción
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 rounded-xl p-3 sm:p-4 border border-border/50">
                    {plaga.descripcion}
                  </p>
                </section>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 shrink-0 flex justify-end">
              <Button onClick={onClose} className="rounded-xl h-10 px-6 font-bold cursor-pointer text-xs">
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
    <div className="p-3.5 sm:p-4 rounded-xl border border-border/50 bg-muted/20 space-y-1.5 min-w-0">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-primary shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="text-sm font-semibold text-foreground truncate">{children}</div>
    </div>
  );
}
