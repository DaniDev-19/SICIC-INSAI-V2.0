import type { Enfermedad } from '@/types/enfermedades';
import { Stethoscope, Tag, AlertTriangle } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EnfermedadTableProps {
  enfermedades: Enfermedad[];
  onView?: (enfermedad: Enfermedad) => void;
  onEdit: (enfermedad: Enfermedad) => void;
  onDelete: (id: number) => void;
}

export function EnfermedadTable({ enfermedades, onView, onEdit, onDelete }: EnfermedadTableProps) {
  if (enfermedades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center text-muted-foreground">
        <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Stethoscope className="size-8 text-muted-foreground/50" />
        </div>
        <p className="text-foreground font-bold text-base sm:text-lg">No se encontraron enfermedades</p>
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
        {enfermedades.map((enfermedad: Enfermedad) => (
          <div
            key={enfermedad.id}
            onClick={() => (onView ? onView(enfermedad) : onEdit(enfermedad))}
            className="p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-foreground text-sm block break-words whitespace-normal">
                    {enfermedad.nombre}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    ID: #{enfermedad.id}
                  </span>
                </div>
              </div>

              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <CrudTableActions
                  screen="enfermedades"
                  onView={() => (onView ? onView(enfermedad) : onEdit(enfermedad))}
                  onEdit={() => onEdit(enfermedad)}
                  onDelete={() => onDelete(enfermedad.id)}
                  stopPropagation
                />
              </div>
            </div>

            {enfermedad.nombre_cientifico && (
              <p className="text-xs text-muted-foreground font-medium italic break-words">
                Científico: {enfermedad.nombre_cientifico}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20 max-w-full break-words whitespace-normal">
                <Tag className="size-3 shrink-0" />
                <span className="break-words">{enfermedad.t_enfermedades?.nombre || 'General'}</span>
              </div>

              {enfermedad.zoonatica && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 max-w-full break-words whitespace-normal">
                  <AlertTriangle className="size-3 shrink-0" />
                  <span className="break-words">{enfermedad.zoonatica}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista Escritorio (hidden lg:block) ── */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Enfermedad</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre Científico</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Zoonótica</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {enfermedades.map((enfermedad: Enfermedad) => (
              <TableRow key={enfermedad.id} className="group hover:bg-primary/5 transition-all duration-300">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                      <Stethoscope className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform truncate">{enfermedad.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{enfermedad.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-muted-foreground font-medium italic">
                  {enfermedad.nombre_cientifico || 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-5">
                  {enfermedad.zoonatica ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      {enfermedad.zoonatica}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    {enfermedad.t_enfermedades?.nombre || 'General'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <CrudTableActions
                    screen="enfermedades"
                    onView={() => (onView ? onView(enfermedad) : onEdit(enfermedad))}
                    onEdit={() => onEdit(enfermedad)}
                    onDelete={() => onDelete(enfermedad.id)}
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
