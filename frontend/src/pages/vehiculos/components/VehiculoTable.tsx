import type { Vehiculo } from '@/types/vehiculos';
import { Car, Bike, Truck } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface VehiculoTableProps {
  vehiculos: Vehiculo[];
  onView?: (vehiculo: Vehiculo) => void;
  onEdit: (vehiculo: Vehiculo) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  MOTO: { label: 'Moto', icon: <Bike className="size-4" />, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  CARRO: { label: 'Carro', icon: <Car className="size-4" />, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  CAMIONETA: { label: 'Camioneta', icon: <Truck className="size-4" />, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  OTRO: { label: 'Otro', icon: <Car className="size-4" />, color: 'bg-muted/60 text-muted-foreground border-border' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPERATIVO: { label: 'Operativo', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  MANTENIMIENTO: { label: 'Mantenimiento', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  INACTIVO: { label: 'Inactivo', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

export function VehiculoTable({
  vehiculos,
  onView,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: VehiculoTableProps) {
  const { canDelete } = useModulePermissions('vehiculos');
  const allSelected = vehiculos.length > 0 && selectedIds.length === vehiculos.length;

  if (vehiculos.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-background/50 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
            <Car className="size-8 text-muted-foreground/50" />
          </div>
          <p className="font-bold italic text-foreground">No se encontraron vehículos registrados</p>
          <p className="text-xs text-muted-foreground">Registra el primer vehículo usando el botón de arriba</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {vehiculos.map((vehiculo) => {
          const tipo = vehiculo.tipo ? TIPO_CONFIG[vehiculo.tipo] : null;
          const status = vehiculo.status ? STATUS_CONFIG[vehiculo.status] : null;
          const isSelected = selectedIds.includes(vehiculo.id);

          return (
            <article
              key={vehiculo.id}
              className={`rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 min-w-0 max-w-full overflow-hidden transition-all ${isSelected ? 'bg-primary/5 border-primary/40' : ''
                }`}
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {canDelete && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(vehiculo.id)}
                      className="mt-1 shrink-0"
                    />
                  )}
                  <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    {tipo?.icon ?? <Car className="size-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm sm:text-base truncate">
                      {vehiculo.marca || 'Vehículo'} {vehiculo.modelo || ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-muted/60 border border-border tracking-wider">
                        {vehiculo.placa}
                      </span>
                      {vehiculo.color && (
                        <span className="text-xs text-muted-foreground truncate">
                          • {vehiculo.color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {status ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${status.color}`}>
                      {status.label}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">{vehiculo.status || '—'}</span>
                  )}
                  {tipo && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border ${tipo.color}`}>
                      {tipo.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                <CrudTableActions
                  screen="vehiculos"
                  onView={() => (onView ? onView(vehiculo) : onEdit(vehiculo))}
                  onEdit={() => onEdit(vehiculo)}
                  onDelete={() => onDelete(vehiculo.id)}
                />
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Vista Escritorio (>= lg): Tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="w-12 px-4">
                {canDelete && (
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleSelectAll}
                    className="translate-y-0.5"
                  />
                )}
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Vehículo</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Placa</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Color</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estatus</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {vehiculos.map((vehiculo) => {
              const tipo = vehiculo.tipo ? TIPO_CONFIG[vehiculo.tipo] : null;
              const status = vehiculo.status ? STATUS_CONFIG[vehiculo.status] : null;
              const isSelected = selectedIds.includes(vehiculo.id);

              return (
                <TableRow
                  key={vehiculo.id}
                  className={`group transition-all duration-300 ${isSelected ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                >
                  <TableCell className="px-4">
                    {canDelete && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(vehiculo.id)}
                        className="translate-y-0.5"
                      />
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        {tipo?.icon ?? <Car className="size-5" />}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                          {vehiculo.marca || '—'} {vehiculo.modelo || ''}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                          ID #{vehiculo.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <span className="font-black text-sm tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border font-mono">
                      {vehiculo.placa}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    {tipo ? (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black border ${tipo.color}`}>
                        {tipo.icon}
                        {tipo.label}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground font-medium">
                        {vehiculo.color || '—'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    {status ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border ${status.color}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{vehiculo.status || '—'}</span>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <CrudTableActions
                      screen="vehiculos"
                      onView={() => (onView ? onView(vehiculo) : onEdit(vehiculo))}
                      onEdit={() => onEdit(vehiculo)}
                      onDelete={() => onDelete(vehiculo.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
