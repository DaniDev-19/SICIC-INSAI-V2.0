import { useEffect, useState, useMemo, useRef, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useActaSilos } from '@/hooks/use-acta-silos';
import { planificacionesService } from '@/services/planificaciones.service';
import apiClient from '@/lib/api-client';
import type { ActaSilo, SiloFoto } from '@/types/acta_silos';
import {
  Warehouse,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media-url';

const STEPS = [
  { title: 'Planificación', description: 'Vincular visita' },
  { title: 'Control Silos', description: 'Capacidad e infraestructura' },
  { title: 'Métricas', description: 'Cantidades y evidencias' },
];

const buildFormSchema = () => {
  return z.object({
    planificacion_id: z.string().min(1, 'Seleccione una planificación'),
    fecha_notificacion: z.string().min(1, 'La fecha es requerida'),
    semana_epid: z.string().optional().nullable(),
    lugar_ubicacion: z.string().optional().nullable(),
    evento_id: z.string().optional().nullable(),
    unidad_medida_id: z.string().optional().nullable(),
    cant_nacional: z.string().optional().nullable(),
    cant_importado: z.string().optional().nullable(),
    cant_afectado: z.string().optional().nullable(),
    cant_afectado_porcentaje: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val.trim() === '') return true;
          const num = Number(val);
          return !Number.isNaN(num) && num >= 0 && num <= 100;
        },
        { message: 'El porcentaje debe estar entre 0 y 100' }
      ),
    n_silos: z.string().optional().nullable(),
    n_galpones: z.string().optional().nullable(),
    c_instalada: z.string().optional().nullable(),
    c_operativa: z.string().optional().nullable(),
    c_almacenamiento: z.string().optional().nullable(),
    destino_objetivo: z.string().optional().nullable(),
    observaciones: z.string().optional().nullable(),
    medidas_recomendadas: z.string().optional().nullable(),
  });
};

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

const FIELDS_BY_STEP: (keyof FormValues)[][] = [
  ['planificacion_id', 'fecha_notificacion', 'semana_epid', 'lugar_ubicacion'],
  ['n_silos', 'n_galpones', 'evento_id', 'c_instalada', 'c_operativa', 'c_almacenamiento'],
  ['unidad_medida_id', 'cant_nacional', 'cant_importado', 'cant_afectado', 'cant_afectado_porcentaje', 'destino_objetivo'],
];

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1 block">
      {children}
      {required && <span className="text-rose-500"> *</span>}
    </label>
  );
}

interface ActaSiloModalProps {
  isOpen: boolean;
  onClose: () => void;
  actaSilo?: ActaSilo | null;
  initialPlanificacionId?: number;
}

function toDateInput(iso: string | null | undefined) {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function ActaSiloModal({
  isOpen,
  onClose,
  actaSilo,
  initialPlanificacionId,
}: ActaSiloModalProps) {
  const { createActaSilo, updateActaSilo, isCreating, isUpdating } = useActaSilos();
  const isEditing = !!actaSilo;
  const formSchema = useMemo(() => buildFormSchema(), []);
  const [step, setStep] = useState(0);
  const [fotos, setFotos] = useState<File[]>([]);
  const [removedFotoIds, setRemovedFotoIds] = useState<number[]>([]);
  const [submitLocked, setSubmitLocked] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      planificacion_id: '',
      fecha_notificacion: new Date().toISOString().slice(0, 10),
      semana_epid: '',
      lugar_ubicacion: '',
      evento_id: '',
      unidad_medida_id: '',
      cant_nacional: '0',
      cant_importado: '0',
      cant_afectado: '0',
      cant_afectado_porcentaje: '0',
      n_silos: '',
      n_galpones: '',
      c_instalada: '',
      c_operativa: '',
      c_almacenamiento: '',
      destino_objetivo: '',
      observaciones: '',
      medidas_recomendadas: '',
    },
  });

  const { data: planificacionesRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['planificaciones-select-silos'],
    queryFn: () =>
      planificacionesService.getAll({ page: 1, limit: 100, status: undefined }),
    enabled: isOpen,
  });

  const { data: eventosList } = useQuery({
    queryKey: ['t_evento-silos-catalog'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Array<{ id: number; nombre: string }> }>('/t_evento');
      return data.data;
    },
    enabled: isOpen,
  });

  const { data: unidadesList } = useQuery({
    queryKey: ['t_unidades-silos-catalog'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Array<{ id: number; nombre: string }> }>('/t_unidades');
      return data.data;
    },
    enabled: isOpen,
  });

  const planificaciones = useMemo(() => {
    const raw = planificacionesRes?.data || [];
    return raw.filter((p) => {
      if (actaSilo && p.id === actaSilo.planificacion_id) return true;
      if (initialPlanificacionId && p.id === initialPlanificacionId) return true;
      return !p.acta_silos || p.acta_silos.length === 0;
    });
  }, [planificacionesRes, actaSilo, initialPlanificacionId]);
  const catalogEventos = eventosList || [];
  const catalogUnidades = unidadesList || [];
  const isLoading = isCreating || isUpdating;

  const watched = watch();
  const planId = watched.planificacion_id;

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          !!watched.planificacion_id &&
          !!watched.fecha_notificacion &&
          !errors.planificacion_id &&
          !errors.fecha_notificacion
        );
      case 1:
        return (
          !errors.n_silos &&
          !errors.n_galpones &&
          !errors.evento_id
        );
      case 2:
        return (
          !errors.cant_nacional &&
          !errors.cant_importado &&
          !errors.cant_afectado &&
          !errors.cant_afectado_porcentaje
        );
      default:
        return false;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setStep(0);
    setFotos([]);
    setRemovedFotoIds([]);
    setSubmitLocked(false);
    setIsAdvancing(false);
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (actaSilo) {
      reset({
        planificacion_id: String(actaSilo.planificacion_id || ''),
        fecha_notificacion: toDateInput(actaSilo.fecha_notificacion),
        semana_epid: actaSilo.semana_epid || '',
        lugar_ubicacion: actaSilo.lugar_ubicacion || '',
        evento_id: actaSilo.evento_id ? String(actaSilo.evento_id) : '',
        unidad_medida_id: actaSilo.unidad_medida_id ? String(actaSilo.unidad_medida_id) : '',
        cant_nacional: actaSilo.cant_nacional !== null ? String(actaSilo.cant_nacional) : '0',
        cant_importado: actaSilo.cant_importado !== null ? String(actaSilo.cant_importado) : '0',
        cant_afectado: actaSilo.cant_afectado !== null ? String(actaSilo.cant_afectado) : '0',
        cant_afectado_porcentaje: actaSilo.cant_afectado_porcentaje !== null ? String(actaSilo.cant_afectado_porcentaje) : '0',
        n_silos: actaSilo.n_silos || '',
        n_galpones: actaSilo.n_galpones || '',
        c_instalada: actaSilo.c_instalada || '',
        c_operativa: actaSilo.c_operativa || '',
        c_almacenamiento: actaSilo.c_almacenamiento || '',
        destino_objetivo: actaSilo.destino_objetivo || '',
        observaciones: actaSilo.observaciones || '',
        medidas_recomendadas: actaSilo.medidas_recomendadas || '',
      });
    } else {
      reset({
        planificacion_id: initialPlanificacionId ? String(initialPlanificacionId) : '',
        fecha_notificacion: new Date().toISOString().slice(0, 10),
        semana_epid: '',
        lugar_ubicacion: '',
        evento_id: '',
        unidad_medida_id: '',
        cant_nacional: '0',
        cant_importado: '0',
        cant_afectado: '0',
        cant_afectado_porcentaje: '0',
        n_silos: '',
        n_galpones: '',
        c_instalada: '',
        c_operativa: '',
        c_almacenamiento: '',
        destino_objetivo: '',
        observaciones: '',
        medidas_recomendadas: '',
      });
    }
  }, [isOpen, actaSilo, initialPlanificacionId, reset]);

  const handleNext = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);

    const fields = FIELDS_BY_STEP[step];
    const zodOk = fields.length === 0 || (await trigger(fields));

    if (!zodOk) {
      setIsAdvancing(false);
      return;
    }

    const nextStep = Math.min(step + 1, STEPS.length - 1);
    setStep(nextStep);

    if (nextStep === STEPS.length - 1) {
      setSubmitLocked(true);
    }

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setIsAdvancing(false);
      setSubmitLocked(false);
      advanceTimerRef.current = null;
    }, 400);
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: FormValues) => {
    const fieldsOk = await trigger([
      'planificacion_id',
      'fecha_notificacion',
      'cant_nacional',
      'cant_importado',
      'cant_afectado',
      'cant_afectado_porcentaje',
    ]);
    if (!fieldsOk) return;

    const payload = {
      planificacion_id: Number(values.planificacion_id),
      fecha_notificacion: values.fecha_notificacion,
      semana_epid: values.semana_epid || null,
      lugar_ubicacion: values.lugar_ubicacion || null,
      evento_id: values.evento_id ? Number(values.evento_id) : null,
      unidad_medida_id: values.unidad_medida_id ? Number(values.unidad_medida_id) : null,
      cant_nacional: values.cant_nacional ? Number(values.cant_nacional) : 0,
      cant_importado: values.cant_importado ? Number(values.cant_importado) : 0,
      cant_afectado: values.cant_afectado ? Number(values.cant_afectado) : 0,
      cant_afectado_porcentaje: values.cant_afectado_porcentaje ? Number(values.cant_afectado_porcentaje) : 0,
      n_silos: values.n_silos || null,
      n_galpones: values.n_galpones || null,
      c_instalada: values.c_instalada || null,
      c_operativa: values.c_operativa || null,
      c_almacenamiento: values.c_almacenamiento || null,
      destino_objetivo: values.destino_objetivo || null,
      observaciones: values.observaciones || null,
      medidas_recomendadas: values.medidas_recomendadas || null,
    };

    if (isEditing && actaSilo) {
      await updateActaSilo({
        id: actaSilo.id,
        data: {
          ...payload,
          ...(removedFotoIds.length > 0 ? { fotos_eliminadas: removedFotoIds } : {}),
        },
        fotos: fotos.length ? fotos : undefined,
      });
    } else {
      await createActaSilo({ data: payload, fotos: fotos.length ? fotos : undefined });
    }
    onClose();
  };

  const existingFotosVisibles: SiloFoto[] = useMemo(() => {
    if (!isEditing || !actaSilo?.silo_fotos) return [];
    return actaSilo.silo_fotos.filter((f) => !removedFotoIds.includes(f.id));
  }, [isEditing, actaSilo?.silo_fotos, removedFotoIds]);

  const handleRemoveExistingFoto = (fotoId: number) => {
    setRemovedFotoIds((prev) => (prev.includes(fotoId) ? prev : [...prev, fotoId]));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxNuevas = Math.max(0, 10 - existingFotosVisibles.length);
    setFotos((prev) => [...prev, ...files].slice(0, maxNuevas));
    e.target.value = '';
  };

  const selectedPlan = planificaciones.find((p) => String(p.id) === planId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl lg:max-w-4xl max-h-[min(92vh,52rem)] overflow-y-auto border-none shadow-2xl glass-effect custom-scrollbar p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Warehouse className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {isEditing ? 'Editar Acta Silo' : 'Registrar Acta Silo'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditing ? 'Modifique los campos del acta' : 'Complete la planilla de registro e inspección de Silos'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Stepper steps={STEPS} currentStep={step} className="mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel required>Planificación asociada</FieldLabel>
                <Select
                  value={watch('planificacion_id')}
                  onValueChange={(v) => setValue('planificacion_id', v, { shouldValidate: true })}
                  disabled={isEditing || loadingPlans}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={loadingPlans ? 'Cargando planificaciones...' : 'Seleccionar planificación'} />
                  </SelectTrigger>
                  <SelectContent>
                    {planificaciones.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="cursor-pointer">
                        {p.codigo || `#${p.id}`} — {p.solicitudes?.clientes?.nombre || 'Sin productor'} (
                        {new Date(p.fecha_programada).toLocaleDateString('es-VE')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.planificacion_id && (
                  <p className="text-xs text-rose-500 font-medium">{errors.planificacion_id.message}</p>
                )}
              </div>

              {selectedPlan && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm space-y-1">
                  <p>
                    <span className="font-bold">Solicitud:</span> {selectedPlan.solicitudes?.codigo} —{' '}
                    {selectedPlan.solicitudes?.descripcion}
                  </p>
                  <p>
                    <span className="font-bold">Establecimiento / Predio:</span>{' '}
                    {selectedPlan.solicitudes?.propiedades?.nombre || '—'}
                  </p>
                  <p>
                    <span className="font-bold">Productor:</span>{' '}
                    {selectedPlan.solicitudes?.clientes?.nombre || '—'}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel required>Fecha de Notificación</FieldLabel>
                  <Input
                    type="date"
                    {...register('fecha_notificacion')}
                    className="h-12 rounded-xl"
                  />
                  {errors.fecha_notificacion && (
                    <p className="text-xs text-rose-500">{errors.fecha_notificacion.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <FieldLabel>Semana Epidemiológica</FieldLabel>
                  <Input {...register('semana_epid')} placeholder="Ej. Semana 22" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>Ubicación / Sector Específico del Establecimiento</FieldLabel>
                <Input {...register('lugar_ubicacion')} placeholder="Ej. Zona Industrial, Avenida principal" className="h-12 rounded-xl" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FieldLabel>N° de Silos</FieldLabel>
                  <Input {...register('n_silos')} placeholder="Ej. 12" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>N° de Galpones</FieldLabel>
                  <Input {...register('n_galpones')} placeholder="Ej. 4" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Evento Fitosanitario</FieldLabel>
                  <Select
                    value={watch('evento_id') || ''}
                    onValueChange={(v) => setValue('evento_id', v)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Seleccionar evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogEventos.map((ev) => (
                        <SelectItem key={ev.id} value={String(ev.id)} className="cursor-pointer">
                          {ev.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Capacidad Instalada</FieldLabel>
                  <Input {...register('c_instalada')} placeholder="Ej. 50,000 Ton" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Capacidad Operativa</FieldLabel>
                  <Input {...register('c_operativa')} placeholder="Ej. 35,000 Ton" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Capacidad de Almacenamiento</FieldLabel>
                  <Input {...register('c_almacenamiento')} placeholder="Ej. 30,000 Ton" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Unidad de Medida del Rubro</FieldLabel>
                  <Select
                    value={watch('unidad_medida_id') || ''}
                    onValueChange={(v) => setValue('unidad_medida_id', v)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogUnidades.map((un) => (
                        <SelectItem key={un.id} value={String(un.id)} className="cursor-pointer">
                          {un.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel>Destino y Objetivo del Rubro</FieldLabel>
                  <Input {...register('destino_objetivo')} placeholder="Ej. Distribución Nacional" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Cantidad Nacional</FieldLabel>
                  <Input type="number" step="any" {...register('cant_nacional')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Cantidad Importada</FieldLabel>
                  <Input type="number" step="any" {...register('cant_importado')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Cantidad Afectada</FieldLabel>
                  <Input type="number" step="any" {...register('cant_afectado')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Afectación (%)</FieldLabel>
                  <Input type="number" step="any" {...register('cant_afectado_porcentaje')} className="h-12 rounded-xl" />
                  {errors.cant_afectado_porcentaje && (
                    <p className="text-xs text-rose-500">{errors.cant_afectado_porcentaje.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Aspectos Constatados (Observaciones)</FieldLabel>
                  <Textarea {...register('observaciones')} rows={3} className="rounded-xl resize-none" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Medidas y Recomendaciones Ordenadas</FieldLabel>
                  <Textarea {...register('medidas_recomendadas')} rows={3} className="rounded-xl resize-none" />
                </div>
              </div>

              {existingFotosVisibles.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Fotos registradas ({existingFotosVisibles.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingFotosVisibles.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                      >
                        <img
                          src={resolveMediaUrl(foto.imagen)}
                          alt="Evidencia registrada"
                          className="w-full h-full object-cover bg-muted"
                          loading="lazy"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveExistingFoto(foto.id)}
                          className="absolute top-2 right-2 size-8 opacity-90 cursor-pointer"
                          title="Eliminar foto"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center">
                <Upload className="size-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-semibold mb-2">
                  Adjuntar fotos de evidencia (máx. 10)
                </p>
                <label className={cn('inline-flex', existingFotosVisibles.length >= 10 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}>
                  <span className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">
                    Seleccionar fotos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={existingFotosVisibles.length >= 10}
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {fotos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Nuevas fotos seleccionadas ({fotos.length})
                  </p>
                  <ul className="space-y-1">
                    {fotos.map((file, i) => (
                      <li
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between p-2 rounded-xl bg-muted/30 text-sm"
                      >
                        <span className="truncate font-medium">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFotos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="cursor-pointer shrink-0"
                        >
                          <X className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-border/50">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="cursor-pointer font-bold">
                <ChevronLeft className="size-4 mr-1" /> Anterior
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
                Cancelar
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button
                key="step-next"
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading || isAdvancing}
                className={cn('cursor-pointer ml-auto font-bold', (!isStepValid() || isLoading) && 'opacity-50 cursor-not-allowed')}
              >
                Siguiente <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                key="step-submit"
                type="submit"
                disabled={isLoading || !isStepValid() || submitLocked}
                className={cn('cursor-pointer ml-auto font-bold bg-primary hover:bg-primary/95 text-white', (isLoading || !isStepValid() || submitLocked) && 'opacity-50 cursor-not-allowed')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Actualizar Acta'
                ) : (
                  'Registrar y Abrir PDF'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
