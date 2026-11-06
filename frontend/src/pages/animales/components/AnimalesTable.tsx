import type { Animal } from '@/types/animales';
import { Dog, Tag } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AnimalesTableProps {
  animales: Animal[];
  onView?: (animal: Animal) => void;
  onEdit: (animal: Animal) => void;
  onDelete: (id: number) => void;
}

export function AnimalesTable({
  animales,
  onView,
  onEdit,
  onDelete,
}: AnimalesTableProps) {
  if (animales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Dog className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron animales</p>
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
        {animales.map((animal: Animal) => (
          <div
            key={animal.id}
            onClick={() => (onView ? onView(animal) : onEdit(animal))}
            className="p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Dog className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block wrap-break-words whitespace-normal">
                    {animal.nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    ID: #{animal.id}
                  </span>
                </div>
              </div>

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <CrudTableActions
                  screen="animales"
                  onView={() => (onView ? onView(animal) : onEdit(animal))}
                  onEdit={() => onEdit(animal)}
                  onDelete={() => onDelete(animal.id)}
                  stopPropagation
                />
              </div>
            </div>

            {animal.nombre_cientifico && (
              <p className="text-xs text-muted-foreground font-medium italic wrap-break-words">
                Científico: {animal.nombre_cientifico}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 max-w-full wrap-break-words whitespace-normal">
                <Tag className="size-3 shrink-0" />
                <span className="wrap-break-words">{animal.t_animales?.nombre || 'General'}</span>
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
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Animal</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre Científico</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {animales.map((animal: Animal) => (
              <TableRow
                key={animal.id}
                className="group hover:bg-primary/5 transition-all duration-300"
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <Dog className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform truncate">{animal.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{animal.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-muted-foreground font-medium italic">
                  {animal.nombre_cientifico || 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {animal.t_animales?.nombre || 'General'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <CrudTableActions
                    screen="animales"
                    onView={() => (onView ? onView(animal) : onEdit(animal))}
                    onEdit={() => onEdit(animal)}
                    onDelete={() => onDelete(animal.id)}
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
