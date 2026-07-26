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
    <div className="overflow-x-auto custom-scrollbar">
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
  );
};
