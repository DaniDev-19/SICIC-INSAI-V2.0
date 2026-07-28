import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Leaf, Tag, FileText, Bug, Sprout, Dog, Stethoscope } from 'lucide-react';
import type { Programa } from '@/types/programas';

interface ProgramaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programa: Programa | null;
}

export function ProgramaDetailsModal({ isOpen, onClose, programa }: ProgramaDetailsModalProps) {
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
                Ficha del Programa
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 truncate">
                {programa?.nombre || 'Cargando...'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!programa ? (
          <p className="p-8 text-center text-muted-foreground">No se encontró el programa.</p>
        ) : (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Tipo badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <Tag className="size-3" />
                {programa.t_programa?.nombre || 'Sin tipo'}
              </span>
            </div>

            {/* Info principal */}
            <section className="grid sm:grid-cols-2 gap-4">
              <DetailCard icon={Leaf} label="Nombre del programa">
                {programa.nombre}
              </DetailCard>
              <DetailCard icon={Tag} label="Tipo de programa">
                {programa.t_programa?.nombre || '—'}
              </DetailCard>
            </section>

            {programa.descripcion && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <FileText className="size-3.5 text-primary" />
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 rounded-xl p-4 border border-border/50">
                  {programa.descripcion}
                </p>
              </section>
            )}

            {/* Asociaciones */}
            {(programa.programa_cultivo?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Sprout className="size-3.5 text-emerald-500" />
                  Cultivos asociados ({programa.programa_cultivo!.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {programa.programa_cultivo!.map((pc) => (
                    <span key={pc.cultivo.id} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      {pc.cultivo.nombre}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {(programa.programa_animales?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Dog className="size-3.5 text-amber-500" />
                  Animales asociados ({programa.programa_animales!.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {programa.programa_animales!.map((pa) => (
                    <span key={pa.animales.id} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                      {pa.animales.nombre}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {(programa.programa_plaga?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Bug className="size-3.5 text-orange-500" />
                  Plagas asociadas ({programa.programa_plaga!.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {programa.programa_plaga!.map((pp) => (
                    <span key={pp.plagas.id} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-700 border border-orange-500/20">
                      {pp.plagas.nombre}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {(programa.programa_enfermedades?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Stethoscope className="size-3.5 text-purple-500" />
                  Enfermedades asociadas ({programa.programa_enfermedades!.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {programa.programa_enfermedades!.map((pe) => (
                    <span key={pe.enfermedades.id} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
                      {pe.enfermedades.nombre}
                    </span>
                  ))}
                </div>
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
