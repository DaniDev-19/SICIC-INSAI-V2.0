import type { Plaga } from '@/types/plagas';
import { Bug, Tag } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PlagasTableProps {
  plagas: Plaga[];
  onView?: (plaga: Plaga) => void;
  onEdit: (plaga: Plaga) => void;
  onDelete: (id: number) => void;
}

export function PlagasTable({
  plagas,
  onView,
  onEdit,
  onDelete,
}: PlagasTableProps) {
  if (plagas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Bug className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron plagas</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          Intenta ajustar tus criterios de búsqueda o filtros.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Vista Móvil / Tarjetas (lg:hidden) ── */}
      <div className="divide-y divide-border/50 lg:hidden">
        {plagas.map((plaga: Plaga) => (
          <div
            key={plaga.id}
            onClick={() => (onView ? onView(plaga) : onEdit(plaga))}
            className="p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Bug className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block wrap-break-words whitespace-normal">
                    {plaga.nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    ID: #{plaga.id}
                  </span>
                </div>
              </div>

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <CrudTableActions
                  screen="plagas"
                  onView={() => (onView ? onView(plaga) : onEdit(plaga))}
                  onEdit={() => onEdit(plaga)}
                  onDelete={() => onDelete(plaga.id)}
                  stopPropagation
                />
              </div>
            </div>

            {plaga.nombre_cientifico && (
              <p className="text-xs text-muted-foreground font-medium italic wrap-break-words">
                Científico: {plaga.nombre_cientifico}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 max-w-full wrap-break-words whitespace-normal">
                <Tag className="size-3 shrink-0" />
                <span className="wrap-break-words">{plaga.t_plagas?.nombre || 'General'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista Escritorio (hidden lg:block) ── */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Plaga</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre Científico</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {plagas.map((plaga: Plaga) => (
              <TableRow
                key={plaga.id}
                className="group hover:bg-primary/5 transition-all duration-300"
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <Bug className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform truncate">{plaga.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{plaga.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-muted-foreground font-medium italic">
                  {plaga.nombre_cientifico || 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {plaga.t_plagas?.nombre || 'General'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <CrudTableActions
                    screen="plagas"
                    onView={() => (onView ? onView(plaga) : onEdit(plaga))}
                    onEdit={() => onEdit(plaga)}
                    onDelete={() => onDelete(plaga.id)}
                    stopPropagation
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
