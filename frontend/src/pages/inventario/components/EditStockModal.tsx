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
import {
  Settings2,
  Loader2,
  AlertTriangle,
  Package,
  Building2,
  Calendar,
} from 'lucide-react';
import type { InsumoStock } from '@/types/inventario';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem: InsumoStock | null;
  onSave: (dto: { stock_minimo?: number; lote?: string; fecha_vencimiento?: string }) => Promise<void>;
  isSaving?: boolean;
}

export function EditStockModal({
  isOpen,
  onClose,
  stockItem,
  onSave,
  isSaving = false,
}: EditStockModalProps) {
  const [stockMinimo, setStockMinimo] = useState('');
  const [lote, setLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');

  useEffect(() => {
    if (isOpen && stockItem) {
      setStockMinimo(
        stockItem.stock_minimo !== undefined && stockItem.stock_minimo !== null
          ? String(stockItem.stock_minimo)
          : '0'
      );
      setLote(stockItem.lote ?? '');

      // Parse fecha_vencimiento safely regardless of ISO format or plain date string
      if (stockItem.fecha_vencimiento) {
        const raw = stockItem.fecha_vencimiento;
        // If it contains 'T' it's a full ISO timestamp → extract YYYY-MM-DD part
        const datePart = raw.includes('T') ? raw.split('T')[0] : raw.substring(0, 10);
        setFechaVencimiento(datePart);
      } else {
        setFechaVencimiento('');
      }
    } else if (!isOpen) {
      // Reset when closed
      setStockMinimo('0');
      setLote('');
      setFechaVencimiento('');
    }
  }, [isOpen, stockItem?.id]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      stock_minimo: stockMinimo !== '' ? Number(stockMinimo) : undefined,
      lote: lote.trim() || '',
      fecha_vencimiento: fechaVencimiento || '',
    });
    onClose();
  };

  if (!stockItem) return null;

  const isCritical =
    Number(stockItem.stock_actual) <= Number(stockItem.stock_minimo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl bg-background/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[min(92vh,48rem)]">
        <DialogHeader className="space-y-2 p-6 pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Settings2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Configurar Stock de Inventario
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Ajuste el stock mínimo, lote y vencimiento del registro seleccionado.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4">
          {/* Info Card del registro actual */}
          <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Package className="size-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Insumo / Producto</p>
                <p className="text-sm font-bold text-foreground">
                  {stockItem.insumos?.nombre || `Insumo #${stockItem.insumo_id}`}
                </p>
                {stockItem.insumos?.codigo && (
                  <p className="text-[11px] font-mono text-muted-foreground">{stockItem.insumos.codigo}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="size-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Oficina / Sede</p>
                <p className="text-sm font-semibold">
                  {stockItem.oficinas?.nombre || `Sede #${stockItem.oficina_id}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stock Actual</p>
                <p className={`text-lg font-black ${isCritical ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {stockItem.stock_actual}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {stockItem.insumos?.t_unidades?.nombre || ''}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estado Actual</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isCritical && (
                    <AlertTriangle className="size-4 text-amber-500" />
                  )}
                  <span className={`text-sm font-bold ${isCritical ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {Number(stockItem.stock_actual) <= 0
                      ? 'AGOTADO'
                      : isCritical
                      ? 'CRÍTICO'
                      : 'NORMAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stock Mínimo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                <AlertTriangle className="size-3.5 text-amber-500" />
                Stock Mínimo (Alerta crítica)
              </label>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Cuando el stock actual baje de este valor, el sistema mostrará una alerta de stock crítico.
              </p>
              <Input
                type="number"
                min="0"
                step="any"
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                placeholder="0"
                className="h-11 bg-background/80 rounded-xl font-bold text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lote */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Lote / Número de Serie</label>
                <Input
                  placeholder="Ej. L-2026-05"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  className="h-11 bg-background/80 rounded-xl"
                />
              </div>

              {/* Fecha de Vencimiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold flex items-center gap-1 text-foreground">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Fecha de Vencimiento
                </label>
                <Input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="h-11 bg-background/80 rounded-xl text-sm"
                />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 bg-muted/10 shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl h-10 px-4 text-xs cursor-pointer font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={(e) => { e.preventDefault(); handleSubmit(e); }}
            disabled={isSaving}
            className="rounded-xl h-10 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
