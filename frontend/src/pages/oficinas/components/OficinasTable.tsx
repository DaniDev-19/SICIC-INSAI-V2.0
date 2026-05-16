import type { Oficina } from '@/types/oficinas';
import { Building2, Edit, Trash2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface OficinasTableProps {
  oficinas: Oficina[];
  onEdit: (oficina: Oficina) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

export function OficinasTable({
  oficinas,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: OficinasTableProps) {
  const allSelected = oficinas.length > 0 && selectedIds.length === oficinas.length;

  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30 border-b">
          <TableRow>
            <TableHead className="w-12 px-4">
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={onToggleSelectAll}
                className="translate-y-[2px]"
              />
            </TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Oficina / Sede</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Ubicación</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-center">C. Validación</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/50">
          {oficinas.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Building2 className="size-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground font-bold not-italic">No se encontraron oficinas</p>
                    <p className="text-xs">Intenta ajustar tus criterios de búsqueda.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            oficinas.map((oficina) => (
              <TableRow
                key={oficina.id}
                className={`group transition-all duration-300 ${selectedIds.includes(oficina.id) ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
              >
                <TableCell className="px-4">
                  <Checkbox 
                    checked={selectedIds.includes(oficina.id)} 
                    onCheckedChange={() => onToggleSelect(oficina.id)}
                    className="translate-y-[2px]"
                  />
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{oficina.nombre}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">ID: #{oficina.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                      <MapPin className="size-3 text-muted-foreground" />
                      <span className="line-clamp-1 max-w-[250px]">{oficina.direccion || 'Sin dirección'}</span>
                    </div>
                    {oficina.ubicacion_gms && (
                      <span className="text-[10px] text-muted-foreground ml-4.5 font-mono">{oficina.ubicacion_gms}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-center">
                  <div className="flex justify-center">
                    {oficina.es_centro_validacion ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                        <CheckCircle2 className="size-3" />
                        Sí
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-muted/30 text-muted-foreground border border-border">
                        <XCircle className="size-3" />
                        No
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => onEdit(oficina)}
                      className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Eliminar"
                      onClick={() => onDelete(oficina.id)}
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
    </div>
  );
}
