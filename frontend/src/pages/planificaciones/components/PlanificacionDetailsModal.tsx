import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePlanificacion } from '@/hooks/use-planificaciones';
import {
  Calendar,
  Clock,
  User,
  Car,
  MapPin,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  Building,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanificacionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number | null;
  onEdit?: () => void;
}

export const PlanificacionDetailsModal: React.FC<PlanificacionDetailsModalProps> = ({
  isOpen,
  onClose,
  planId,
  onEdit,
}) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canCreateInspeccion = hasPermission('inspecciones', 'create');
  const canUpdatePlan = hasPermission('planificacion', 'update');
  const { planificacion, isLoading, error } = usePlanificacion(planId);

  const formatTime = (isoTimeStr: string | null) => {
    if (!isoTimeStr) return 'No especificada';
    try {
      let t = isoTimeStr;
      if (isoTimeStr.includes('T')) {
        t = isoTimeStr.split('T')[1];
      }
      const [hoursStr, minutesStr] = t.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (isNaN(hours) || isNaN(minutes)) return isoTimeStr;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (isoDateStr: string) => {
    if (!isoDateStr) return '';
    try {
      const d = new Date(isoDateStr);
      return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    } catch {
      return 'N/A';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'URGENTE':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'ALTA':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'MEDIA':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'FINALIZADA':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'INSPECCIONANDO':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'SEGUIMIENTO':
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'CUARENTENA':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'NO_APROBADA':
      case 'NO_ATENDIDA':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50  top-0  backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                <ClipboardList className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-wide">
                  Ficha de Planificación
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Detalles técnicos de la inspección o visita programada en agenda.
                </DialogDescription>
              </div>
            </div>

            {planificacion && (
              <span className="text-xs font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                {planificacion.codigo}
              </span>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="size-10 text-indigo-500 animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Obteniendo información del servidor...</p>
          </div>
        ) : error || !planificacion ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-8">
            <AlertCircle className="size-12 text-rose-500" />
            <h3 className="text-lg font-bold text-foreground">Error al cargar datos</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              No se pudo obtener la información por ID de la planificación. Intente de nuevo o verifique la conexión.
            </p>
            <Button onClick={onClose} variant="ghost" className="mt-2">Cerrar</Button>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="space-y-2 bg-indigo-500/2 border border-indigo-500/10 p-5 rounded-2xl">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Actividad Principal</span>
              <h2 className="text-xl font-bold text-foreground">{planificacion.actividad}</h2>
              {planificacion.objetivo && (
                <p className="text-sm text-muted-foreground mt-2 border-t border-border/40 pt-2">{planificacion.objetivo}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/40">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Clock className="size-4 text-primary" /> Estatus e Intervalo
                </h3>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Prioridad</span>
                    <span className={cn("inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg mt-1 uppercase", getPriorityBadgeClass(planificacion.prioridad))}>
                      {planificacion.prioridad}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Estatus</span>
                    <span className={cn("inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg mt-1 uppercase", getStatusBadgeClass(planificacion.status))}>
                      {planificacion.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Fecha Programada</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-1">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {formatDate(planificacion.fecha_programada)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Hora Inicio</span>
                      <span className="text-xs font-semibold text-foreground mt-1 block">{formatTime(planificacion.hora_inicio)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Hora Estimada Fin</span>
                      <span className="text-xs font-semibold text-foreground mt-1 block">{formatTime(planificacion.hora_fin)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/40">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <FileText className="size-4 text-indigo-400" /> Solicitud Relacionada
                </h3>
                {planificacion.solicitudes ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Código & Trámite</span>
                      <span className="text-xs font-bold text-foreground mt-0.5 block">
                        {planificacion.solicitudes.codigo} - <span className="text-indigo-400 font-extrabold">{(planificacion.solicitudes as any).t_solicitud?.nombre || 'Visita General'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Productor / Solicitante</span>
                      <span className="text-xs font-medium text-foreground mt-0.5 block">
                        {(planificacion.solicitudes.clientes as any)?.nombre || 'No especificado'} ({(planificacion.solicitudes.clientes as any)?.cedula_rif || 'N/A'})
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Predio / Propiedad</span>
                      <span className="text-xs font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Building className="size-3.5 text-muted-foreground" />
                        {planificacion.solicitudes.propiedades?.nombre || 'No especificada'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic pt-4">No hay información de solicitud enlazada</p>
                )}
              </div>
            </div>

            <div className="bg-muted/20 p-5 rounded-2xl border border-border/40 space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Car className="size-4 text-emerald-400" /> Logística y Aseguramiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Vehículo Asignado</span>
                  <span className="text-xs font-bold text-foreground mt-1  flex items-center gap-1.5">
                    <Car className="size-3.5 text-muted-foreground" />
                    {planificacion.vehiculos
                      ? `${planificacion.vehiculos.marca} ${planificacion.vehiculos.modelo} [${planificacion.vehiculos.placa}]`
                      : 'Sin vehículo asignado (Traslado independiente)'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Punto de Encuentro</span>
                  <span className="text-xs font-semibold text-foreground mt-1  flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {planificacion.punto_encuentro || 'No definido'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/30">
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Ubicación / Coordenadas</span>
                  <span className="text-xs font-medium text-foreground mt-1 block">
                    {planificacion.ubicacion || 'En el predio asignado'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Aseguramiento Requerido</span>
                  <span className="text-xs font-medium text-foreground mt-1  flex items-center gap-1.5">
                    <Shield className="size-3.5 text-muted-foreground" />
                    {planificacion.aseguramiento || 'Ninguno especificado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 p-5 rounded-2xl border border-border/40 space-y-4">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <User className="size-4 text-indigo-400" /> Inspectores y Técnicos Asignados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {planificacion.planificacion_empleados && planificacion.planificacion_empleados.length > 0 ? (
                  planificacion.planificacion_empleados.map((pe, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-background/80 p-3 rounded-xl border border-border/40">
                      <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {pe.empleados?.nombre?.substring(0, 2).toUpperCase() || 'IN'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{pe.empleados?.nombre}</span>
                        <span className="text-[9px] text-muted-foreground uppercase font-black block tracking-wider">
                          {(pe.empleados as any)?.cargo || 'Inspector Técnico'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic col-span-2">No se han asignado inspectores a esta planificación.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 flex-wrap">
              <Button onClick={onClose} variant="ghost" className="font-bold cursor-pointer">
                Cerrar Ficha
              </Button>
              {canCreateInspeccion && planificacion && (
                <Button
                  variant="outline"
                  className="font-bold cursor-pointer"
                  onClick={() => {
                    onClose();
                    navigate(`/home/inspecciones?planificacion_id=${planificacion.id}&openModal=true`);
                  }}
                >
                  Registrar Inspección
                </Button>
              )}
              {canUpdatePlan && onEdit && (
                <Button
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  variant="primary"
                  className="font-bold cursor-pointer text-white"
                >
                  Editar Planificación
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
