import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Building2, MapPin, ShieldCheck, Hash, Navigation } from 'lucide-react';
import type { Oficina } from '@/types/oficinas';

interface OficinaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  oficina: Oficina | null;
}

export function OficinaDetailsModal({ isOpen, onClose, oficina }: OficinaDetailsModalProps) {
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
                Ficha de Oficina
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {oficina?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!oficina ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró la oficina.</p>
        ) : (
          <>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar min-w-0">
              {/* Centro de validación badge */}
              <div>
                {oficina.es_centro_validacion ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck className="size-3" />
                    Centro de Validación
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-muted/40 text-muted-foreground border border-border">
                    <ShieldCheck className="size-3" />
                    Sede Regular
                  </span>
                )}
              </div>

              {/* Info grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <DetailCard icon={Building2} label="Nombre de la Oficina">
                  {oficina.nombre}
                </DetailCard>
                <DetailCard icon={Hash} label="ID de Registro">
                  #{oficina.id}
                </DetailCard>
                <div className="sm:col-span-2">
                  <DetailCard icon={MapPin} label="Dirección">
                    {oficina.direccion || '— Sin dirección registrada'}
                  </DetailCard>
                </div>
                {oficina.ubicacion_gms && (
                  <div className="sm:col-span-2">
                    <DetailCard icon={Navigation} label="Coordenadas GMS">
                      <span className="font-mono text-xs break-all">{oficina.ubicacion_gms}</span>
                    </DetailCard>
                  </div>
                )}
              </section>
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
    <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground">{children}</p>
    </div>
  );
}
