import React, { useState } from 'react';
import type { Propiedad } from '@/types/propiedades';
import { Home, MapPin, User, Scale, ChevronDown } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { PropiedadInventario } from './PropiedadInventario';

interface PropertyTableProps {
  propiedades: Propiedad[];
  onView?: (propiedad: Propiedad) => void;
  onEdit: (propiedad: Propiedad) => void;
  onDelete: (id: number) => void;
}

function getLocationText(propiedad: Propiedad) {
  const sec = propiedad.propiedad_ubicacion?.[0]?.sectores;
  if (!sec) return 'Sin sector asignado';
  const est = sec.parroquias?.municipios?.estados?.nombre;
  const mun = sec.parroquias?.municipios?.nombre;
  const par = sec.parroquias?.nombre;
  const name = sec.nombre;
  const parts = [est, mun, par, name].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Sin sector asignado';
}

function getStatusBadge(status?: string | null) {
  const s = status || 'ACTIVA';
  const isActiva = s === 'ACTIVA';
  const isProcess = s.includes('PROCESO') || s.includes('SOLICITUD');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border',
        isActiva
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : isProcess
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {s.replace(/_/g, ' ')}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <Home className="size-8 text-muted-foreground/50" />
      </div>
      <p className="text-foreground font-bold italic text-sm sm:text-base">No se encontraron propiedades registradas</p>
    </div>
  );
}

export function PropertyTable({ propiedades, onView, onEdit, onDelete }: PropertyTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (propiedades.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* ── Mobile / Tablet (< lg): tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {propiedades.map((propiedad) => {
          const isExpanded = expandedId === propiedad.id;
          const locText = getLocationText(propiedad);

          return (
            <article
              key={propiedad.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 overflow-hidden min-w-0 max-w-full"
            >
              {/* Header: Icono + Nombre + Badges + Estatus */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                    <Home className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm sm:text-base truncate">{propiedad.nombre}</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold mt-0.5">
                      <span className="text-primary font-bold">
                        INSAI: {propiedad.codigo_insai || 'PENDIENTE'}
                      </span>
                      {propiedad.rif && (
                        <span className="bg-muted px-1.5 py-0.5 rounded border border-border text-foreground">
                          {propiedad.rif}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  {getStatusBadge(propiedad.status)}
                  <span className="text-[10px] font-black uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60 border border-border">
                    {propiedad.t_propiedad?.nombre || 'General'}
                  </span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                {/* Dueño */}
                <div className="flex items-center gap-2 min-w-0">
                  <User className="size-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-foreground truncate">
                    {propiedad.clientes?.nombre || 'Sin productor'}
                  </span>
                  {propiedad.clientes?.cedula_rif && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({propiedad.clientes.cedula_rif})
                    </span>
                  )}
                </div>

                {/* Superficie */}
                <div className="flex items-center gap-2 min-w-0">
                  <Scale className="size-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {propiedad.hectareas_totales || 0} Hectáreas
                  </span>
                </div>

                {/* Ubicación */}
                <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="truncate">{locText}</span>
                </div>

                {propiedad.punto_referencia && (
                  <div className="text-[11px] italic text-muted-foreground pl-5 sm:col-span-2 line-clamp-1">
                    Ref: {propiedad.punto_referencia}
                  </div>
                )}
              </div>

              {/* Footer con acciones e inventario */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(propiedad.id)}
                  className="text-xs font-bold text-muted-foreground hover:text-primary rounded-xl h-8 px-2.5 cursor-pointer"
                >
                  <span>Inventario</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 ml-1 transition-transform duration-200',
                      isExpanded && 'rotate-180 text-primary'
                    )}
                  />
                </Button>

                <CrudTableActions
                  screen="propiedades"
                  onView={() => onView?.(propiedad)}
                  onEdit={() => onEdit(propiedad)}
                  onDelete={() => onDelete(propiedad.id)}
                />
              </div>

              {/* Inventario expandible móvil */}
              {isExpanded && (
                <div className="pt-3 border-t border-border/40 animate-in fade-in duration-200 overflow-hidden min-w-0 max-w-full">
                  <PropiedadInventario propiedadId={propiedad.id} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* ── Desktop (>= lg): tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Nombre y Código
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Productor / Dueño
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Ubicación / Referencia
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Superficie / Tipo
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {propiedades.map((propiedad) => (
              <React.Fragment key={propiedad.id}>
                <TableRow
                  onClick={() => toggleExpand(propiedad.id)}
                  className={cn(
                    'group hover:bg-primary/5 transition-all duration-300 cursor-pointer',
                    expandedId === propiedad.id ? 'bg-primary/5 border-b-0' : ''
                  )}
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Home className="size-5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                          {propiedad.nombre}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                          <span className="text-primary font-bold">
                            INSAI: {propiedad.codigo_insai || 'PENDIENTE'}
                          </span>
                          {propiedad.rif && (
                            <span className="bg-muted/50 px-1 py-0.5 rounded border">{propiedad.rif}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                        <User className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{propiedad.clientes?.nombre}</p>
                        <p className="text-[10px] text-muted-foreground">{propiedad.clientes?.cedula_rif}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="line-clamp-2">{getLocationText(propiedad)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic line-clamp-2 pl-5">
                        Ref: {propiedad.punto_referencia || 'N/A'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Scale className="size-3.5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {propiedad.hectareas_totales || 0} Ha
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border w-fit">
                          {propiedad.t_propiedad?.nombre || 'General'}
                        </div>
                        {getStatusBadge(propiedad.status)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <CrudTableActions
                        screen="propiedades"
                        onView={() => onView?.(propiedad)}
                        onEdit={() => onEdit(propiedad)}
                        onDelete={() => onDelete(propiedad.id)}
                        stopPropagation
                      />
                      <div
                        className={cn(
                          'ml-2 size-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-300',
                          expandedId === propiedad.id ? 'rotate-180 bg-primary/20 text-primary' : ''
                        )}
                      >
                        <ChevronDown className="size-4" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Contenedor Expandible: Inventario */}
                {expandedId === propiedad.id && (
                  <TableRow className="bg-muted/5 hover:bg-muted/5 border-t-0">
                    <TableCell colSpan={5} className="p-0">
                      <PropiedadInventario propiedadId={propiedad.id} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
