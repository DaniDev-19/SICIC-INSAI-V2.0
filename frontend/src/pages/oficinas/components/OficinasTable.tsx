import type { Oficina } from '@/types/oficinas';
import { Building2, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
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
  onView: (oficina: Oficina) => void;
  onEdit: (oficina: Oficina) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

export function OficinasTable({
  oficinas,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: OficinasTableProps) {
  const allSelected = oficinas.length > 0 && selectedIds.length === oficinas.length;

  if (oficinas.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-background/50 p-8 text-center text-muted-foreground font-medium italic">
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
            <Building2 className="size-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="text-foreground font-bold not-italic">No se encontraron oficinas</p>
            <p className="text-xs">Intenta ajustar tus criterios de búsqueda.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {oficinas.map((oficina) => (
          <article
            key={oficina.id}
            className={`rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 min-w-0 max-w-full overflow-hidden transition-all ${
              selectedIds.includes(oficina.id) ? 'bg-primary/5 border-primary/40' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Checkbox
                  checked={selectedIds.includes(oficina.id)}
                  onCheckedChange={() => onToggleSelect(oficina.id)}
                  className="mt-1 shrink-0"
                />
                <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm sm:text-base truncate">
                    {oficina.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                    ID: #{oficina.id}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {oficina.es_centro_validacion ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="size-3" />
                    Validación
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted/40 text-muted-foreground border border-border">
                    <XCircle className="size-3" />
                    Sede
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground pt-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{oficina.direccion || 'Sin dirección registrada'}</span>
              </div>
              {oficina.ubicacion_gms && (
                <div className="text-[10px] text-muted-foreground ml-5 font-mono truncate">
                  {oficina.ubicacion_gms}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
              <CrudTableActions
                screen="oficinas"
                onView={() => onView(oficina)}
                onEdit={() => onEdit(oficina)}
                onDelete={() => onDelete(oficina.id)}
              />
            </div>
          </article>
        ))}
      </div>

      {/* ── Vista Escritorio (>= lg): Tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="w-12 px-4">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={onToggleSelectAll}
                  className="translate-y-0.5"
                />
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Oficina / Sede</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Ubicación</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-center">C. Validación</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {oficinas.map((oficina) => (
              <TableRow
                key={oficina.id}
                className={`group transition-all duration-300 ${selectedIds.includes(oficina.id) ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
              >
                <TableCell className="px-4">
                  <Checkbox 
                    checked={selectedIds.includes(oficina.id)} 
                    onCheckedChange={() => onToggleSelect(oficina.id)}
                    className="translate-y-0.5"
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
                      <span className="line-clamp-1 max-w-62.5">{oficina.direccion || 'Sin dirección'}</span>
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
                    <CrudTableActions
                      screen="oficinas"
                      onView={() => onView(oficina)}
                      onEdit={() => onEdit(oficina)}
                      onDelete={() => onDelete(oficina.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
