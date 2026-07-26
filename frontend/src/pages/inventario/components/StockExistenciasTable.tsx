import React from 'react';
import { Building2, Settings2, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { InsumoStock } from '@/types/inventario';

interface StockExistenciasTableProps {
  stock: InsumoStock[];
  isLoading: boolean;
  onOpenEditStock: (st: InsumoStock) => void;
  onOpenMovimientoModal: (insumoId: number) => void;
}

export const StockExistenciasTable: React.FC<StockExistenciasTableProps> = ({
  stock,
  isLoading,
  onOpenEditStock,
  onOpenMovimientoModal,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Cargando existencias por oficina...
        </p>
      </div>
    );
  }

  if (stock.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <Building2 className="size-12 mx-auto text-muted-foreground/40" />
        <p className="text-sm font-bold text-muted-foreground">No hay inventario registrado</p>
        <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
          Utilice el botón "Movimiento Kardex" para dar de alta entradas de stock en las oficinas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <th className="p-4">Insumo / Producto</th>
            <th className="p-4">Oficina / Sede</th>
            <th className="p-4">Lote</th>
            <th className="p-4">Vencimiento</th>
            <th className="p-4">Stock Actual</th>
            <th className="p-4">Stock Mínimo</th>
            <th className="p-4">Estado</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 font-medium text-xs">
          {stock.map((st) => {
            const isCritical = Number(st.stock_actual) <= Number(st.stock_minimo);
            const isZero = Number(st.stock_actual) <= 0;

            return (
              <tr key={st.id} className="hover:bg-emerald-500/5 transition-colors">
                <td className="p-4">
                  <span className="font-bold text-foreground block">
                    {st.insumos?.nombre || 'Insumo desconocido'}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {st.insumos?.codigo || 'SIN SKU'}
                  </span>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-background/80 font-medium">
                    <Building2 className="size-3 mr-1 text-primary" />
                    {st.oficinas?.nombre || `Sede #${st.oficina_id}`}
                  </Badge>
                </td>
                <td className="p-4 font-mono font-semibold">
                  {st.lote || <span className="text-muted-foreground/40 italic">-</span>}
                </td>
                <td className="p-4 text-muted-foreground">
                  {st.fecha_vencimiento
                    ? new Date(st.fecha_vencimiento).toLocaleDateString()
                    : '-'}
                </td>
                <td className="p-4 text-base font-black">
                  <span className={isZero ? 'text-rose-500' : isCritical ? 'text-amber-500' : 'text-emerald-500'}>
                    {st.stock_actual}
                  </span>{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    {st.insumos?.t_unidades?.nombre || ''}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground font-semibold">
                  {st.stock_minimo}
                </td>
                <td className="p-4">
                  {isZero ? (
                    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold">
                      AGOTADO
                    </Badge>
                  ) : isCritical ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold">
                      CRÍTICO
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold">
                      NORMAL
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenEditStock(st)}
                      title="Configurar stock mínimo, lote y vencimiento"
                      className="h-8 px-2 rounded-lg text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 cursor-pointer"
                    >
                      <Settings2 className="size-3.5 mr-1" /> Config.
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenMovimientoModal(st.insumo_id)}
                      title="Registrar movimiento de entrada/salida en Kardex"
                      className="h-8 px-2 rounded-lg text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <ArrowLeftRight className="size-3.5 mr-1" /> Movimiento
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
