import type { Vehiculo } from '@/types/vehiculos';
import { Car, Edit, Trash2, Bike, Truck } from 'lucide-react';
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

interface VehiculoTableProps {
  vehiculos: Vehiculo[];
  onEdit: (vehiculo: Vehiculo) => void;
  onDelete: (id: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

const TIPO_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  MOTO:      { label: 'Moto',      icon: <Bike className="size-4" />,  color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  CARRO:     { label: 'Carro',     icon: <Car className="size-4" />,   color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  CAMIONETA: { label: 'Camioneta', icon: <Truck className="size-4" />, color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  OTRO:      { label: 'Otro',      icon: <Car className="size-4" />,   color: 'bg-muted/60 text-muted-foreground border-border' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPERATIVO:    { label: 'Operativo',    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  MANTENIMIENTO:{ label: 'Mantenimiento',color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  INACTIVO:     { label: 'Inactivo',     color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

export function VehiculoTable({
  vehiculos,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: VehiculoTableProps) {
  const allSelected = vehiculos.length > 0 && selectedIds.length === vehiculos.length;

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
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Vehículo</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Placa</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Color</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estatus</TableHead>
            <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/50">
          {vehiculos.length === 0 ? (
            <TableRow className="hover:bg-transparent border-none">
              <TableCell colSpan={7} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                    <Car className="size-8 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold italic text-foreground">No se encontraron vehículos registrados</p>
                  <p className="text-xs text-muted-foreground">Registra el primer vehículo usando el botón de arriba</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            vehiculos.map((vehiculo) => {
              const tipo = vehiculo.tipo ? TIPO_CONFIG[vehiculo.tipo] : null;
              const status = vehiculo.status ? STATUS_CONFIG[vehiculo.status] : null;
              const isSelected = selectedIds.includes(vehiculo.id);

              return (
                <TableRow 
                  key={vehiculo.id} 
                  className={`group transition-all duration-300 ${isSelected ? 'bg-primary/5' : 'hover:bg-primary/5'}`}
                >
                  <TableCell className="px-4">
                    <Checkbox 
                      checked={isSelected} 
                      onCheckedChange={() => onToggleSelect(vehiculo.id)}
                      className="translate-y-[2px]"
                    />
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
                      {vehiculo.color && (
                        <div
                          className="size-4 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: vehiculo.color.toLowerCase() }}
                        />
                      )}
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => onEdit(vehiculo)}
                        className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        onClick={() => onDelete(vehiculo.id)}
                        className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
