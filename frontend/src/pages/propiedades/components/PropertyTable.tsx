import React, { useState } from 'react';
import type { Propiedad } from '@/types/propiedades';
import { Home, Edit, Trash2, MapPin, User, Scale, ChevronDown } from 'lucide-react';
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
  onEdit: (propiedad: Propiedad) => void;
  onDelete: (id: number) => void;
}

export function PropertyTable({ propiedades, onEdit, onDelete }: PropertyTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <Table>
      <TableHeader className="bg-muted/30 border-b">
        <TableRow>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Nombre y Código</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Productor / Dueño</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Ubicación / Referencia</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Superficie / Tipo</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/50">
        {propiedades.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={5} className="px-6 py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <Home className="size-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-bold italic">No se encontraron propiedades registradas</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          propiedades.map((propiedad) => (
            <React.Fragment key={propiedad.id}>
              <TableRow
                onClick={() => toggleExpand(propiedad.id)}
                className={cn(
                  "group hover:bg-primary/5 transition-all duration-300 cursor-pointer",
                  expandedId === propiedad.id ? "bg-primary/5 border-b-0" : ""
                )}
              >
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Home className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{propiedad.nombre}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                        <span className="text-primary font-bold">INSAI: {propiedad.codigo_insai || 'PENDIENTE'}</span>
                        {propiedad.rif && <span className="bg-muted/50 px-1 py-0.5 rounded border">{propiedad.rif}</span>}
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
                      <MapPin className="size-3.5 text-primary" />
                      {propiedad.propiedad_ubicacion?.[0]?.sectores?.nombre || 'Sin sector asignado'}
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
                      <span className="text-xs font-bold text-emerald-700">{propiedad.hectareas_totales || 0} Ha</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border w-fit">
                        {propiedad.t_propiedad?.nombre || 'General'}
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border w-fit",
                        propiedad.status === 'ACTIVA' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                        propiedad.status?.includes('PROCESO') || propiedad.status?.includes('SOLICITUD') ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      )}>
                        {propiedad.status?.replace(/_/g, ' ') || 'ACTIVA'}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onEdit(propiedad); }}
                      className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onDelete(propiedad.id); }}
                      className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                    <div className={cn(
                      "ml-2 size-8 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-300",
                      expandedId === propiedad.id ? "rotate-180 bg-primary/20 text-primary" : ""
                    )}>
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
          ))

        )}
      </TableBody>
    </Table>
  );
}
