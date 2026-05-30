import React from 'react';
import type { Planificacion } from '@/types/planificaciones';
import { Calendar, User, Users, MapPin, Car, FileText } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PlanificacionTableProps {
  planificaciones: Planificacion[];
  onEdit: (planificacion: Planificacion) => void;
  onDelete: (id: number) => void;
}

const PRIORIDAD_CONFIG: Record<string, { label: string; class: string }> = {
  BAJA: { label: 'Baja', class: 'bg-emerald-500/10 text-emerald-600' },
  MEDIA: { label: 'Media', class: 'bg-blue-500/10 text-blue-600' },
  ALTA: { label: 'Alta', class: 'bg-amber-500/10 text-amber-600' },
  URGENTE: { label: 'Urgente', class: 'bg-rose-500/10 text-rose-600 font-bold' },
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDIENTE: { label: 'Pendiente', class: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  INSPECCIONANDO: { label: 'Inspeccionando', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  FINALIZADA: { label: 'Finalizada', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  NO_APROBADA: { label: 'No Aprobada', class: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  SEGUIMIENTO: { label: 'Seguimiento', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  CUARENTENA: { label: 'Cuarentena', class: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  NO_ATENDIDA: { label: 'No Atendida', class: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
};

export const PlanificacionTable: React.FC<PlanificacionTableProps> = ({
  planificaciones,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Table>
      <TableHeader className="bg-muted/30 border-b">
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Código y Fecha</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Solicitante / Predio</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Actividad / Vehículo</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Equipo Técnico</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Estado / Prioridad</TableHead>
          <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-border/50">
        {planificaciones.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <FileText className="size-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-bold not-italic">No se encontraron planificaciones</p>
                  <p className="text-xs">Intenta ajustar tus criterios de búsqueda o filtros.</p>
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          planificaciones.map((plan) => {
            const prioridad = PRIORIDAD_CONFIG[plan.prioridad] || PRIORIDAD_CONFIG.MEDIA;
            const status = STATUS_CONFIG[plan.status] || STATUS_CONFIG.PENDIENTE;
            const inspectors = plan.planificacion_empleados || [];

            return (
              <TableRow key={plan.id} className="group hover:bg-primary/5 transition-all duration-300">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">
                        {plan.codigo || `PLA-#${plan.id}`}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">
                        <Calendar className="size-3" />
                        {formatDate(plan.fecha_programada)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-primary" />
                      <span className="text-sm font-bold text-foreground truncate max-w-45">
                        {plan.solicitudes?.clientes?.nombre || 'Productor no especificado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium truncate max-w-45">
                        {plan.solicitudes?.propiedades?.nombre || 'Predio rural no especificado'}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary border border-primary/10 whitespace-nowrap">
                      {plan.actividad || 'Visita Técnica'}
                    </div>
                    {plan.vehiculos ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate max-w-45">
                        <Car className="size-3.5 text-muted-foreground" />
                        <span>{(plan.vehiculos.marca || 'Vehículo')} [{plan.vehiculos.placa}]</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Car className="size-3.5 text-muted-foreground" />
                        Sin vehículo asignado
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-50">
                    {inspectors.length > 0 ? (
                      inspectors.map((pe) => (
                        <div
                          key={pe.id}
                          className="inline-flex items-center gap-1 bg-muted/60 text-foreground border border-border/80 px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          <User className="size-3 text-muted-foreground/80 shrink-0" />
                          {pe.empleados?.nombre || 'Inspector'} {pe.empleados?.apellido?.charAt(0) || ''}.
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1 whitespace-nowrap">
                        <Users className="size-3.5" />
                        Sin asignar
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    <div className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border w-fit whitespace-nowrap",
                      status.class || 'bg-muted text-muted-foreground'
                    )}>
                      <span className="size-1.5 rounded-full bg-current" />
                      {status.label}
                    </div>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest w-fit whitespace-nowrap",
                      prioridad.class || 'bg-muted text-muted-foreground'
                    )}>
                      {prioridad.label}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5 text-right">
                  <CrudTableActions
                    screen="planificacion"
                    onEdit={() => onEdit(plan)}
                    onDelete={() => onDelete(plan.id)}
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
