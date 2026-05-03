import type { Cultivo } from '@/types/cultivos';
import { Sprout, Edit, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CultivosTableProps {
  cultivos: Cultivo[];
  onEdit: (cultivo: Cultivo) => void;
  onDelete: (id: number) => void;
}

export function CultivosTable({
  cultivos,
  onEdit,
  onDelete,
}: CultivosTableProps) {
  return (
    <>
      <Table>
        <TableHeader className="bg-muted/30 border-b">
          <TableRow>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Cultivo</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre Científico</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/50">
          {cultivos.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Sprout className="size-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground font-bold not-italic">No se encontraron cultivos</p>
                    <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            cultivos.map((cultivo: Cultivo) => (
              <TableRow
                key={cultivo.id}
                className="group hover:bg-primary/5 transition-all duration-300"
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Sprout className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{cultivo.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{cultivo.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-muted-foreground font-medium italic">
                  {cultivo.nombre_cientifico || 'N/A'}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    {cultivo.tipo_cultivo?.nombre || 'General'}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => onEdit(cultivo)}
                      className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => onDelete(cultivo.id)}
                      className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
