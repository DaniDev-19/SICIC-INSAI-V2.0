import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Stepper } from '@/components/ui/Stepper';
import {
  User,
  Home,
  Calendar,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientes } from '@/hooks/use-clientes';
import { useSolicitudes } from '@/hooks/use-solicitudes';
import { useEmpleados } from '@/hooks/use-empleados';
import { useVehiculos } from '@/hooks/use-vehiculos';

const wizardSchema = z.object({
  // Step 1: Client and Property
  solicitante_id: z.string().min(1, 'El productor es requerido'),
  propiedad_id: z.string().min(1, 'El predio rural es requerido'),

  // Step 2: Solicitud Details
  tipo_solicitud_id: z.string().min(1, 'El tipo de solicitud es requerido'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  medio_recepcion: z.enum(['WEB', 'TELEFONO', 'PRESENCIAL', 'CORREO', 'OFICIO']),

  // Step 3: Planificación (Opcional)
  programar_inmediato: z.boolean().default(false),
  fecha_programada: z.string().optional(),
  hora_inicio: z.string().optional(),
  hora_fin: z.string().optional(),
  prioridad_plan: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']).optional(),
  actividad: z.string().optional(),
  objetivo: z.string().optional(),
  convocatoria: z.string().optional(),
  punto_encuentro: z.string().optional(),
  ubicacion: z.string().optional(),
  aseguramiento: z.string().optional(),
  vehiculo_id: z.string().optional(),

  // Step 4: Assigned Employees
  empleados: z.array(z.number()).optional(),
}).refine((data) => {
  if (data.programar_inmediato) {
    return !!data.fecha_programada;
  }
  return true;
}, {
  message: 'La fecha programada es requerida para agendar la planificación',
  path: ['fecha_programada'],
});

type WizardValues = z.infer<typeof wizardSchema>;

interface SolicitudWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { title: 'Origen', description: 'Productor y Predio' },
  { title: 'Solicitud', description: 'Detalles del trámite' },
  { title: 'Planificación', description: 'Agenda de visita' },
  { title: 'Personal', description: 'Técnicos asignados' },
];

export function SolicitudWizard({ isOpen, onClose }: SolicitudWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks de datos
  const { clientes, setSearch: setClientesSearch } = useClientes('', 50);
  const { tipos, createSolicitud } = useSolicitudes();
  const { empleados, setLimit: setEmpleadosLimit } = useEmpleados();
  const { vehiculos } = useVehiculos();

  // Asegurar que listamos bastantes empleados para la asignación
  useEffect(() => {
    if (isOpen) {
      setEmpleadosLimit(100);
    }
  }, [isOpen, setEmpleadosLimit]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      solicitante_id: '',
      propiedad_id: '',
      tipo_solicitud_id: '',
      descripcion: '',
      prioridad: 'MEDIA',
      medio_recepcion: 'PRESENCIAL',
      programar_inmediato: false,
      prioridad_plan: 'MEDIA',
      empleados: [],
    }
  });

  const selectedClient = watch('solicitante_id');
  const programarInmediato = watch('programar_inmediato');
  const selectedEmpleados = watch('empleados') || [];

  // Obtener propiedades del cliente seleccionado
  const selectedClientObj = clientes.find(c => c.id.toString() === selectedClient);
  const clientProperties = selectedClientObj?.propiedades || [];

  // Si cambia el cliente, reiniciamos la propiedad seleccionada
  useEffect(() => {
    setValue('propiedad_id', '');
  }, [selectedClient, setValue]);

  const isStepValid = () => {
    const values = watch();
    switch (currentStep) {
      case 0:
        return !!values.solicitante_id && !!values.propiedad_id;
      case 1:
        return !!values.tipo_solicitud_id && values.descripcion?.length >= 10;
      case 2:
        if (values.programar_inmediato) {
          return !!values.fecha_programada;
        }
        return true;
      case 3:
        if (values.programar_inmediato) {
          return selectedEmpleados.length > 0;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const fieldsByStep: (keyof WizardValues)[][] = [
      ['solicitante_id', 'propiedad_id'],
      ['tipo_solicitud_id', 'descripcion', 'prioridad', 'medio_recepcion'],
      ['fecha_programada', 'hora_inicio', 'hora_fin', 'prioridad_plan', 'actividad', 'objetivo', 'vehiculo_id'],
      ['empleados']
    ];

    const isStepValidRes = await trigger(fieldsByStep[currentStep]);
    if (isStepValidRes) {
      // Si el usuario decide NO planificar de inmediato, podemos saltar directamente al final desde el paso 2
      if (currentStep === 1 && !programarInmediato) {
        // Ejecutar envío final
        handleSubmit(onFinalSubmit)();
        return;
      }

      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onFinalSubmit = async (values: WizardValues) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        solicitante_id: parseInt(values.solicitante_id),
        propiedad_id: parseInt(values.propiedad_id),
        tipo_solicitud_id: parseInt(values.tipo_solicitud_id),
        descripcion: values.descripcion,
        prioridad: values.prioridad,
        medio_recepcion: values.medio_recepcion,
      };

      // Si se decidió agendar de inmediato, incorporamos la planificación
      if (values.programar_inmediato && values.fecha_programada) {
        payload.planificacion = {
          fecha_programada: values.fecha_programada,
          hora_inicio: values.hora_inicio || undefined,
          hora_fin: values.hora_fin || undefined,
          prioridad: values.prioridad_plan || values.prioridad,
          actividad: values.actividad || undefined,
          objetivo: values.objetivo || undefined,
          convocatoria: values.convocatoria || undefined,
          punto_encuentro: values.punto_encuentro || undefined,
          ubicacion: values.ubicacion || undefined,
          aseguramiento: values.aseguramiento || undefined,
          vehiculo_id: values.vehiculo_id ? parseInt(values.vehiculo_id) : null,
          empleados: selectedEmpleados,
        };
      }

      await createSolicitud(payload);
      toast.success('Trámite de solicitud procesado con éxito');
      reset();
      setCurrentStep(0);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar la solicitud');
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-3xl border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Activity className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Nueva Solicitud de Inspección</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Genere requerimientos de inspección técnica y agende su planificación de forma integrada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pb-12">
          {/* Ocultamos los últimos pasos del Stepper si no se programa planificación de inmediato */}
          <Stepper 
            steps={programarInmediato ? STEPS : STEPS.slice(0, 2)} 
            currentStep={currentStep} 
          />

          <form onSubmit={(e) => e.preventDefault()} className="mt-8">
            <div key={currentStep} className="min-h-[350px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* PASO 1: CLIENTE Y PROPIEDAD */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Productor / Solicitante <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar productor por cédula, RIF o nombre..."
                        className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background"
                        onChange={(e) => setClientesSearch(e.target.value)}
                      />
                    </div>
                    <Select onValueChange={(val) => setValue('solicitante_id', val, { shouldValidate: true })} value={selectedClient}>
                      <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                        <SelectValue placeholder="Seleccione productor..." />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border max-h-[200px]" position="popper">
                        {clientes.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer">
                            {c.nombre} ({c.cedula_rif})
                          </SelectItem>
                        ))}
                        {clientes.length === 0 && (
                          <div className="p-3 text-center text-xs text-muted-foreground">Escriba en el buscador de arriba</div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.solicitante_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.solicitante_id.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Predio Rural / Propiedad Asociada <span className="text-rose-500">*</span></label>
                    <Select 
                      onValueChange={(val) => setValue('propiedad_id', val, { shouldValidate: true })} 
                      value={watch('propiedad_id')}
                      disabled={!selectedClient}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background disabled:opacity-50">
                        <SelectValue placeholder={selectedClient ? "Seleccione propiedad..." : "Primero seleccione un productor"} />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border" position="popper">
                        {clientProperties.map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()} className="cursor-pointer">
                            {p.nombre} {p.codigo_insai ? `(${p.codigo_insai})` : ''}
                          </SelectItem>
                        ))}
                        {selectedClient && clientProperties.length === 0 && (
                          <div className="p-3 text-center text-xs text-muted-foreground">El productor seleccionado no posee predios registrados</div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.propiedad_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.propiedad_id.message}</p>}
                  </div>
                </div>
              )}

              {/* PASO 2: DETALLES DE LA SOLICITUD */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Tipo de Requerimiento <span className="text-rose-500">*</span></label>
                      <Select onValueChange={(val) => setValue('tipo_solicitud_id', val, { shouldValidate: true })} value={watch('tipo_solicitud_id')}>
                        <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper">
                          {tipos.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()} className="cursor-pointer">{t.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipo_solicitud_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.tipo_solicitud_id.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Medio de Recepción</label>
                      <Select onValueChange={(val: any) => setValue('medio_recepcion', val)} value={watch('medio_recepcion')}>
                        <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper">
                          <SelectItem value="PRESENCIAL" className="cursor-pointer">Presencial / Taquilla</SelectItem>
                          <SelectItem value="WEB" className="cursor-pointer">Portal Web</SelectItem>
                          <SelectItem value="TELEFONO" className="cursor-pointer">Llamada Telefónica</SelectItem>
                          <SelectItem value="CORREO" className="cursor-pointer">Correo Electrónico</SelectItem>
                          <SelectItem value="OFICIO" className="cursor-pointer font-bold">Oficio Oficial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Prioridad Inicial</label>
                      <Select onValueChange={(val: any) => setValue('prioridad', val)} value={watch('prioridad')}>
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

                    <div className="space-y-4 pt-8 pl-4">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          {...register('programar_inmediato')}
                          className="size-5 rounded-lg border-border text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-foreground">¿Planificar visita técnica de inmediato?</span>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Agendar visita de inspección en el calendario nacional</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Descripción del Motivo de Inspección <span className="text-rose-500">*</span></label>
                    <Textarea
                      {...register('descripcion')}
                      placeholder="Describa a detalle el motivo de la inspección requerida (ej. Descarte de patologías en bovinos, certificación de huertos, inspección rutinaria...)"
                      className="min-h-24 rounded-xl bg-muted/10 border-border focus:bg-background resize-none"
                    />
                    {errors.descripcion && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.descripcion.message}</p>}
                  </div>
                </div>
              )}

              {/* PASO 3: PLANIFICACIÓN DE LA VISITA */}
              {currentStep === 2 && programarInmediato && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-2">
                    <div className="flex items-center gap-3 mb-4 text-primary font-bold uppercase tracking-widest text-xs">
                      <Calendar className="size-4" /> Configuración de Agenda de Campo
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Fecha Programada <span className="text-rose-500">*</span></label>
                        <Input {...register('fecha_programada')} type="date" className="h-12 rounded-xl bg-background border-border" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Actividad Específica</label>
                      <Input {...register('actividad')} placeholder="Ej. Toma de muestras de sangre" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Asignar Vehículo Institucional</label>
                      <Select onValueChange={(val) => setValue('vehiculo_id', val)} value={watch('vehiculo_id')}>
                        <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background">
                          <SelectValue placeholder="Seleccione vehículo..." />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper">
                          {vehiculos.map((v: any) => (
                            <SelectItem key={v.id} value={v.id.toString()} className="cursor-pointer">
                              {v.marca} {v.modelo} [{v.placa}] - ({v.status})
                            </SelectItem>
                          ))}
                          {vehiculos.length === 0 && (
                            <div className="p-3 text-center text-xs text-muted-foreground font-medium">No hay vehículos registrados en inventario</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Objetivos y Alcance de la Visita</label>
                    <Textarea 
                      {...register('objetivo')} 
                      placeholder="Describa el objetivo principal que los técnicos deben alcanzar en esta comisión..." 
                      className="min-h-20 rounded-xl bg-muted/10 border-border focus:bg-background resize-none" 
                    />
                  </div>
                </div>
              )}

              {/* PASO 4: EQUIPO INSPECTOR */}
              {currentStep === 3 && programarInmediato && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Users className="size-4 text-primary" /> Asignación de Inspectores y Médicos Veterinarios
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">Seleccione los técnicos encargados de ejecutar esta planificación</p>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                      {selectedEmpleados.length} Asignados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
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
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">{emp.nombre} {emp.apellido}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{emp.cargos?.nombre || 'Técnico Inspector'}</p>
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
                    {empleados.length === 0 && (
                      <div className="col-span-2 py-12 text-center text-sm text-muted-foreground font-bold italic">
                        No hay personal registrado en el sistema.
                      </div>
                    )}
                  </div>
                  {errors.empleados && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.empleados.message}</p>}
                </div>
              )}

            </div>

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={currentStep === 0 ? onClose : handleBack} 
                className="h-12 px-6 rounded-xl font-bold cursor-pointer"
              >
                {currentStep === 0 ? 'Cancelar' : <><ChevronLeft className="mr-2 size-4" /> Anterior</>}
              </Button>

              <Button
                type="button"
                onClick={currentStep === (programarInmediato ? STEPS.length - 1 : 1) ? handleSubmit(onFinalSubmit) : handleNext}
                disabled={isSubmitting || !isStepValid()}
                className={cn(
                  "h-12 px-8 rounded-xl font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
                  currentStep === (programarInmediato ? STEPS.length - 1 : 1)
                    ? "px-10 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 text-white hover:bg-primary/95" 
                    : "shadow-primary/20"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando...</>
                ) : currentStep === (programarInmediato ? STEPS.length - 1 : 1) ? (
                  <><Check className="mr-2 size-4" /> Finalizar y Guardar</>
                ) : (
                  <>Siguiente <ChevronRight className="ml-2 size-4" /></>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
