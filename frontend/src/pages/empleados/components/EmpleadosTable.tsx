import type { Empleado } from '@/types/empleados';
import { User, Mail, Phone, BadgeCheck, Building2, Briefcase, FileText, Loader2 } from 'lucide-react';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { resolveMediaUrl } from '@/lib/media-url';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onEdit: (empleado: Empleado) => void;
  onDelete: (id: number) => void;
  onPdf?: (id: number) => void;
  pdfLoadingId?: number | null;
  onSelect?: (empleado: Empleado) => void;
  selectedId?: number | null;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <User className="size-8 text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground font-bold text-sm sm:text-base">No se encontraron empleados</p>
        <p className="text-xs text-muted-foreground">Intenta ajustar tus criterios de búsqueda o filtros.</p>
      </div>
    </div>
  );
}

function getStatusBadge(status?: string | null) {
  const isActivo = status === 'ACTIVO';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border',
        isActivo
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      )}
    >
      <BadgeCheck className={cn('size-3', isActivo ? 'text-emerald-500' : 'text-rose-500')} />
      <span>{status || 'N/A'}</span>
    </div>
  );
}

export function EmpleadosTable({
  empleados,
  onEdit,
  onDelete,
  onPdf,
  pdfLoadingId = null,
  onSelect,
  selectedId,
  selectedIds = [],
  onSelectionChange,
}: EmpleadosTableProps) {
  const { canDelete } = useModulePermissions('empleados');
  const allSelected = empleados.length > 0 && selectedIds.length === empleados.length;

  const toggleAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : empleados.map((e) => e.id));
  };

  const toggleOne = (id: number) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  };

  if (empleados.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* ── Mobile / Tablet (< lg): tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {canDelete && empleados.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/50 text-xs text-muted-foreground mb-1">
            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span>Seleccionar todos ({selectedIds.length}/{empleados.length})</span>
            </label>
          </div>
        )}

        {empleados.map((empleado: Empleado) => {
          const isSelected = selectedIds.includes(empleado.id);
          const isDetailsActive = selectedId === empleado.id;

          return (
            <article
              key={empleado.id}
              onClick={() => onSelect?.(empleado)}
              className={cn(
                'rounded-2xl border bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 transition-all cursor-pointer',
                isSelected
                  ? 'bg-primary/5 border-primary/40'
                  : isDetailsActive
                  ? 'border-primary shadow-md ring-1 ring-primary/20'
                  : 'border-border/60 hover:border-border'
              )}
            >
              {/* Header: Checkbox + Avatar + Nombre + Estatus */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {canDelete && (
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(empleado.id)}
                      />
                    </div>
                  )}

                  <div className="relative shrink-0">
                    {empleado.empleado_foto && empleado.empleado_foto.length > 0 ? (
                      <img
                        src={resolveMediaUrl(empleado.empleado_foto[0].foto_url)}
                        alt={empleado.nombre}
                        className="size-11 rounded-xl object-cover border-2 border-primary/20 shadow-xs"
                      />
                    ) : (
                      <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <User className="size-5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-background',
                        empleado.status_laboral === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm sm:text-base truncate">
                      {empleado.nombre} {empleado.apellido}
                    </p>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      C.I: {empleado.cedula}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(empleado.status_laboral)}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="size-3.5 text-blue-500/80 shrink-0" />
                  <span className="font-semibold text-foreground/80 truncate">
                    {empleado.departamentos?.nombre || 'Sin departamento'}
                  </span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="size-3.5 text-amber-500/80 shrink-0" />
                  <span className="truncate">{empleado.cargos?.nombre || 'Sin cargo'}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="size-3.5 text-primary/70 shrink-0" />
                  <span className="truncate">{empleado.email || 'Sin correo'}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="size-3.5 text-primary/70 shrink-0" />
                  <span className="truncate">{empleado.telefono || 'Sin teléfono'}</span>
                </div>
              </div>

              {/* Footer con acciones */}
              <div
                className="flex items-center justify-end pt-2 border-t border-border/40 gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {onPdf && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Generar Ficha PDF"
                    disabled={pdfLoadingId === empleado.id}
                    onClick={() => onPdf(empleado.id)}
                    className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer disabled:opacity-60"
                  >
                    {pdfLoadingId === empleado.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                  </Button>
                )}

                <CrudTableActions
                  screen="empleados"
                  onEdit={() => onEdit(empleado)}
                  onDelete={() => onDelete(empleado.id)}
                  stopPropagation
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Desktop (>= lg): tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="w-12 px-4">
                {canDelete && (
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="translate-y-[2px]" />
                )}
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Empleado
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Contacto
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Departamento / Cargo
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Estatus
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {empleados.map((empleado: Empleado) => (
              <TableRow
                key={empleado.id}
                onClick={() => onSelect?.(empleado)}
                className={`group transition-all duration-300 cursor-pointer ${
                  selectedIds.includes(empleado.id)
                    ? 'bg-primary/5'
                    : selectedId === empleado.id
                    ? 'bg-primary/10 border-l-4 border-l-primary'
                    : 'hover:bg-primary/5'
                }`}
              >
                <TableCell className="px-4">
                  {canDelete && (
                    <Checkbox
                      checked={selectedIds.includes(empleado.id)}
                      onCheckedChange={() => toggleOne(empleado.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="translate-y-[2px]"
                    />
                  )}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {empleado.empleado_foto && empleado.empleado_foto.length > 0 ? (
                        <img
                          src={resolveMediaUrl(empleado.empleado_foto[0].foto_url)}
                          alt={empleado.nombre}
                          className="size-12 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
                        />
                      ) : (
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <User className="size-6" />
                        </div>
                      )}
                      <div
                        className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background ${
                          empleado.status_laboral === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                        {empleado.nombre} {empleado.apellido}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        C.I: {empleado.cedula}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Mail className="size-3 text-primary/60" />
                      {empleado.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Phone className="size-3 text-primary/60" />
                      {empleado.telefono || 'N/A'}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                      <Building2 className="size-3.5 text-blue-500/70" />
                      {empleado.departamentos?.nombre || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Briefcase className="size-3.5 text-amber-500/70" />
                      {empleado.cargos?.nombre || 'N/A'}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  {getStatusBadge(empleado.status_laboral)}
                </TableCell>

                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onPdf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Generar Ficha PDF"
                        disabled={pdfLoadingId === empleado.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPdf(empleado.id);
                        }}
                        className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer disabled:opacity-60"
                      >
                        {pdfLoadingId === empleado.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                      </Button>
                    )}
                    <CrudTableActions
                      screen="empleados"
                      onEdit={() => onEdit(empleado)}
                      onDelete={() => onDelete(empleado.id)}
                      stopPropagation
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
