import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePlanificaciones } from '@/hooks/use-planificaciones';
import { useSolicitudes } from '@/hooks/use-solicitudes';
import { useVehiculos } from '@/hooks/use-vehiculos';
import { useEmpleados } from '@/hooks/use-empleados';
import type { Planificacion } from '@/types/planificaciones';
import { Calendar, Users, Clock, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const planificacionSchema = z.object({
  solicitud_id: z.string().min(1, 'La solicitud asociada es requerida'),
  fecha_programada: z.string().min(1, 'La fecha programada es requerida'),
  hora_inicio: z.string().optional().or(z.literal('')),
  hora_fin: z.string().optional().or(z.literal('')),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).default('MEDIA'),
  actividad: z.string().min(3, 'La actividad debe tener al menos 3 caracteres'),
  objetivo: z.string().optional().or(z.literal('')),
  convocatoria: z.string().optional().or(z.literal('')),
  punto_encuentro: z.string().optional().or(z.literal('')),
  ubicacion: z.string().optional().or(z.literal('')),
  aseguramiento: z.string().optional().or(z.literal('')),
  vehiculo_id: z.string().optional().or(z.literal('')),
  status: z.enum([
    'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
    'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
  ]).default('PENDIENTE'),
  empleados: z.array(z.number()).min(1, 'Debe asignar al menos un técnico/inspector'),
});

type FormValues = z.infer<typeof planificacionSchema>;

interface PlanificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planificacion?: Planificacion | null;
  initialDate?: string;
}

export const PlanificacionModal: React.FC<PlanificacionModalProps> = ({
  isOpen,
  onClose,
  planificacion,
  initialDate,
}) => {
  const { createPlanificacion, updatePlanificacion, isCreating, isUpdating } = usePlanificaciones();

  const { solicitudes } = useSolicitudes('', 100);
  const { vehiculos } = useVehiculos();
  const { empleados, setLimit: setEmpleadosLimit } = useEmpleados();

  useEffect(() => {
    if (isOpen) {
      setEmpleadosLimit(100);
    }
  }, [isOpen, setEmpleadosLimit]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(planificacionSchema) as any,
    defaultValues: {
      solicitud_id: '',
      fecha_programada: initialDate || '',
      hora_inicio: '',
      hora_fin: '',
      prioridad: 'MEDIA',
      actividad: '',
      objetivo: '',
      convocatoria: '',
      punto_encuentro: '',
      ubicacion: '',
      aseguramiento: '',
      vehiculo_id: 'none',
      status: 'PENDIENTE',
      empleados: [],
    },
  });

  const selectedSolicitud = watch('solicitud_id');
  const selectedVehiculo = watch('vehiculo_id');
  const selectedPrioridad = watch('prioridad');
  const selectedStatus = watch('status');
  const selectedEmpleados = watch('empleados') || [];

  useEffect(() => {
    if (planificacion && isOpen) {

      const parseTime = (isoStr: string | null) => {
        if (!isoStr) return '';
        try {
          let t = isoStr;
          if (isoStr.includes('T')) {
            t = isoStr.split('T')[1];
          }
          const [hoursStr, minutesStr] = t.split(':');
          return `${hoursStr.padStart(2, '0')}:${minutesStr.padStart(2, '0')}`;
        } catch {
          return '';
        }
      };

      const parseDate = (isoStr: string) => {
        try {
          return isoStr.substring(0, 10);
        } catch {
          return '';
        }
      };

      reset({
        solicitud_id: planificacion.solicitud_id.toString(),
        fecha_programada: parseDate(planificacion.fecha_programada),
        hora_inicio: parseTime(planificacion.hora_inicio),
        hora_fin: parseTime(planificacion.hora_fin),
        prioridad: planificacion.prioridad,
        actividad: planificacion.actividad || '',
        objetivo: planificacion.objetivo || '',
        convocatoria: planificacion.convocatoria || '',
        punto_encuentro: planificacion.punto_encuentro || '',
        ubicacion: planificacion.ubicacion || '',
        aseguramiento: planificacion.aseguramiento || '',
        vehiculo_id: planificacion.vehiculo_id ? planificacion.vehiculo_id.toString() : 'none',
        status: planificacion.status,
        empleados: planificacion.planificacion_empleados?.map(pe => pe.empleado_id) || [],
      });
    } else if (!planificacion && isOpen) {
      reset({
        solicitud_id: '',
        fecha_programada: initialDate || '',
        hora_inicio: '',
        hora_fin: '',
        prioridad: 'MEDIA',
        actividad: '',
        objetivo: '',
        convocatoria: '',
        punto_encuentro: '',
        ubicacion: '',
        aseguramiento: '',
        vehiculo_id: 'none',
        status: 'PENDIENTE',
        empleados: [],
      });
    }
  }, [planificacion, reset, isOpen, initialDate]);

  const onFormSubmit = async (values: FormValues) => {
    const formattedValues = {
      solicitud_id: parseInt(values.solicitud_id),
      fecha_programada: values.fecha_programada,
      hora_inicio: values.hora_inicio || null,
      hora_fin: values.hora_fin || null,
      prioridad: values.prioridad,
      actividad: values.actividad,
      objetivo: values.objetivo || null,
      convocatoria: values.convocatoria || null,
      punto_encuentro: values.punto_encuentro || null,
      ubicacion: values.ubicacion || null,
      aseguramiento: values.aseguramiento || null,
      vehiculo_id: (values.vehiculo_id && values.vehiculo_id !== 'none') ? parseInt(values.vehiculo_id) : null,
      status: values.status,
      empleados: values.empleados,
    };

    try {
      if (planificacion) {
        await updatePlanificacion({ id: planificacion.id, data: formattedValues });
      } else {
        await createPlanificacion(formattedValues);
      }
      onClose();
    } catch {
    }
  };

  const toggleEmpleado = (empId: number) => {
    const current = [...selectedEmpleados];
    const index = current.indexOf(empId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(empId);
    }
    setValue('empleados', current, { shouldValidate: true });
  };

  const filteredSolicitudes = solicitudes.filter(sol => {
    if (planificacion) {
      return sol.estatus === 'CREADA' || sol.id === planificacion.solicitud_id;
    }
    return sol.estatus === 'CREADA';
  });

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Calendar className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {planificacion ? 'Editar Planificación' : 'Agendar Visita de Campo'}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Complete el formulario de la agenda técnica e inspectores.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Solicitud de Inspección <span className="text-rose-500">*</span></label>
              <Select
                onValueChange={(val) => setValue('solicitud_id', val, { shouldValidate: true })}
                value={selectedSolicitud}
                disabled={!!planificacion} // Cannot reassign to another solicitud
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                  <SelectValue placeholder="Seleccione solicitud..." />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border max-h-50" position="popper">
                  {filteredSolicitudes.map(sol => (
                    <SelectItem key={sol.id} value={sol.id.toString()} className="cursor-pointer">
                      {sol.codigo} - {sol.clientes?.nombre || 'Productor'} ({sol.propiedades?.nombre || 'Predio'})
                    </SelectItem>
                  ))}
                  {filteredSolicitudes.length === 0 && (
                    <div className="p-3 text-center text-xs text-muted-foreground font-medium">No hay solicitudes pendientes ('CREADAS') disponibles</div>
                  )}
                </SelectContent>
              </Select>
              {errors.solicitud_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.solicitud_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Estatus de Agenda</label>
              <Select
                onValueChange={(val: any) => setValue('status', val)}
                value={selectedStatus}
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border" position="popper">
                  <SelectItem value="PENDIENTE" className="cursor-pointer">Pendiente / Por Iniciar</SelectItem>
                  <SelectItem value="INSPECCIONANDO" className="cursor-pointer font-bold text-blue-500">Inspeccionando</SelectItem>
                  <SelectItem value="FINALIZADA" className="cursor-pointer text-emerald-500 font-bold">Finalizada</SelectItem>
                  <SelectItem value="NO_APROBADA" className="cursor-pointer text-rose-500">No Aprobada</SelectItem>
                  <SelectItem value="SEGUIMIENTO" className="cursor-pointer text-indigo-500">Seguimiento</SelectItem>
                  <SelectItem value="CUARENTENA" className="cursor-pointer text-orange-500 font-semibold">Cuarentena</SelectItem>
                  <SelectItem value="NO_ATENDIDA" className="cursor-pointer text-slate-500">No Atendida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Actividad Principal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Actividad Principal a Ejecutar <span className="text-rose-500">*</span></label>
            <Input
              {...register('actividad')}
              placeholder="Ej. Toma de muestras de sangre para descarte de Brucelosis"
              className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background"
            />
            {errors.actividad && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.actividad.message}</p>}
          </div>

          {/* Fila 3: Agenda Temporal */}
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3 mb-4 text-primary font-bold uppercase tracking-widest text-xs">
              <Clock className="size-4" /> Configuración de Horario
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Fecha Programada <span className="text-rose-500">*</span></label>
                <Input {...register('fecha_programada')} type="date" min={new Date().toISOString().split('T')[0]} className="h-12 rounded-xl bg-background border-border" />
                {errors.fecha_programada && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.fecha_programada.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Hora Inicio</label>
                <Input {...register('hora_inicio')} type="time" className="h-12 rounded-xl bg-background border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Hora Estimada Fin</label>
                <Input {...register('hora_fin')} type="time" className="h-12 rounded-xl bg-background border-border" />
              </div>
            </div>
          </div>

          {/* Fila 4: Vehículo e Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Prioridad de Visita</label>
              <Select
                onValueChange={(val: any) => setValue('prioridad', val)}
                value={selectedPrioridad}
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border" position="popper">
                  <SelectItem value="BAJA" className="cursor-pointer">Baja</SelectItem>
                  <SelectItem value="MEDIA" className="cursor-pointer">Media</SelectItem>
                  <SelectItem value="ALTA" className="cursor-pointer text-amber-500 font-medium">Alta</SelectItem>
                  <SelectItem value="URGENTE" className="cursor-pointer text-rose-500 font-bold">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Vehículo Oficial Asignado</label>
              <Select
                onValueChange={(val) => setValue('vehiculo_id', val)}
                value={selectedVehiculo}
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                  <SelectValue placeholder="Seleccione vehículo institucional..." />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border" position="popper">
                  <SelectItem value="none" className="cursor-pointer">Sin vehículo (Traslado propio/aéreo)</SelectItem>
                  {vehiculos.map(v => (
                    <SelectItem key={v.id} value={v.id.toString()} className="cursor-pointer">
                      {v.marca} {v.modelo} [{v.placa}] - ({v.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 5: Objetivos / Convocatoria / Punto de encuentro */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Punto de Encuentro</label>
              <Input {...register('punto_encuentro')} placeholder="Ej. Entrada principal o alcabala" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Convocatoria</label>
              <Input {...register('convocatoria')} placeholder="Ej. Reunión comunitaria o gremial" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Aseguramiento Logístico</label>
              <Input {...register('aseguramiento')} placeholder="Ej. Apoyo policial o insumos médicos" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Objetivo y Alcance del Despliegue</label>
            <Textarea
              {...register('objetivo')}
              placeholder="Detalle los objetivos que los inspectores deben alcanzar en esta comisión..."
              className="min-h-20 rounded-xl bg-muted/10 border-border focus:bg-background resize-none"
            />
          </div>

          {/* Inspectores */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-primary" /> Asignación de Inspectores y Personal Técnico <span className="text-rose-500">*</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Indique al menos un inspector comisionado para la visita</p>
              </div>
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                {selectedEmpleados.length} Asignados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-55 overflow-y-auto custom-scrollbar pr-2">
              {empleados.map((emp: any) => {
                const isSelected = selectedEmpleados.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmpleado(emp.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/10"
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground">{emp.nombre} {emp.apellido}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{emp.cargos?.nombre || 'Inspector Técnico'}</p>
                    </div>
                    <div className={cn(
                      "size-5 rounded-full border flex items-center justify-center transition-all",
                      isSelected ? "bg-primary border-primary text-white" : "border-border bg-background"
                    )}>
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.empleados && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.empleados.message}</p>}
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50 sticky bottom-0 z-50 bg-background/95 backdrop-blur-md pb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 bg-primary hover:bg-primary/95 text-white cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando...</>
              ) : (
                'Confirmar y Guardar'
              )}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};
