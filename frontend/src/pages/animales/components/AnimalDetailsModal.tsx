import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Dog, Tag, FileText, Leaf, Ruler, Weight } from 'lucide-react';
import type { Animal } from '@/types/animales';

interface AnimalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal | null;
}

export function AnimalDetailsModal({ isOpen, onClose, animal }: AnimalDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[min(92vh,52rem)] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-6 sm:p-8 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="size-11 sm:size-12 shrink-0 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                Ficha del Animal
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 truncate">
                {animal?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!animal ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró el animal.</p>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Tipo badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Tag className="size-3" />
                {animal.t_animales?.nombre || 'Sin tipo'}
              </span>
            </div>

            {/* Info principal */}
            <section className="grid sm:grid-cols-2 gap-4">
              <DetailCard icon={Dog} label="Nombre común">
                {animal.nombre}
              </DetailCard>
              <DetailCard icon={Dog} label="Nombre científico">
                <span className="italic">{animal.nombre_cientifico || '—'}</span>
              </DetailCard>
              <DetailCard icon={Tag} label="Tipo de animal">
                {animal.t_animales?.nombre || '—'}
              </DetailCard>
              <DetailCard icon={Leaf} label="Dieta">
                {animal.dieta || '—'}
              </DetailCard>
              <DetailCard icon={Dog} label="Esperanza de vida">
                {animal.esperanza_vida || '—'}
              </DetailCard>
              <DetailCard icon={Leaf} label="Hábitat principal">
                {animal.habitat_principal || '—'}
              </DetailCard>
              <DetailCard icon={Weight} label="Peso promedio (kg)">
                {animal.peso_promedio_kg != null ? `${animal.peso_promedio_kg} kg` : '—'}
              </DetailCard>
              <DetailCard icon={Ruler} label="Longitud promedio (m)">
                {animal.longitud_promedio_mt != null ? `${animal.longitud_promedio_mt} m` : '—'}
              </DetailCard>
            </section>

            {animal.descripcion && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="size-3.5 text-primary" />
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 rounded-xl p-4 border border-border/50">
                  {animal.descripcion}
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
