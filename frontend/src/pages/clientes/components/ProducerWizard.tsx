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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stepper } from '@/components/ui/Stepper';
import { MapPin, AlertCircle, Loader2, ChevronRight, ChevronLeft, Check, Fingerprint, Activity, Image as ImageIcon, Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { usePropiedades } from '@/hooks/use-propiedades';
import { clientesService } from '@/services/clientes.service';
import { propiedadesService } from '@/services/propiedades.service';
import { ubicacionService, type UbicacionBase } from '@/services/ubicacion.service';

const wizardSchema = z.object({
  // Step 1: Producer
  cedula_rif: z.string().min(6, 'Cédula/RIF es requerido'),
  nombre_productor: z.string().min(3, 'Nombre es requerido'),
  codigo_runsai: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion_fiscal: z.string().optional(),

  // Step 2: Property
  nombre_propiedad: z.string().min(3, 'Nombre de propiedad es requerido'),
  rif_propiedad: z.string().optional(),
  tipo_propiedad_id: z.string().min(1, 'Tipo de propiedad es requerido'),
  hectareas_totales: z.string().optional(),
  punto_referencia: z.string().optional(),

  // Step 3: Location
  estado_id: z.string().min(1, 'Estado es requerido'),
  municipio_id: z.string().min(1, 'Municipio es requerido'),
  parroquia_id: z.string().min(1, 'Parroquia es requerido'),
  sector_id: z.string().min(1, 'Sector es requerido'),
  google_maps_url: z.string().optional(),

  // Step 4: Additional
  num_reg_hierro: z.string().optional(),
  num_reg_ganadero: z.string().optional(),
  hierro_img: z.any().optional(),
});

type WizardValues = z.infer<typeof wizardSchema>;

interface ProducerWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { title: 'Productor', description: 'Datos personales' },
  { title: 'Propiedad', description: 'Datos del predio' },
  { title: 'Ubicación', description: 'Geolocalización' },
  { title: 'Producción', description: 'Hierros y otros' },
];

export function ProducerWizard({ isOpen, onClose }: ProducerWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { createPropiedad, tipos, createTipo, updateTipo, deleteTipo } = usePropiedades();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location data
  const [estados, setEstados] = useState<UbicacionBase[]>([]);
  const [municipios, setMunicipios] = useState<UbicacionBase[]>([]);
  const [parroquias, setParroquias] = useState<UbicacionBase[]>([]);
  const [sectores, setSectores] = useState<UbicacionBase[]>([]);

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
      cedula_rif: '',
      nombre_productor: '',
      email: '',
      nombre_propiedad: '',
      hectareas_totales: '0',
    }
  });

  const selectedEstado = watch('estado_id');
  const selectedMunicipio = watch('municipio_id');
  const selectedParroquia = watch('parroquia_id');

  // Inline types management state
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [creatingTipo, setCreatingTipo] = useState(false);
  const [editingTipoId, setEditingTipoId] = useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = useState('');
  const [updatingTipoId, setUpdatingTipoId] = useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);
  const [existingProducer, setExistingProducer] = useState<any>(null);
  const [runsaiConflict, setRunsaiConflict] = useState<any>(null);
  const [emailConflict, setEmailConflict] = useState<any>(null);
  const [rifConflict, setRifConflict] = useState<any>(null);
  const [isCheckingProducer, setIsCheckingProducer] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hierroPreview, setHierroPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ubicacionService.getEstados().then(res => setEstados(res.data || []));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedEstado) {
      ubicacionService.getMunicipios(parseInt(selectedEstado)).then(res => setMunicipios(res.data || []));
      setValue('municipio_id', '');
      setValue('parroquia_id', '');
      setValue('sector_id', '');
    }
  }, [selectedEstado, setValue]);

  useEffect(() => {
    if (selectedMunicipio) {
      ubicacionService.getParroquias(parseInt(selectedMunicipio)).then(res => setParroquias(res.data || []));
      setValue('parroquia_id', '');
      setValue('sector_id', '');
    }
  }, [selectedMunicipio, setValue]);

  useEffect(() => {
    if (selectedParroquia) {
      ubicacionService.getSectores(parseInt(selectedParroquia)).then(res => setSectores(res.data || []));
      setValue('sector_id', '');
    }
  }, [selectedParroquia, setValue]);

  // Limpiar error de duplicado al cambiar la cédula
  const cedulaValue = watch('cedula_rif');
  const runsaiValue = watch('codigo_runsai');
  const emailValue = watch('email');
  const rifValue = watch('rif_propiedad');

  useEffect(() => {
    if (existingProducer) setExistingProducer(null);
  }, [cedulaValue]);

  useEffect(() => {
    if (runsaiConflict) setRunsaiConflict(null);
  }, [runsaiValue]);

  useEffect(() => {
    if (emailConflict) setEmailConflict(null);
  }, [emailValue]);

  useEffect(() => {
    if (rifConflict) setRifConflict(null);
  }, [rifValue]);

  const isStepValid = () => {
    const values = watch();
    switch (currentStep) {
      case 0:
        return !!values.cedula_rif && !!values.nombre_productor;
      case 1:
        return !!values.nombre_propiedad && !!values.tipo_propiedad_id;
      case 2:
        return !!values.estado_id && !!values.municipio_id && !!values.parroquia_id && !!values.sector_id;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const fieldsByStep: (keyof WizardValues)[][] = [
      ['cedula_rif', 'nombre_productor', 'email', 'telefono', 'codigo_runsai', 'direccion_fiscal'],
      ['nombre_propiedad', 'tipo_propiedad_id', 'rif_propiedad', 'hectareas_totales', 'punto_referencia'],
      ['estado_id', 'municipio_id', 'parroquia_id', 'sector_id', 'google_maps_url'],
      ['num_reg_hierro', 'num_reg_ganadero']
    ];

    const isStepValidRes = await trigger(fieldsByStep[currentStep]);
    if (isStepValidRes) {
      if (currentStep === 0) {
        // Al pasar del paso 1, verificamos si el productor existe
        const cedula = watch('cedula_rif');
        const runsai = watch('codigo_runsai');
        setIsCheckingProducer(true);
        try {
          // 1. Verificar Cédula/RIF
          const { data: res } = await clientesService.getAll({ q: cedula });
          const found = res.find((c: any) => c.cedula_rif === cedula);
          if (found) {
            setExistingProducer(found);
            // Auto-rellenamos los campos del paso 1 con la info que ya tenemos
            setValue('nombre_productor', found.nombre);
            setValue('telefono', found.telefono || '');
            setValue('email', found.email || '');
            setValue('direccion_fiscal', found.direccion_fiscal || '');
            setValue('codigo_runsai', found.codigo_runsai || '');

            toast.info(`Productor encontrado: ${found.nombre}. Puedes continuar con el registro de su propiedad.`);
          } else {
            setExistingProducer(null);
          }

          // 2. Verificar Código RUNSAI (debe ser único)
          if (runsai) {
            const { data: resRunsai } = await clientesService.getAll({ q: runsai });
            const foundRunsai = resRunsai.find((c: any) => c.codigo_runsai === runsai);

            // Si el RUNSAI existe pero pertenece a OTRA cédula, bloqueamos
            if (foundRunsai && foundRunsai.cedula_rif !== cedula) {
              setRunsaiConflict(foundRunsai);
              toast.error(`Conflicto de RUNSAI: Este código ya pertenece a ${foundRunsai.nombre}`);
              setIsCheckingProducer(false);
              return; // Bloqueamos el avance
            }
          }
          setRunsaiConflict(null);

          // 3. Verificar Correo Electrónico (debe ser único)
          const email = watch('email');
          if (email) {
            const { data: resEmail } = await clientesService.getAll({ q: email });
            const foundEmail = resEmail.find((c: any) => c.email === email);

            if (foundEmail && foundEmail.cedula_rif !== cedula) {
              setEmailConflict(foundEmail);
              toast.error(`Conflicto de Correo: Este email ya está registrado por ${foundEmail.nombre}`);
              setIsCheckingProducer(false);
              return; // Bloqueamos el avance
            }
          }
          setEmailConflict(null);
        } catch (error) {
          console.error('Error checking producer/runsai/email:', error);
        } finally {
          setIsCheckingProducer(false);
        }
      }

      if (currentStep === 1) {
        // Al pasar del paso 2, verificamos si el RIF de la propiedad existe
        const rif = watch('rif_propiedad');
        if (rif) {
          setIsCheckingProducer(true); // Reutilizamos el loader
          try {
            const { data: res } = await propiedadesService.getAll({ q: rif });
            const found = res.find((p: any) => p.rif === rif);
            if (found) {
              setRifConflict(found);
              toast.error(`Conflicto de RIF: Este RIF ya pertenece a la propiedad ${found.nombre}`);
              setIsCheckingProducer(false);
              return; // Bloqueamos el avance
            }
          } catch (error) {
            console.error('Error checking property RIF:', error);
          } finally {
            setIsCheckingProducer(false);
          }
        }
        setRifConflict(null);
      }

      setIsAdvancing(true);
      console.log('handleNext: Advancing from step', currentStep, 'to', Math.min(currentStep + 1, STEPS.length - 1));
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      // Prevenir doble clic accidental
      setTimeout(() => setIsAdvancing(false), 400);
    } else {
      console.log('handleNext: Step validation failed for step', currentStep);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onFinalSubmit = async (values: WizardValues) => {
    // Seguridad: Solo permitir el envío si estamos en el último paso
    if (currentStep !== STEPS.length - 1) return;

    setIsSubmitting(true);
    try {
      const submissionData: any = {
        nombre: values.nombre_propiedad,
        rif: values.rif_propiedad,
        punto_referencia: values.punto_referencia,
        hectareas_totales: parseFloat(values.hectareas_totales || '0'),
        tipo_propiedad_id: parseInt(values.tipo_propiedad_id),
        ubicacion: {
          sector_id: parseInt(values.sector_id),
          google_maps_url: values.google_maps_url || '',
        },
        hierro: values.num_reg_hierro ? {
          num_reg_hierro: values.num_reg_hierro,
          num_reg_ganadero: values.num_reg_ganadero,
        } : undefined,
        hierro_img: values.hierro_img?.[0], // Tomamos el primer archivo
      };

      // Enviamos siempre los datos del productor (el backend decidirá si crea o actualiza)
      submissionData.productor = {
        cedula_rif: values.cedula_rif,
        nombre: values.nombre_productor,
        codigo_runsai: values.codigo_runsai,
        telefono: values.telefono,
        email: values.email || undefined,
        direccion_fiscal: values.direccion_fiscal,
      };

      await createPropiedad(submissionData);

      toast.success('Inscripción completada exitosamente');
      reset();
      setHierroPreview(null);
      setCurrentStep(0);
      onClose(); // Cerramos el modal al terminar
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar la inscripción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTipo = async () => {
    if (!newTipoNombre.trim()) return;
    setCreatingTipo(true);
    try {
      await createTipo(newTipoNombre.trim());
      setNewTipoNombre('');
      setShowNewTipo(false);
    } finally {
      setCreatingTipo(false);
    }
  };

  const handleUpdateTipo = async (id: number) => {
    if (!editingTipoNombre.trim()) return;
    setUpdatingTipoId(id);
    try {
      await updateTipo({ id, nombre: editingTipoNombre.trim() });
      setEditingTipoId(null);
      setEditingTipoNombre('');
    } catch { } finally {
      setUpdatingTipoId(null);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    setDeletingTipoId(id);
    try {
      await deleteTipo(id);
    } catch { } finally {
      setDeletingTipoId(null);
    }
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
              <DialogTitle className="text-2xl font-bold">Registro Nacional de Productores</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Siga los pasos para formalizar la inscripción en el sistema.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pb-12">
          <Stepper steps={STEPS} currentStep={currentStep} />

          <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                // Si presionan enter, avanzamos de paso o guardamos si es el último
                if (currentStep < STEPS.length - 1 && !isCheckingProducer && !isAdvancing) {
                  handleNext();
                } else if (currentStep === STEPS.length - 1 && !isSubmitting) {
                  handleSubmit(onFinalSubmit)();
                }
              }
            }}
            className="mt-8"
          >
            <div
              key={currentStep}
              className="min-h-[350px] animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Identificación (Cédula/RIF) <span className="text-rose-500">*</span></label>
                      <Input {...register('cedula_rif')} placeholder="V-12345678-0" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                      {errors.cedula_rif && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.cedula_rif.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Nombre Completo / Razón Social <span className="text-rose-500">*</span></label>
                      <Input {...register('nombre_productor')} placeholder="Ej: Juan Pérez" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                      {errors.nombre_productor && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.nombre_productor.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Código RUNSAI</label>
                      <Input {...register('codigo_runsai')} placeholder="RUN-0000" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Teléfono</label>
                      <Input {...register('telefono')} placeholder="0412-0000000" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Email</label>
                      <Input {...register('email')} placeholder="productor@ejemplo.com" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                      {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Dirección Fiscal</label>
                    <Input {...register('direccion_fiscal')} placeholder="Calle, Av, Edificio, Ciudad..." className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                  </div>

                  {existingProducer && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <Check className="size-5 text-indigo-500" />
                      <div>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Productor Registrado</p>
                        <p className="text-[11px] text-indigo-500/80">Este productor ya está en el sistema como <strong>{existingProducer.nombre}</strong>. Puedes continuar para registrar una nueva propiedad asociada a su perfil.</p>
                      </div>
                    </div>
                  )}

                  {runsaiConflict && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="size-5 text-rose-500" />
                      <div>
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Código RUNSAI Duplicado</p>
                        <p className="text-[11px] text-rose-500/80">El código <strong>{watch('codigo_runsai')}</strong> ya está asignado a <strong>{runsaiConflict.nombre}</strong>. Por favor, verifique el código o asigne uno distinto.</p>
                      </div>
                    </div>
                  )}

                  {emailConflict && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="size-5 text-rose-500" />
                      <div>
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Correo Electrónico Duplicado</p>
                        <p className="text-[11px] text-rose-500/80">El correo <strong>{watch('email')}</strong> ya está registrado por <strong>{emailConflict.nombre}</strong>. Por favor, verifique el email para evitar suplantaciones.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  {rifConflict && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="size-5 text-rose-500" />
                      <div>
                        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">RIF de Propiedad Duplicado</p>
                        <p className="text-[11px] text-rose-500/80">El RIF <strong>{watch('rif_propiedad')}</strong> ya está registrado por la propiedad <strong>{rifConflict.nombre}</strong> (Duenio: {rifConflict.clientes?.nombre}). Por favor, verifique el RIF.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Nombre del Predio <span className="text-rose-500">*</span></label>
                      <Input {...register('nombre_propiedad')} placeholder="Hacienda La Esperanza" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                      {errors.nombre_propiedad && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.nombre_propiedad.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">RIF Propiedad</label>
                      <Input {...register('rif_propiedad')} placeholder="J-12345678-0" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Tipo de Propiedad <span className="text-rose-500">*</span></label>

                      {showNewTipo && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                          <Input
                            value={newTipoNombre}
                            onChange={(e) => setNewTipoNombre(e.target.value)}
                            placeholder="Nuevo tipo..."
                            className="h-9 rounded-lg text-sm border-primary/30 focus:border-primary"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTipo())}
                            autoFocus
                          />
                          <Button type="button" size="icon" disabled={creatingTipo || !newTipoNombre.trim()} onClick={handleCreateTipo} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                            {creatingTipo ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewTipo(false); setNewTipoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}

                      {editingTipoId !== null && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                          <Input
                            value={editingTipoNombre}
                            onChange={(e) => setEditingTipoNombre(e.target.value)}
                            placeholder="Editar tipo..."
                            className="h-9 rounded-lg text-sm border-blue-500/30 focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleUpdateTipo(editingTipoId); }
                              if (e.key === 'Escape') { setEditingTipoId(null); }
                            }}
                            autoFocus
                          />
                          <Button type="button" size="icon" disabled={!editingTipoNombre.trim() || updatingTipoId === editingTipoId} onClick={() => handleUpdateTipo(editingTipoId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                            {updatingTipoId === editingTipoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingTipoId(null); setEditingTipoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Select onValueChange={(val) => setValue('tipo_propiedad_id', val, { shouldValidate: true })} value={watch('tipo_propiedad_id') || ''}>
                          <SelectTrigger className={cn(
                            "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                            errors.tipo_propiedad_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                          )}>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent className="glass-effect border-border max-h-[250px] min-w-(--radix-select-trigger-width)" position="popper" sideOffset={2}>
                            {tipos.map((tipo) => (
                              <div key={tipo.id} className="group relative flex items-center">
                                <SelectItem value={tipo.id.toString()} className="cursor-pointer flex-1 pr-20">
                                  {tipo.nombre}
                                </SelectItem>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                                  <button type="button" disabled={deletingTipoId === tipo.id} onClick={(e) => { e.stopPropagation(); setEditingTipoId(tipo.id); setEditingTipoNombre(tipo.nombre); setShowNewTipo(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50" title="Editar tipo">
                                    <Pencil className="size-3" />
                                  </button>
                                  <button type="button" disabled={deletingTipoId === tipo.id} onClick={(e) => { e.stopPropagation(); handleDeleteTipo(tipo.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50" title="Eliminar tipo">
                                    {deletingTipoId === tipo.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewTipo(!showNewTipo); setEditingTipoId(null); }} className="size-12 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer" title="Crear nuevo tipo">
                          <Plus className="size-5" />
                        </Button>
                      </div>
                      {errors.tipo_propiedad_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.tipo_propiedad_id.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Hectáreas Totales</label>
                      <Input {...register('hectareas_totales')} type="number" step="0.01" className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Punto de Referencia</label>
                    <Textarea {...register('punto_referencia')} placeholder="Ej: Frente a la escuela, portón verde..." className="min-h-20 rounded-xl bg-muted/10 border-border focus:bg-background resize-none" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Estado <span className="text-rose-500">*</span></label>
                      <Select onValueChange={(val) => setValue('estado_id', val, { shouldValidate: true })} value={watch('estado_id') || ''}>
                        <SelectTrigger className={cn(
                          "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                          errors.estado_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                        )}>
                          <SelectValue placeholder="Seleccione Estado" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper" sideOffset={2}>
                          {estados.map(e => <SelectItem key={e.id} value={e.id.toString()} className="cursor-pointer">{e.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.estado_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.estado_id.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Municipio <span className="text-rose-500">*</span></label>
                      <Select onValueChange={(val) => setValue('municipio_id', val, { shouldValidate: true })} value={watch('municipio_id') || ''} disabled={!selectedEstado}>
                        <SelectTrigger className={cn(
                          "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                          errors.municipio_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500",
                          !selectedEstado && "opacity-50 cursor-not-allowed"
                        )}>
                          <SelectValue placeholder="Seleccione Municipio" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper" sideOffset={2}>
                          {municipios.map(m => <SelectItem key={m.id} value={m.id.toString()} className="cursor-pointer">{m.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.municipio_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.municipio_id.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Parroquia <span className="text-rose-500">*</span></label>
                      <Select onValueChange={(val) => setValue('parroquia_id', val, { shouldValidate: true })} value={watch('parroquia_id') || ''} disabled={!selectedMunicipio}>
                        <SelectTrigger className={cn(
                          "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                          errors.parroquia_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500",
                          !selectedMunicipio && "opacity-50 cursor-not-allowed"
                        )}>
                          <SelectValue placeholder="Seleccione Parroquia" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper" sideOffset={2}>
                          {parroquias.map(p => <SelectItem key={p.id} value={p.id.toString()} className="cursor-pointer">{p.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.parroquia_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.parroquia_id.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Sector <span className="text-rose-500">*</span></label>
                      <Select onValueChange={(val) => setValue('sector_id', val, { shouldValidate: true })} value={watch('sector_id') || ''} disabled={!selectedParroquia}>
                        <SelectTrigger className={cn(
                          "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                          errors.sector_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500",
                          !selectedParroquia && "opacity-50 cursor-not-allowed"
                        )}>
                          <SelectValue placeholder="Seleccione Sector" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border" position="popper" sideOffset={2}>
                          {sectores.map(s => <SelectItem key={s.id} value={s.id.toString()} className="cursor-pointer">{s.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.sector_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.sector_id.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Google Maps URL</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <MapPin className="size-4" />
                      </div>
                      <Input
                        {...register('google_maps_url')}
                        placeholder="https://www.google.com/maps/..."
                        className="h-12 pl-11 rounded-xl bg-muted/10 border-border focus:bg-background transition-all"
                      />
                    </div>
                    {errors.google_maps_url && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.google_maps_url.message}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-6">
                    <div className="flex items-center gap-3 mb-4 text-primary font-bold uppercase tracking-widest text-xs">
                      <Fingerprint className="size-4" /> Registro de Hierro Ganadero
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Nº Registro de Hierro</label>
                        <Input {...register('num_reg_hierro')} placeholder="H-000000" className="h-12 rounded-xl bg-background border-border" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Nº Registro Ganadero</label>
                        <Input {...register('num_reg_ganadero')} placeholder="G-000000" className="h-12 rounded-xl bg-background border-border" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Imagen del Hierro</label>
                    <div
                      className={cn(
                        "relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center p-4",
                        hierroPreview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/5"
                      )}
                      onClick={() => document.getElementById('hierro-upload')?.click()}
                    >
                      {hierroPreview ? (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border border-border">
                          <img src={hierroPreview} alt="Vista previa del hierro" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Upload className="size-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="size-12 rounded-full bg-muted/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon className="size-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium">Click para subir diseño del hierro</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">JPG, PNG o SVG (Máx. 2MB)</p>
                        </>
                      )}
                      <input
                        id="hierro-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setValue('hierro_img', e.target.files);
                            const reader = new FileReader();
                            reader.onloadend = () => setHierroPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50">
              <Button type="button" variant="ghost" onClick={currentStep === 0 ? onClose : handleBack} className="h-12 px-6 rounded-xl font-bold cursor-pointer">
                {currentStep === 0 ? 'Cancelar' : <><ChevronLeft className="mr-2 size-4" /> Anterior</>}
              </Button>

              <Button
                type="button"
                onClick={currentStep < STEPS.length - 1 ? handleNext : handleSubmit(onFinalSubmit)}
                disabled={isSubmitting || !isStepValid() || isCheckingProducer || isAdvancing}
                className={cn(
                  "h-12 px-8 rounded-xl font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
                  currentStep < STEPS.length - 1 ? "shadow-primary/20" : "px-10 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando...</>
                ) : isCheckingProducer || isAdvancing ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> {isCheckingProducer ? 'Verificando...' : 'Cargando...'}</>
                ) : currentStep < STEPS.length - 1 ? (
                  <>Siguiente <ChevronRight className="ml-2 size-4" /></>
                ) : (
                  <><Check className="mr-2 size-4" /> Finalizar Inscripción</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
