import type { Enfermedad } from '@/types/enfermedades';
import { Stethoscope } from 'lucide-react';
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
  onEdit: (enfermedad: Enfermedad) => void;
  onDelete: (id: number) => void;
}

export function EnfermedadTable({ enfermedades, onEdit, onDelete }: EnfermedadTableProps) {
  return (
    <>
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
          {enfermedades.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Stethoscope className="size-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground font-bold not-italic">No se encontraron enfermedades</p>
                    <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            enfermedades.map((enfermedad: Enfermedad) => (
              <TableRow key={enfermedad.id} className="group hover:bg-primary/5 transition-all duration-300">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Stethoscope className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{enfermedad.nombre}</span>
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
                    onEdit={() => onEdit(enfermedad)}
                    onDelete={() => onDelete(enfermedad.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
