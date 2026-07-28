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
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[min(92vh,40rem)] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-6 sm:p-8 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="size-11 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                Ficha de Oficina
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 truncate">
                {oficina?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!oficina ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró la oficina.</p>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
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
            <section className="grid sm:grid-cols-2 gap-4">
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
                    <span className="font-mono text-xs">{oficina.ubicacion_gms}</span>
                  </DetailCard>
                </div>
              )}
            </section>

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
