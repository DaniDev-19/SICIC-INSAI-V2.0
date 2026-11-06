import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Car, Bike, Truck, ShieldCheck, Tag, Palette, Calendar } from 'lucide-react';
import type { Vehiculo } from '@/types/vehiculos';

interface VehiculoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
}

const TIPO_ICON: Record<string, React.ReactNode> = {
  MOTO: <Bike className="size-5 sm:size-6" />,
  CARRO: <Car className="size-5 sm:size-6" />,
  CAMIONETA: <Truck className="size-5 sm:size-6" />,
  OTRO: <Car className="size-5 sm:size-6" />,
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPERATIVO: { label: 'Operativo', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  INACTIVO: { label: 'Inactivo', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

export function VehiculoDetailsModal({ isOpen, onClose, vehiculo }: VehiculoDetailsModalProps) {
  if (!vehiculo) return null;

  const status = vehiculo.status ? STATUS_CONFIG[vehiculo.status] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[min(92vh,46rem)] overflow-hidden flex flex-col border-none shadow-2xl glass-effect p-0 rounded-2xl sm:rounded-3xl">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 bg-muted/40 border-b border-border/50 shrink-0 pr-12 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="size-10 sm:size-12 shrink-0 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              {vehiculo.tipo ? (TIPO_ICON[vehiculo.tipo] || <Car className="size-5 sm:size-6" />) : <Car className="size-5 sm:size-6" />}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-black uppercase tracking-wide truncate">
                Ficha del Vehículo
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {vehiculo.marca} {vehiculo.modelo} — {vehiculo.placa}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto custom-scrollbar min-w-0">
          {/* Badges de estatus y tipo */}
          <div className="flex flex-wrap items-center gap-2">
            {status ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${status.color}`}>
                <ShieldCheck className="size-3 mr-1" />
                {status.label}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{vehiculo.status || '—'}</span>
            )}
            {vehiculo.tipo && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted/60 text-muted-foreground border border-border">
                <Tag className="size-3" />
                {vehiculo.tipo}
              </span>
            )}
          </div>

          {/* Info grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <DetailCard icon={Tag} label="Placa / Matrícula">
              <span className="font-mono font-black text-sm tracking-wider text-primary">
                {vehiculo.placa}
              </span>
            </DetailCard>

            <DetailCard icon={Car} label="Marca y Modelo">
              {vehiculo.marca || '—'} {vehiculo.modelo || ''}
            </DetailCard>

            <DetailCard icon={Palette} label="Color">
              {vehiculo.color || 'No especificado'}
            </DetailCard>

            <DetailCard icon={Calendar} label="ID Registro">
              #{vehiculo.id}
            </DetailCard>
          </section>
        </div>

        <div className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 shrink-0 flex justify-end">
          <Button onClick={onClose} className="rounded-xl h-10 px-6 font-bold cursor-pointer text-xs">
            Cerrar
          </Button>
        </div>
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

