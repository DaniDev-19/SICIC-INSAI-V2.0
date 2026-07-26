
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Barcode,
  Tag,
  Ruler,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import type { Insumo } from '@/types/inventario';

interface InsumoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumo: Insumo | null;
  onEdit?: (insumo: Insumo) => void;
}

export function InsumoDetailModal({
  isOpen,
  onClose,
  insumo,
  onEdit,
}: InsumoDetailModalProps) {
  if (!insumo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl mx-auto bg-background/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                <Package className="size-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold leading-tight truncate">
                  {insumo.nombre}
                </DialogTitle>
                {insumo.codigo && (
                  <p className="text-xs font-mono text-emerald-500 font-bold mt-0.5">
                    {insumo.codigo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Badges de categoría y estado */}
          <div className="flex flex-wrap gap-2">
            {insumo.c_insumos && (
              <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold gap-1.5">
                <Tag className="size-3" />
                {insumo.c_insumos.nombre}
              </Badge>
            )}
            {insumo.t_unidades && (
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-semibold gap-1.5">
                <Ruler className="size-3" />
                {insumo.t_unidades.nombre}
                {insumo.t_unidades.abreviatura ? ` (${insumo.t_unidades.abreviatura})` : ''}
              </Badge>
            )}
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold gap-1.5">
              <CheckCircle2 className="size-3" />
              Activo
            </Badge>
          </div>

          {/* Información Principal */}
          <div className="bg-muted/30 border border-border rounded-xl divide-y divide-border overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Barcode className="size-3" /> Código SKU
                </p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {insumo.codigo || <span className="text-muted-foreground/50 italic text-xs font-sans font-normal">Sin código</span>}
                </p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="size-3" /> Marca / Fabricante
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {insumo.marca || <span className="text-muted-foreground/50 italic text-xs font-normal">No especificada</span>}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Categoría
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {insumo.c_insumos?.nombre || <span className="text-muted-foreground/50 italic text-xs font-normal">Sin categoría</span>}
                </p>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Unidad de Medida
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {insumo.t_unidades
                    ? `${insumo.t_unidades.nombre}${insumo.t_unidades.abreviatura ? ` (${insumo.t_unidades.abreviatura})` : ''}`
                    : <span className="text-muted-foreground/50 italic text-xs font-normal">No especificada</span>}
                </p>
              </div>
            </div>

            {insumo.descripcion && (
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                  <FileText className="size-3" /> Descripción / Especificaciones
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {insumo.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Footer registro */}
          {insumo.created_at && (
            <p className="text-[11px] text-muted-foreground/60 text-right">
              Registrado el{' '}
              {new Date(insumo.created_at).toLocaleDateString('es-VE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 px-4 text-xs cursor-pointer"
          >
            <X className="size-4 mr-1.5" /> Cerrar
          </Button>
          {onEdit && (
            <Button
              onClick={() => { onEdit(insumo); onClose(); }}
              className="rounded-xl h-10 px-5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Editar Insumo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
