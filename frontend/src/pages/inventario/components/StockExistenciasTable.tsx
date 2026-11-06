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
    <div className="overflow-hidden">
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {stock.map((st) => {
          const isCritical = Number(st.stock_actual) <= Number(st.stock_minimo);
          const isZero = Number(st.stock_actual) <= 0;

          return (
            <article
              key={st.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 min-w-0 max-w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm sm:text-base break-words whitespace-normal">
                    {st.insumos?.nombre || 'Insumo desconocido'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-muted-foreground font-semibold">
                      {st.insumos?.codigo || 'SIN SKU'}
                    </span>
                    <Badge variant="outline" className="bg-background/80 text-[10px] font-medium max-w-full">
                      <Building2 className="size-3 mr-1 text-primary shrink-0" />
                      <span className="break-words">{st.oficinas?.nombre || `Sede #${st.oficina_id}`}</span>
                    </Badge>
                  </div>
                </div>

                <div className="shrink-0">
                  {isZero ? (
                    <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold text-[10px]">
                      AGOTADO
                    </Badge>
                  ) : isCritical ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold text-[10px]">
                      CRÍTICO
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold text-[10px]">
                      NORMAL
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-border/40">
                <div className="bg-muted/30 p-2 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stock Actual</span>
                  <span className={`text-base font-black ${isZero ? 'text-rose-500' : isCritical ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {st.stock_actual}
                  </span>{' '}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    {st.insumos?.t_unidades?.nombre || ''}
                  </span>
                </div>
                <div className="bg-muted/30 p-2 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Stock Mínimo</span>
                  <span className="text-base font-black text-foreground">{st.stock_minimo}</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Lote</span>
                  <span className="font-mono text-xs font-semibold truncate block">{st.lote || '—'}</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Vencimiento</span>
                  <span className="text-xs font-semibold text-muted-foreground truncate block">
                    {st.fecha_vencimiento ? new Date(st.fecha_vencimiento).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenEditStock(st)}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 cursor-pointer"
                >
                  <Settings2 className="size-3.5 mr-1" /> Configurar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenMovimientoModal(st.insumo_id)}
                  className="h-8 px-2.5 rounded-lg text-xs font-bold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                >
                  <ArrowLeftRight className="size-3.5 mr-1" /> Movimiento
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Vista Escritorio (>= lg): Tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
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
    </div>
  );
};
