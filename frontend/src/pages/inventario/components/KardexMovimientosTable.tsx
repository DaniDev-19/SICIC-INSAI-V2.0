import React from 'react';
import { History, ArrowDownRight, Plus, ArrowUpRight, Tag, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MovimientoInsumo } from '@/types/inventario';

interface KardexMovimientosTableProps {
  movimientos: MovimientoInsumo[];
  isLoading: boolean;
}

export const getTipoMovBadge = (tipo: string) => {
  switch (tipo) {
    case 'ENTRADA':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold gap-1">
          <ArrowDownRight className="size-3" /> ENTRADA
        </Badge>
      );
    case 'AJUSTE_MAS':
      return (
        <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 font-bold gap-1">
          <Plus className="size-3" /> AJUSTE (+)
        </Badge>
      );
    case 'SALIDA':
      return (
        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold gap-1">
          <ArrowUpRight className="size-3" /> SALIDA
        </Badge>
      );
    case 'AJUSTE_MENOS':
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold gap-1">
          <ArrowUpRight className="size-3" /> AJUSTE (-)
        </Badge>
      );
    case 'CONSUMO':
      return (
        <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-bold gap-1">
          <Tag className="size-3" /> CONSUMO CAMPO
        </Badge>
      );
    default:
      return <Badge variant="outline">{tipo}</Badge>;
  }
};

export const KardexMovimientosTable: React.FC<KardexMovimientosTableProps> = ({
  movimientos,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Cargando trazabilidad de Kardex...
        </p>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <History className="size-12 mx-auto text-muted-foreground/40" />
        <p className="text-sm font-bold text-muted-foreground">Sin historial de movimientos</p>
        <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
          Los registros de movimientos aparecerán automáticamente al operar en inspecciones, avales, silos o registrar movimientos manuales.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {movimientos.map((m) => (
          <article
            key={m.id}
            className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3 min-w-0 max-w-full overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-sm sm:text-base break-words whitespace-normal">
                  {m.insumos?.nombre || `Insumo #${m.insumo_id}`}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                  </span>
                  {m.oficinas && (
                    <span className="text-xs text-primary font-medium truncate">
                      • {m.oficinas.nombre}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                {getTipoMovBadge(m.tipo_movimiento)}
                <span className={`text-base font-black ${
                  ['ENTRADA', 'AJUSTE_MAS'].includes(m.tipo_movimiento)
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                }`}>
                  {['ENTRADA', 'AJUSTE_MAS'].includes(m.tipo_movimiento) ? '+' : '-'}
                  {m.cantidad} {m.insumos?.t_unidades?.nombre || ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Lote</span>
                <span className="font-mono font-semibold">{m.lote || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Origen</span>
                {m.inspecciones ? (
                  <Badge variant="outline" className="bg-background/80 font-mono text-[10px]">
                    Inspección #{m.inspecciones.n_control}
                  </Badge>
                ) : m.avales_sanitarios ? (
                  <Badge variant="outline" className="bg-background/80 font-mono text-[10px]">
                    Aval #{m.avales_sanitarios.numero_aval}
                  </Badge>
                ) : m.acta_silos ? (
                  <Badge variant="outline" className="bg-background/80 font-mono text-[10px]">
                    Silos #{m.acta_silos.n_silos}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground/60 italic">Ajuste Manual</span>
                )}
              </div>
            </div>

            {m.observaciones && (
              <p className="text-xs text-muted-foreground italic bg-muted/20 p-2.5 rounded-xl border border-border/40 break-words">
                "{m.observaciones}"
              </p>
            )}
          </article>
        ))}
      </div>

      {/* ── Vista Escritorio (>= lg): Tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="p-4">Fecha / Hora</th>
              <th className="p-4">Tipo Movimiento</th>
              <th className="p-4">Insumo</th>
              <th className="p-4">Cantidad</th>
              <th className="p-4">Lote</th>
              <th className="p-4">Sede / Oficina</th>
              <th className="p-4">Origen / Proceso</th>
              <th className="p-4">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium text-xs">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-emerald-500/5 transition-colors">
                <td className="p-4 text-muted-foreground font-mono">
                  {m.created_at ? new Date(m.created_at).toLocaleString() : '-'}
                </td>
                <td className="p-4">{getTipoMovBadge(m.tipo_movimiento)}</td>
                <td className="p-4 font-bold text-foreground">
                  {m.insumos?.nombre || `Insumo #${m.insumo_id}`}
                </td>
                <td className="p-4 text-sm font-black">
                  {['ENTRADA', 'AJUSTE_MAS'].includes(m.tipo_movimiento) ? '+' : '-'}
                  {m.cantidad} {m.insumos?.t_unidades?.nombre || ''}
                </td>
                <td className="p-4 font-mono font-semibold">
                  {m.lote || <span className="text-muted-foreground/40 italic">-</span>}
                </td>
                <td className="p-4">
                  <span className="text-muted-foreground font-medium">
                    {m.oficinas?.nombre || `Sede #${m.oficina_id}`}
                  </span>
                </td>
                <td className="p-4">
                  {m.inspecciones ? (
                    <Badge variant="outline" className="bg-background/80 font-mono text-[11px]">
                      Inspección #{m.inspecciones.n_control}
                    </Badge>
                  ) : m.avales_sanitarios ? (
                    <Badge variant="outline" className="bg-background/80 font-mono text-[11px]">
                      Aval #{m.avales_sanitarios.numero_aval}
                    </Badge>
                  ) : m.acta_silos ? (
                    <Badge variant="outline" className="bg-background/80 font-mono text-[11px]">
                      Silos #{m.acta_silos.n_silos}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60 italic font-sans">Ajuste Manual</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">
                  {m.observaciones || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
