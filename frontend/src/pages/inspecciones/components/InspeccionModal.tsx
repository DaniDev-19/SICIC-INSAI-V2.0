import { useEffect, useState, useMemo, type ReactNode } from 'react';
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
import { useInspecciones } from '@/hooks/use-inspecciones';
import { planificacionesService } from '@/services/planificaciones.service';
import { finalidadesService } from '@/services/finalidades.service';
import { ubicacionService } from '@/services/ubicacion.service';
import {
  inspectionsService,
  type InspeccionCodigosPreview,
} from '@/services/inspecciones.service';
import type { Inspeccion, FinalidadPayload, InspeccionStatus } from '@/types/inspecciones';
import {
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { title: 'Planificación', description: 'Vincular visita programada' },
  { title: 'Atendido', description: 'Persona y ubicación' },
  { title: 'Informe', description: 'Hallazgos y finalidades' },
  { title: 'Evidencias', description: 'Fotos de campo' },
];

const STATUS_OPTIONS: { value: InspeccionStatus; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'INSPECCIONANDO', label: 'En inspección' },
  { value: 'FINALIZADA', label: 'Finalizada' },
  { value: 'NO_APROBADA', label: 'No aprobada' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento' },
  { value: 'CUARENTENA', label: 'Cuarentena' },
  { value: 'NO_ATENDIDA', label: 'No atendida' },
];

const ESTADO_ABREV_OPCIONES = [
  'AMA', 'ANZ', 'APU', 'ARA', 'BAR', 'BOL', 'VAL', 'COJ', 'DAM', 'DCT',
  'FAL', 'GUA', 'LAR', 'MER', 'MIR', 'MON', 'NES', 'POR', 'SUC', 'TAC',
  'TRU', 'VAR', 'YAR', 'ZUL',
];

const formSchema = z.object({
  planificacion_id: z.string().min(1, 'Seleccione una planificación'),
  fecha_inspeccion: z.string().min(1, 'La fecha es requerida'),
  hora_inspeccion: z.string().optional(),
  status: z.string().min(1, 'Seleccione un estatus'),
  atendido_por_nombre: z.string().optional(),
  atendido_por_cedula: z.string().optional(),
  atendido_por_email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  atendido_por_tlf: z.string().optional(),
  insp_utm_norte: z.string().min(1, 'UTM Norte es requerido'),
  insp_utm_este: z.string().min(1, 'UTM Este es requerido'),
  insp_utm_zona: z.string().min(1, 'Zona UTM es requerida'),
  google_maps_url: z
    .string()
    .optional()
    .refine((val) => !val?.trim() || /^https?:\/\/.+/i.test(val.trim()), {
      message: 'Ingrese una URL válida (https://...)',
    }),
  aspectos_constatados: z.string().optional(),
  medidas_ordenadas: z.string().optional(),
  posee_certificado: z.string().optional(),
  vigencia_dias: z
    .string()
    .optional()
    .refine((val) => !val?.trim() || (!Number.isNaN(Number(val)) && Number(val) > 0), {
      message: 'La vigencia debe ser un número mayor a 0',
    }),
});

type FormValues = z.infer<typeof formSchema>;

const FIELDS_BY_STEP: (keyof FormValues)[][] = [
  ['planificacion_id', 'fecha_inspeccion', 'status'],
  ['insp_utm_norte', 'insp_utm_este', 'insp_utm_zona', 'atendido_por_email', 'google_maps_url'],
  ['aspectos_constatados', 'medidas_ordenadas', 'posee_certificado', 'vigencia_dias'],
  [],
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

interface InspeccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspeccion?: Inspeccion | null;
  initialPlanificacionId?: number;
}

function toTimeInput(iso: string | null) {
  if (!iso) return '';
  const part = iso.includes('T') ? iso.split('T')[1] : iso;
  return part.slice(0, 5);
}

function toDateInput(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export function InspeccionModal({
  isOpen,
  onClose,
  inspeccion,
  initialPlanificacionId,
}: InspeccionModalProps) {
  const { createInspeccion, updateInspeccion, isCreating, isUpdating } = useInspecciones();
  const [step, setStep] = useState(0);
  const [fotos, setFotos] = useState<File[]>([]);
  const [finalidadesRows, setFinalidadesRows] = useState<FinalidadPayload[]>([
    { finalidad_id: 0, objetivo: '' },
  ]);
  const [estadoAbrev, setEstadoAbrev] = useState('');
  const [codigosPreview, setCodigosPreview] = useState<InspeccionCodigosPreview | null>(null);
  const [loadingCodigos, setLoadingCodigos] = useState(false);
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
      fecha_inspeccion: new Date().toISOString().slice(0, 10),
      hora_inspeccion: '',
      status: 'INSPECCIONANDO',
      atendido_por_nombre: '',
      atendido_por_cedula: '',
      atendido_por_email: '',
      atendido_por_tlf: '',
      insp_utm_norte: '',
      insp_utm_este: '',
      insp_utm_zona: '',
      google_maps_url: '',
      aspectos_constatados: '',
      medidas_ordenadas: '',
      posee_certificado: '',
      vigencia_dias: '30',
    },
  });

  const { data: planificacionesRes, isLoading: loadingPlans } = useQuery({
    queryKey: ['planificaciones-select'],
    queryFn: () =>
      planificacionesService.getAll({ page: 1, limit: 100, status: undefined }),
    enabled: isOpen,
  });

  const { data: finalidadesRes, isLoading: loadingFinalidades } = useQuery({
    queryKey: ['finalidades-catalog'],
    queryFn: () => finalidadesService.getAll(),
    enabled: isOpen,
  });

  const { data: estadosRes } = useQuery({
    queryKey: ['estados-inspeccion'],
    queryFn: () => ubicacionService.getEstados(),
    enabled: isOpen,
  });

  const planificaciones = planificacionesRes?.data || [];
  const catalogFinalidades = finalidadesRes?.data || [];
  const isEditing = !!inspeccion;
  const isLoading = isCreating || isUpdating;

  const watched = watch();
  const planId = watched.planificacion_id;
  const fechaInsp = watched.fecha_inspeccion;

  const isStepValid = () => {
    switch (step) {
      case 0:
        return (
          !!watched.planificacion_id &&
          !!watched.fecha_inspeccion &&
          !!watched.status &&
          !!estadoAbrev &&
          !!codigosPreview?.n_control &&
          !loadingCodigos
        );
      case 1:
        return (
          !!watched.insp_utm_norte?.trim() &&
          !!watched.insp_utm_este?.trim() &&
          !!watched.insp_utm_zona?.trim() &&
          !errors.insp_utm_norte &&
          !errors.insp_utm_este &&
          !errors.insp_utm_zona &&
          !errors.atendido_por_email &&
          !errors.google_maps_url
        );
      case 2:
        return !errors.vigencia_dias;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const opcionesEstado = useMemo(() => {
    const fromApi = (estadosRes?.data || []).map((e) => {
      const codigo = String(e.codigo || '').trim().toUpperCase();
      const abrev = /^[A-Z]{2,4}$/.test(codigo) ? codigo : codigo.slice(0, 3);
      return { value: abrev, label: `${abrev} — ${e.nombre}` };
    });
    if (fromApi.length > 0) return fromApi;
    return ESTADO_ABREV_OPCIONES.map((abrev) => ({ value: abrev, label: abrev }));
  }, [estadosRes]);

  useEffect(() => {
    if (!isOpen || !planId || !fechaInsp) {
      setCodigosPreview(null);
      return;
    }

    let cancelled = false;
    setLoadingCodigos(true);

    inspectionsService
      .previewCodigos({
        planificacion_id: Number(planId),
        fecha_inspeccion: fechaInsp,
        estado_abrev: estadoAbrev || undefined,
        exclude_id: inspeccion?.id,
      })
      .then((res) => {
        if (cancelled) return;
        setCodigosPreview(res.data);
        if (res.data.estado_abrev && !estadoAbrev) {
          setEstadoAbrev(res.data.estado_abrev);
        }
      })
      .catch(() => {
        if (!cancelled) setCodigosPreview(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCodigos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, planId, fechaInsp, estadoAbrev, inspeccion?.id]);

  useEffect(() => {
    if (!isOpen) return;

    setStep(0);
    setFotos([]);
    setEstadoAbrev(inspeccion?.n_control?.split('-')[0]?.toUpperCase() || '');
    setCodigosPreview(null);

    if (inspeccion) {
      reset({
        planificacion_id: String(inspeccion.planificacion_id || ''),
        fecha_inspeccion: toDateInput(inspeccion.fecha_inspeccion),
        hora_inspeccion: toTimeInput(inspeccion.hora_inspeccion),
        status: inspeccion.status,
        atendido_por_nombre: inspeccion.atendido_por_nombre || '',
        atendido_por_cedula: inspeccion.atendido_por_cedula || '',
        atendido_por_email: inspeccion.atendido_por_email || '',
        atendido_por_tlf: inspeccion.atendido_por_tlf || '',
        insp_utm_norte: inspeccion.insp_utm_norte?.toString() || '',
        insp_utm_este: inspeccion.insp_utm_este?.toString() || '',
        insp_utm_zona: inspeccion.insp_utm_zona || '',
        google_maps_url: inspeccion.google_maps_url || '',
        aspectos_constatados: inspeccion.aspectos_constatados || '',
        medidas_ordenadas: inspeccion.medidas_ordenadas || '',
        posee_certificado: inspeccion.posee_certificado || '',
        vigencia_dias: String(inspeccion.vigencia_dias ?? 30),
      });
      setFinalidadesRows(
        inspeccion.finalidad_inspeccion?.length
          ? inspeccion.finalidad_inspeccion.map((fi) => ({
              finalidad_id: fi.finalidad_id,
              objetivo: fi.objetivo || '',
            }))
          : [{ finalidad_id: 0, objetivo: '' }]
      );
    } else {
      reset({
        planificacion_id: initialPlanificacionId ? String(initialPlanificacionId) : '',
        fecha_inspeccion: new Date().toISOString().slice(0, 10),
        hora_inspeccion: '',
        status: 'INSPECCIONANDO',
        atendido_por_nombre: '',
        atendido_por_cedula: '',
        atendido_por_email: '',
        atendido_por_tlf: '',
        insp_utm_norte: '',
        insp_utm_este: '',
        insp_utm_zona: '',
        google_maps_url: '',
        aspectos_constatados: '',
        medidas_ordenadas: '',
        posee_certificado: '',
        vigencia_dias: '30',
      });
      setFinalidadesRows([{ finalidad_id: 0, objetivo: '' }]);
    }
  }, [isOpen, inspeccion, initialPlanificacionId, reset]);

  const handleNext = async () => {
    const fields = FIELDS_BY_STEP[step];
    const zodOk = fields.length === 0 || (await trigger(fields));

    if (!zodOk) return;
    if (step === 0 && (!estadoAbrev || !codigosPreview?.n_control)) return;

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: FormValues) => {
    const fieldsOk = await trigger([
      'planificacion_id',
      'fecha_inspeccion',
      'status',
      'insp_utm_norte',
      'insp_utm_este',
      'insp_utm_zona',
      'atendido_por_email',
      'google_maps_url',
      'vigencia_dias',
    ]);
    const validFinalidades = finalidadesRows.filter((r) => r.finalidad_id > 0);
    if (!fieldsOk || !estadoAbrev || !codigosPreview?.n_control) {
      return;
    }

    const payload = {
      planificacion_id: Number(values.planificacion_id),
      fecha_inspeccion: values.fecha_inspeccion,
      hora_inspeccion: values.hora_inspeccion || undefined,
      status: values.status as InspeccionStatus,
      estado_abrev: estadoAbrev,
      atendido_por_nombre: values.atendido_por_nombre || undefined,
      atendido_por_cedula: values.atendido_por_cedula || undefined,
      atendido_por_email: values.atendido_por_email || undefined,
      atendido_por_tlf: values.atendido_por_tlf || undefined,
      insp_utm_norte: values.insp_utm_norte ? Number(values.insp_utm_norte) : undefined,
      insp_utm_este: values.insp_utm_este ? Number(values.insp_utm_este) : undefined,
      insp_utm_zona: values.insp_utm_zona || undefined,
      google_maps_url: values.google_maps_url || undefined,
      aspectos_constatados: values.aspectos_constatados || undefined,
      medidas_ordenadas: values.medidas_ordenadas || undefined,
      posee_certificado: values.posee_certificado || undefined,
      vigencia_dias: values.vigencia_dias ? Number(values.vigencia_dias) : undefined,
      finalidades: validFinalidades.length > 0 ? validFinalidades : undefined,
    };

    if (isEditing && inspeccion) {
      await updateInspeccion({ id: inspeccion.id, data: payload, fotos: fotos.length ? fotos : undefined });
    } else {
      await createInspeccion({ data: payload, fotos: fotos.length ? fotos : undefined });
    }
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFotos((prev) => [...prev, ...files].slice(0, 10));
    e.target.value = '';
  };

  const selectedPlan = planificaciones.find((p) => String(p.id) === planId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto border-none shadow-2xl glass-effect custom-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Eye className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {isEditing ? 'Editar Inspección' : 'Registrar Inspección'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditing ? inspeccion?.n_control : 'Complete el formulario de inspección de campo'}
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
                  onValueChange={(v) => {
                    setValue('planificacion_id', v, { shouldValidate: true });
                    if (!isEditing) setEstadoAbrev('');
                  }}
                  disabled={isEditing || loadingPlans}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder={loadingPlans ? 'Cargando...' : 'Seleccionar planificación'} />
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
                    <span className="font-bold">Predio:</span>{' '}
                    {selectedPlan.solicitudes?.propiedades?.nombre || '—'}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel required>Fecha inspección</FieldLabel>
                  <Input type="date" {...register('fecha_inspeccion')} className="h-12 rounded-xl" />
                  {errors.fecha_inspeccion && (
                    <p className="text-xs text-rose-500">{errors.fecha_inspeccion.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <FieldLabel>Hora</FieldLabel>
                  <Input type="time" {...register('hora_inspeccion')} className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel required>Estatus</FieldLabel>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Códigos automáticos
                </p>

                <div className="space-y-2">
                  <FieldLabel required>Sede / Estado (abreviatura)</FieldLabel>
                  <Select value={estadoAbrev} onValueChange={setEstadoAbrev}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Ej. YAR, VAL, MIR..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesEstado.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">
                    Se sugiere según la ubicación del predio o la sede del inspector asignado.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-background/80 border border-border/50">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                      Código territorial (predio)
                    </span>
                    {loadingCodigos ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <span className="font-mono font-bold text-foreground">
                        {codigosPreview?.t_codigo || '—'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-background/80 border border-border/50">
                    <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">
                      N° de control
                    </span>
                    {loadingCodigos ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <span className="font-mono font-bold text-emerald-600 break-all">
                        {codigosPreview?.n_control || '—'}
                      </span>
                    )}
                  </div>
                </div>

                {codigosPreview?.inspector?.nombre && (
                  <p className="text-xs text-muted-foreground">
                    Inspector: <span className="font-semibold">{codigosPreview.inspector.nombre}</span>
                    {' · Cédula: '}
                    <span className="font-mono">{codigosPreview.inspector.cedula}</span>
                    {' · Secuencia: '}
                    <span className="font-mono">{codigosPreview.secuencia}</span>
                  </p>
                )}

                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Formato: ABR-CEDULA-DDMMYYYY-NN (ej. YAR-18456789-04052026-01). La secuencia se
                  calcula por día, inspector y sede; al eliminar un registro el correlativo no se reutiliza.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>Nombre atendido</FieldLabel>
                  <Input {...register('atendido_por_nombre')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Cédula</FieldLabel>
                  <Input {...register('atendido_por_cedula')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Teléfono</FieldLabel>
                  <Input {...register('atendido_por_tlf')} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Email</FieldLabel>
                  <Input type="email" {...register('atendido_por_email')} className="h-12 rounded-xl" />
                  {errors.atendido_por_email && (
                    <p className="text-xs text-rose-500">{errors.atendido_por_email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FieldLabel required>UTM Norte</FieldLabel>
                  <Input type="number" step="any" {...register('insp_utm_norte')} className="h-12 rounded-xl" />
                  {errors.insp_utm_norte && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">
                      {errors.insp_utm_norte.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <FieldLabel required>UTM Este</FieldLabel>
                  <Input type="number" step="any" {...register('insp_utm_este')} className="h-12 rounded-xl" />
                  {errors.insp_utm_este && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">
                      {errors.insp_utm_este.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <FieldLabel required>Zona UTM</FieldLabel>
                  <Input {...register('insp_utm_zona')} placeholder="Ej. 19N" className="h-12 rounded-xl" />
                  {errors.insp_utm_zona && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">
                      {errors.insp_utm_zona.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <FieldLabel>URL Google Maps</FieldLabel>
                <Input {...register('google_maps_url')} placeholder="https://maps.google.com/..." className="h-12 rounded-xl" />
                {errors.google_maps_url && (
                  <p className="text-xs text-rose-500">{errors.google_maps_url.message}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <FieldLabel>Aspectos constatados</FieldLabel>
                <Textarea {...register('aspectos_constatados')} rows={4} className="rounded-xl resize-none" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Medidas ordenadas</FieldLabel>
                <Textarea {...register('medidas_ordenadas')} rows={3} className="rounded-xl resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel>¿Posee certificado?</FieldLabel>
                  <Input {...register('posee_certificado')} placeholder="Sí / No / N/A" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Vigencia (días)</FieldLabel>
                  <Input type="number" {...register('vigencia_dias')} className="h-12 rounded-xl" />
                  {errors.vigencia_dias && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">
                      {errors.vigencia_dias.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FieldLabel>Finalidades</FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFinalidadesRows((rows) => [...rows, { finalidad_id: 0, objetivo: '' }])
                    }
                    className="cursor-pointer text-primary"
                  >
                    <Plus className="size-4 mr-1" /> Agregar
                  </Button>
                </div>
                {loadingFinalidades ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="size-4 animate-spin" /> Cargando catálogo...
                  </div>
                ) : (
                  finalidadesRows.map((row, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Select
                        value={row.finalidad_id ? String(row.finalidad_id) : ''}
                        onValueChange={(v) => {
                          const next = [...finalidadesRows];
                          next[index] = { ...next[index], finalidad_id: Number(v) };
                          setFinalidadesRows(next);
                        }}
                      >
                        <SelectTrigger className="h-11 rounded-xl flex-1">
                          <SelectValue placeholder="Finalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {catalogFinalidades.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)} className="cursor-pointer">
                              {f.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Objetivo (opcional)"
                        value={row.objetivo || ''}
                        onChange={(e) => {
                          const next = [...finalidadesRows];
                          next[index] = { ...next[index], objetivo: e.target.value };
                          setFinalidadesRows(next);
                        }}
                        className="h-11 rounded-xl flex-1"
                      />
                      {finalidadesRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFinalidadesRows((rows) => rows.filter((_, i) => i !== index))
                          }
                          className="shrink-0 cursor-pointer text-rose-500"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                <Upload className="size-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold mb-2">Adjuntar fotos de evidencia (máx. 10)</p>
                <label className="inline-flex cursor-pointer">
                  <span className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">
                    Seleccionar archivos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {fotos.length > 0 && (
                <ul className="space-y-2">
                  {fotos.map((file, i) => (
                    <li
                      key={`${file.name}-${i}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30 text-sm"
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
              )}
              {isEditing && inspeccion?.inspeccion_fotos && inspeccion.inspeccion_fotos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Las fotos existentes se conservan. Las nuevas se agregarán al guardar.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t border-border/50">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="cursor-pointer">
                <ChevronLeft className="size-4 mr-1" /> Anterior
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
                Cancelar
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className={cn(
                  'cursor-pointer ml-auto',
                  (!isStepValid() || isLoading) && 'opacity-50 cursor-not-allowed'
                )}
              >
                Siguiente <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !isStepValid()}
                className={cn(
                  'cursor-pointer ml-auto',
                  (isLoading || !isStepValid()) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Actualizar inspección'
                ) : (
                  'Registrar inspección'
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
