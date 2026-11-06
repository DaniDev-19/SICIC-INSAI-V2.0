import React from 'react';
import { Eye, ArrowLeftRight, Tag, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Can from '@/components/auth/Can';
import type { Insumo } from '@/types/inventario';

interface InsumosCatalogTableProps {
  insumos: Insumo[];
  selectedInsumoIds: number[];
  onToggleSelectAll: () => void;
  onToggleSelectInsumo: (id: number) => void;
  onOpenDetail: (insumo: Insumo) => void;
  onOpenMovimientoModal: (insumoId: number) => void;
  onOpenEdit: (insumo: Insumo) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const InsumosCatalogTable: React.FC<InsumosCatalogTableProps> = ({
  insumos,
  selectedInsumoIds,
  onToggleSelectAll,
  onToggleSelectInsumo,
  onOpenDetail,
  onOpenMovimientoModal,
  onOpenEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Package className="size-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Cargando catálogo maestro...</p>
      </div>
    );
  }

  if (insumos.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <Package className="size-12 mx-auto text-muted-foreground/40" />
        <p className="text-sm font-bold text-muted-foreground">No se encontraron insumos</p>
        <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
          No hay insumos registrados que coincidan con la búsqueda. Intente con otro término o cree un nuevo insumo.
        </p>
      </div>
    );
  }

  const allSelected = insumos.length > 0 && selectedInsumoIds.length === insumos.length;

  return (
    <div className="overflow-hidden">
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {insumos.map((i) => {
          const isSelected = selectedInsumoIds.includes(i.id);
          return (
            <article
              key={i.id}
              className={`rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 min-w-0 max-w-full overflow-hidden transition-all ${
                isSelected ? 'bg-primary/5 border-primary/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectInsumo(i.id)}
                    className="mt-1 rounded border-border cursor-pointer accent-emerald-600 shrink-0"
                  />
                  <div className="size-10 shrink-0 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Package className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm sm:text-base break-words whitespace-normal">
                      {i.nombre}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="font-mono font-bold text-xs text-emerald-500">
                        {i.codigo || 'SIN CÓDIGO'}
                      </span>
                      {i.marca && (
                        <span className="text-xs text-muted-foreground">
                          • {i.marca}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {i.c_insumos && (
                        <Badge variant="outline" className="bg-background/80 text-[10px] font-semibold break-words max-w-full whitespace-normal">
                          {i.c_insumos.nombre}
                        </Badge>
                      )}
                      {i.t_unidades && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          ({i.t_unidades.nombre})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {i.descripcion && (
                <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t border-border/40">
                  {i.descripcion}
                </p>
              )}

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenDetail(i)}
                  title="Ver detalle del insumo"
                  className="size-8 p-0 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenMovimientoModal(i.id)}
                  title="Registrar movimiento en Kardex"
                  className="size-8 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                >
                  <ArrowLeftRight className="size-4" />
                </Button>
                <Can screen="insumos" action="update">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenEdit(i)}
                    title="Editar insumo"
                    className="size-8 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                  >
                    <Tag className="size-4" />
                  </Button>
                </Can>
                <Can screen="insumos" action="delete">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(i.id)}
                    title="Eliminar insumo"
                    className="size-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Can>
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
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-border cursor-pointer accent-emerald-600"
                />
              </th>
              <th className="p-4">SKU / Código</th>
              <th className="p-4">Nombre del Insumo</th>
              <th className="p-4">Marca</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Unidad</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium text-xs">
            {insumos.map((i) => (
              <tr key={i.id} className="hover:bg-emerald-500/5 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedInsumoIds.includes(i.id)}
                    onChange={() => onToggleSelectInsumo(i.id)}
                    className="rounded border-border cursor-pointer accent-emerald-600"
                  />
                </td>
                <td className="p-4 font-mono font-bold text-emerald-500">
                  {i.codigo || <span className="text-muted-foreground/40 italic">SIN CÓDIGO</span>}
                </td>
                <td className="p-4 font-bold text-foreground">
                  {i.nombre}
                  {i.descripcion && (
                    <p className="text-[11px] font-normal text-muted-foreground line-clamp-1 mt-0.5">
                      {i.descripcion}
                    </p>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{i.marca || 'N/A'}</td>
                <td className="p-4">
                  {i.c_insumos ? (
                    <Badge variant="outline" className="bg-background/80 font-semibold">
                      {i.c_insumos.nombre}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/40 italic">-</span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">
                  {i.t_unidades ? i.t_unidades.nombre : '-'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenDetail(i)}
                      title="Ver detalle del insumo"
                      className="size-8 p-0 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpenMovimientoModal(i.id)}
                      title="Registrar movimiento en Kardex"
                      className="size-8 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                    >
                      <ArrowLeftRight className="size-4" />
                    </Button>
                    <Can screen="insumos" action="update">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenEdit(i)}
                        title="Editar insumo"
                        className="size-8 p-0 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer"
                      >
                        <Tag className="size-4" />
                      </Button>
                    </Can>
                    <Can screen="insumos" action="delete">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(i.id)}
                        title="Eliminar insumo"
                        className="size-8 p-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
