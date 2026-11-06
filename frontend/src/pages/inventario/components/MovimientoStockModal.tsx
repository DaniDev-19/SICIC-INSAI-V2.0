import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Calendar,
  Building2,
  Package,
} from 'lucide-react';
import type { Insumo, TipoMovimiento, ManualMovimientoDTO } from '@/types/inventario';
import type { Oficina } from '@/types/oficinas';

interface MovimientoStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumos: Insumo[];
  oficinas: Oficina[];
  preselectedInsumoId?: number | null;
  preselectedOficinaId?: number | null;
  onSave: (data: ManualMovimientoDTO) => Promise<void>;
}

export function MovimientoStockModal({
  isOpen,
  onClose,
  insumos,
  oficinas,
  preselectedInsumoId,
  preselectedOficinaId,
  onSave,
}: MovimientoStockModalProps) {
  const [insumoId, setInsumoId] = useState<string>('');
  const [oficinaId, setOficinaId] = useState<string>('');
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('ENTRADA');
  const [cantidad, setCantidad] = useState<string>('1');
  const [lote, setLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInsumoId(preselectedInsumoId ? String(preselectedInsumoId) : '');
      setOficinaId(preselectedOficinaId ? String(preselectedOficinaId) : (oficinas[0]?.id ? String(oficinas[0].id) : ''));
      setTipoMovimiento('ENTRADA');
      setCantidad('1');
      setLote('');
      setFechaVencimiento('');
      setObservaciones('');
    }
  }, [isOpen, preselectedInsumoId, preselectedOficinaId, oficinas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoId || !oficinaId || Number(cantidad) <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        insumo_id: Number(insumoId),
        oficina_id: Number(oficinaId),
        tipo_movimiento: tipoMovimiento,
        cantidad: Number(cantidad),
        lote: lote.trim() || undefined,
        fecha_vencimiento: fechaVencimiento || undefined,
        observaciones: observaciones.trim() || undefined,
      });
      onClose();
    } catch (error) {
      // Handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPositiveEffect = ['ENTRADA', 'AJUSTE_MAS'].includes(tipoMovimiento);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl lg:max-w-2xl bg-background/95 backdrop-blur-xl border-border rounded-2xl sm:rounded-3xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[min(92vh,52rem)]">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/50 shrink-0 pr-12 min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isPositiveEffect
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {isPositiveEffect ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold truncate">
                Movimiento Manual de Kardex
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground truncate">
                Registre entradas, salidas o ajustes de inventario para una oficina específica.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-w-0 max-w-full">
          <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Tipo de Movimiento */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <ArrowLeftRight className="size-3.5" />
                  Tipo de Operación <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={tipoMovimiento}
                  onValueChange={(val) => setTipoMovimiento(val as TipoMovimiento)}
                >
                  <SelectTrigger className="h-10 sm:h-11 bg-background/80 rounded-xl font-medium w-full min-w-0 max-w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-w-[calc(100vw-2rem)] sm:max-w-md">
                    <SelectItem value="ENTRADA" className="text-emerald-500 font-semibold cursor-pointer">
                      + ENTRADA (Reabastecimiento)
                    </SelectItem>
                    <SelectItem value="AJUSTE_MAS" className="text-emerald-400 font-semibold cursor-pointer">
                      + AJUSTE POSITIVO (Corrección +)
                    </SelectItem>
                    <SelectItem value="SALIDA" className="text-rose-500 font-semibold cursor-pointer">
                      - SALIDA (Transferencia / Retiro)
                    </SelectItem>
                    <SelectItem value="AJUSTE_MENOS" className="text-amber-500 font-semibold cursor-pointer">
                      - AJUSTE NEGATIVO (Merma / Pérdida)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Oficina */}
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <Building2 className="size-3.5" />
                  Oficina / Sede <span className="text-rose-500">*</span>
                </label>
                <Select value={oficinaId} onValueChange={setOficinaId}>
                  <SelectTrigger className="h-10 sm:h-11 bg-background/80 rounded-xl w-full min-w-0 max-w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                    <SelectValue placeholder="Seleccionar sede..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-52 max-w-[calc(100vw-2rem)] sm:max-w-md">
                    {oficinas.map((of) => (
                      <SelectItem key={of.id} value={String(of.id)}>
                        {of.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Insumo */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                <Package className="size-3.5" />
                Insumo <span className="text-rose-500">*</span>
              </label>
              <Select value={insumoId} onValueChange={setInsumoId}>
                <SelectTrigger className="h-10 sm:h-11 bg-background/80 rounded-xl font-medium w-full min-w-0 max-w-full [&>span]:truncate [&>span]:block [&>span]:text-left">
                  <SelectValue placeholder="Seleccionar producto del catálogo..." />
                </SelectTrigger>
                <SelectContent className="glass-effect max-h-60 max-w-[calc(100vw-2rem)] sm:max-w-md">
                  {insumos.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.codigo ? `[${i.codigo}] ` : ''}{i.nombre} {i.marca ? `(${i.marca})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Cantidad */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Cantidad <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="10"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="h-10 bg-background/80 rounded-xl font-bold"
                />
              </div>

              {/* Lote */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Lote</label>
                <Input
                  placeholder="Ej. L-2026-05"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  className="h-10 bg-background/80 rounded-xl"
                />
              </div>

              {/* Vencimiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  Vencimiento
                </label>
                <Input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="h-10 bg-background/80 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Observaciones / Motivo</label>
              <Textarea
                placeholder="Describa el motivo del movimiento (Ej. Recepción de lote central, ajuste de inventario físico...)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={3}
                className="bg-background/80 rounded-xl resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="p-3 sm:p-4 border-t border-border/50 bg-muted/20 shrink-0 flex flex-row items-center justify-between w-full gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl h-10 px-4 text-xs cursor-pointer font-bold shrink-0"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !insumoId || !oficinaId || Number(cantidad) <= 0}
              className={`rounded-xl h-10 px-5 text-xs text-white font-bold cursor-pointer shadow-lg shrink-0 ${
                isPositiveEffect
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                'Registrar Movimiento'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
