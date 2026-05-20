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
  Calendar,
  Users,
  User,
  ExternalLink,
  Activity,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientes } from '@/hooks/use-clientes';
import { useSolicitudes } from '@/hooks/use-solicitudes';
import { useEmpleados } from '@/hooks/use-empleados';
import { useVehiculos } from '@/hooks/use-vehiculos';

const wizardSchema = z.object({
  // Step 1: Existing Producer
  solicitante_id: z.string().min(1, 'El productor es requerido'),

  // Step 2: Existing Property
  propiedad_id: z.string().min(1, 'El predio rural es requerido'),

  // Step 3: Solicitud Details
  tipo_solicitud_id: z.string().min(1, 'El tipo de solicitud es requerido'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE']),
  medio_recepcion: z.enum(['WEB', 'TELEFONO', 'PRESENCIAL', 'CORREO', 'OFICIO']),

  // Step 4: Planificación (Obligatoria)
  fecha_programada: z.string().min(1, 'La fecha programada es requerida'),
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

  // Step 5: Assigned Employees (Obligatorio)
  empleados: z.array(z.number()).min(1, 'Debe asignar al menos un inspector técnico'),
});

type WizardValues = z.infer<typeof wizardSchema>;

interface SolicitudWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialFechaProgramada?: string;
}

const STEPS = [
  { title: 'Productor', description: 'Origen del trámite' },
  { title: 'Propiedad', description: 'Predio a inspeccionar' },
  { title: 'Solicitud', description: 'Detalles del trámite' },
  { title: 'Planificación', description: 'Agenda de visita' },
  { title: 'Personal', description: 'Técnicos asignados' },
];

export function SolicitudWizard({ isOpen, onClose, initialFechaProgramada }: SolicitudWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Solicitud types management state
  const [showNewSolicitudTipo, setShowNewSolicitudTipo] = useState(false);
  const [newSolicitudTipoNombre, setNewSolicitudTipoNombre] = useState('');
  const [creatingSolicitudTipo, setCreatingSolicitudTipo] = useState(false);
  const [editingSolicitudTipoId, setEditingSolicitudTipoId] = useState<number | null>(null);
  const [editingSolicitudTipoNombre, setEditingSolicitudTipoNombre] = useState('');
  const [updatingSolicitudTipoId, setUpdatingSolicitudTipoId] = useState<number | null>(null);
  const [deletingSolicitudTipoId, setDeletingSolicitudTipoId] = useState<number | null>(null);

  // Existing hooks
  const { clientes, setSearch: setClientesSearch } = useClientes('', 50);
  const { 
    tipos: solicitudTipos, 
    createSolicitud,
    createTipo: createSolicitudTipo,
    updateTipo: updateSolicitudTipo,
    deleteTipo: deleteSolicitudTipo
  } = useSolicitudes();
  const { empleados, setLimit: setEmpleadosLimit } = useEmpleados();
  const { vehiculos } = useVehiculos();

  const [isAdvancing, setIsAdvancing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema) as any,
    defaultValues: {
      solicitante_id: '',
      propiedad_id: '',
      tipo_solicitud_id: '',
      descripcion: '',
      prioridad: 'MEDIA',
      medio_recepcion: 'PRESENCIAL',
      prioridad_plan: 'MEDIA',
      empleados: [],
    }
  });

  useEffect(() => {
    if (isOpen) {
      setEmpleadosLimit(100);
      if (initialFechaProgramada) {
        setValue('fecha_programada', initialFechaProgramada);
      } else {
        setValue('fecha_programada', '');
      }
    }
  }, [isOpen, setEmpleadosLimit, initialFechaProgramada, setValue]);

  const selectedClient = watch('solicitante_id');
  const programarInmediato = true;
  const selectedEmpleados = watch('empleados') || [];

  // Retrieve properties for selected client
  const selectedClientObj = clientes.find(c => c.id.toString() === selectedClient);
  const clientProperties = selectedClientObj?.propiedades || [];

  // Reset property if client changes
  useEffect(() => {
    setValue('propiedad_id', '');
  }, [selectedClient, setValue]);

  const isStepValid = () => {
    const values = watch();
    if (currentStep === 0) {
      return !!values.solicitante_id;
    }
    if (currentStep === 1) {
      return !!values.propiedad_id;
    }
    if (currentStep === 2) {
      return !!values.tipo_solicitud_id && (values.descripcion?.length || 0) >= 10;
    }
    if (currentStep === 3) {
      return !!values.fecha_programada;
    }
    if (currentStep === 4) {
      return selectedEmpleados.length > 0;
    }
    return true;
  };

  const handleNext = async () => {
    const fieldsByStep: (keyof WizardValues)[][] = [
      ['solicitante_id'],
      ['propiedad_id'],
      ['tipo_solicitud_id', 'descripcion', 'prioridad', 'medio_recepcion'],
      ['fecha_programada', 'hora_inicio', 'hora_fin', 'prioridad_plan', 'actividad', 'objetivo', 'vehiculo_id'],
      ['empleados']
    ];

    const isStepValidRes = await trigger(fieldsByStep[currentStep] as any);
    if (isStepValidRes) {
      setIsAdvancing(true);
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      setTimeout(() => setIsAdvancing(false), 300);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onFinalSubmit = async (values: WizardValues) => {
    setIsSubmitting(true);
    try {
      const finalClientId = parseInt(values.solicitante_id);
      const finalPropertyId = parseInt(values.propiedad_id);

      // 2. Build the Solicitud payload
      const payload: any = {
        solicitante_id: finalClientId,
        propiedad_id: finalPropertyId,
        tipo_solicitud_id: parseInt(values.tipo_solicitud_id),
        descripcion: values.descripcion,
        prioridad: values.prioridad,
        medio_recepcion: values.medio_recepcion,
      };

      // 3. Build Planificación if scheduled
      if (values.fecha_programada) {
        payload.planificacion = {
          fecha_programada: values.fecha_programada,
          hora_inicio: values.hora_inicio || undefined,
          hora_fin: values.hora_fin || undefined,
          prioridad: values.prioridad_plan || values.prioridad,
          actividad: values.actividad || undefined,
          objetivo: values.objetivo || undefined,
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
      toast.error(error.response?.data?.message || 'Error al procesar el trámite');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Solicitud types management methods
  const handleCreateSolicitudTipo = async () => {
    if (!newSolicitudTipoNombre.trim()) return;
    setCreatingSolicitudTipo(true);
    try {
      await createSolicitudTipo(newSolicitudTipoNombre.trim());
      setNewSolicitudTipoNombre('');
      setShowNewSolicitudTipo(false);
    } finally {
      setCreatingSolicitudTipo(false);
    }
  };

  const handleUpdateSolicitudTipo = async (id: number) => {
    if (!editingSolicitudTipoNombre.trim()) return;
    setUpdatingSolicitudTipoId(id);
    try {
      await updateSolicitudTipo({ id, nombre: editingSolicitudTipoNombre.trim() });
      setEditingSolicitudTipoId(null);
      setEditingSolicitudTipoNombre('');
    } catch { } finally {
      setUpdatingSolicitudTipoId(null);
    }
  };

  const handleDeleteSolicitudTipo = async (id: number) => {
    setDeletingSolicitudTipoId(id);
    try {
      await deleteSolicitudTipo(id);
    } catch { } finally {
      setDeletingSolicitudTipoId(null);
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
          {/* Stepper with dynamic slides depending on planning */}
          <Stepper 
            steps={programarInmediato ? STEPS : STEPS.slice(0, 3)} 
            currentStep={currentStep} 
          />

          <form onSubmit={(e) => e.preventDefault()} className="mt-8">
            <div key={currentStep} className="min-h-[350px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* PASO 1: PRODUCTOR */}
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

                  {/* Tarjeta de detalles del Productor seleccionado */}
                  {selectedClientObj && (
                    <div className="p-5 rounded-2xl border border-primary/10 bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                      <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                        <User className="size-5 text-primary shrink-0" />
                        <span className="text-xs font-black uppercase text-primary tracking-widest">Información del Productor Seleccionado</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-semibold text-muted-foreground block">Nombre Completo:</span>
                          <span className="text-foreground font-bold text-sm">{selectedClientObj.nombre}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block">Cédula / RIF:</span>
                          <span className="text-foreground font-bold text-sm">{selectedClientObj.cedula_rif}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block">Código RUNSAI:</span>
                          <span className="text-foreground font-bold">{selectedClientObj.codigo_runsai || '—'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-muted-foreground block">Teléfono / Contacto:</span>
                          <span className="text-foreground font-bold">{selectedClientObj.telefono || '—'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-semibold text-muted-foreground block">Correo Electrónico:</span>
                          <span className="text-foreground font-bold">{selectedClientObj.email || '—'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-semibold text-muted-foreground block">Dirección Fiscal:</span>
                          <span className="text-foreground font-medium leading-relaxed">{selectedClientObj.direccion_fiscal || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 2: PROPIEDAD / PREDIO */}
              {currentStep === 1 && (
                <div className="space-y-6">
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
                            {p.nombre} {p.rif ? `(${p.rif})` : ''}
                          </SelectItem>
                        ))}
                        {selectedClient && clientProperties.length === 0 && (
                          <div className="p-3 text-center text-xs text-muted-foreground">El productor seleccionado no posee predios registrados</div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.propiedad_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.propiedad_id.message}</p>}
                  </div>

                  {/* Tarjeta de detalles de la Propiedad seleccionada */}
                  {selectedClientObj && watch('propiedad_id') && (() => {
                    const selectedPropId = watch('propiedad_id');
                    const selectedPropertyObj = clientProperties.find((p: any) => p.id.toString() === selectedPropId);
                    if (!selectedPropertyObj) return null;
                    return (
                      <div className="p-5 rounded-2xl border border-primary/10 bg-primary/5 space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                        <div className="flex items-center gap-3 border-b border-primary/10 pb-2">
                          <MapPin className="size-5 text-primary shrink-0" />
                          <span className="text-xs font-black uppercase text-primary tracking-widest">Detalles del Predio Rural Seleccionado</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-semibold text-muted-foreground block">Nombre del Predio:</span>
                            <span className="text-foreground font-bold text-sm">{selectedPropertyObj.nombre}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground block">RIF / Registro:</span>
                            <span className="text-foreground font-bold text-sm">{selectedPropertyObj.rif || '—'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground block">Área Total (Hectáreas):</span>
                            <span className="text-foreground font-bold">{selectedPropertyObj.hectareas_totales} ha</span>
                          </div>
                          <div>
                            <span className="font-semibold text-muted-foreground block">Tipo de Propiedad:</span>
                            <span className="text-foreground font-bold">{selectedPropertyObj.tipo_propiedad?.nombre || selectedPropertyObj.t_propiedad?.nombre || '—'}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-semibold text-muted-foreground block">Ubicación Geográfica:</span>
                            <span className="text-foreground font-bold">
                              {(() => {
                                const ubic = selectedPropertyObj.propiedad_ubicacion?.[0];
                                const sector = ubic?.sectores?.nombre || selectedPropertyObj.sector?.nombre || 'Sector N/A';
                                const parroquia = ubic?.sectores?.parroquias?.nombre || selectedPropertyObj.parroquia?.nombre || '';
                                const municipio = ubic?.sectores?.parroquias?.municipios?.nombre || selectedPropertyObj.parroquia?.municipio?.nombre || '';
                                const estado = ubic?.sectores?.parroquias?.municipios?.estados?.nombre || selectedPropertyObj.parroquia?.municipio?.estado?.nombre || '';
                                if (!parroquia && !municipio && !estado) return sector;
                                return `${estado} / ${municipio} / ${parroquia} / ${sector}`;
                              })()}
                            </span>
                          </div>
                          {selectedPropertyObj.punto_referencia && (
                            <div className="md:col-span-2">
                              <span className="font-semibold text-muted-foreground block">Punto de Referencia:</span>
                              <span className="text-foreground font-medium leading-relaxed">{selectedPropertyObj.punto_referencia}</span>
                            </div>
                          )}
                          {(selectedPropertyObj.google_maps_url || selectedPropertyObj.propiedad_ubicacion?.[0]?.google_maps_url) && (
                            <div className="md:col-span-2">
                              <span className="font-semibold text-muted-foreground block">Ubicación Satelital:</span>
                              <a
                                href={selectedPropertyObj.google_maps_url || selectedPropertyObj.propiedad_ubicacion?.[0]?.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline font-bold inline-flex items-center gap-1 mt-1"
                              >
                                Ver en Google Maps <ExternalLink className="size-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* PASO 3: DETALLES DE LA SOLICITUD */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Tipo de Requerimiento <span className="text-rose-500">*</span></label>
                      
                      {showNewSolicitudTipo && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                          <Input
                            value={newSolicitudTipoNombre}
                            onChange={(e) => setNewSolicitudTipoNombre(e.target.value)}
                            placeholder="Nuevo tipo de solicitud..."
                            className="h-9 rounded-lg text-sm border-primary/30 focus:border-primary"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSolicitudTipo())}
                            autoFocus
                          />
                          <Button type="button" size="icon" disabled={creatingSolicitudTipo || !newSolicitudTipoNombre.trim()} onClick={handleCreateSolicitudTipo} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                            {creatingSolicitudTipo ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewSolicitudTipo(false); setNewSolicitudTipoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}

                      {editingSolicitudTipoId !== null && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                          <Input
                            value={editingSolicitudTipoNombre}
                            onChange={(e) => setEditingSolicitudTipoNombre(e.target.value)}
                            placeholder="Editar tipo..."
                            className="h-9 rounded-lg text-sm border-blue-500/30 focus:border-blue-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleUpdateSolicitudTipo(editingSolicitudTipoId); }
                              if (e.key === 'Escape') { setEditingSolicitudTipoId(null); }
                            }}
                            autoFocus
                          />
                          <Button type="button" size="icon" disabled={!editingSolicitudTipoNombre.trim() || updatingSolicitudTipoId === editingSolicitudTipoId} onClick={() => handleUpdateSolicitudTipo(editingSolicitudTipoId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                            {updatingSolicitudTipoId === editingSolicitudTipoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingSolicitudTipoId(null); setEditingSolicitudTipoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                            <X className="size-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Select onValueChange={(val) => setValue('tipo_solicitud_id', val, { shouldValidate: true })} value={watch('tipo_solicitud_id') || ''}>
                          <SelectTrigger className={cn(
                            "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                            errors.tipo_solicitud_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                          )}>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent className="glass-effect border-border max-h-[250px]" position="popper">
                            {solicitudTipos.map((tipo) => (
                              <div key={tipo.id} className="group relative flex items-center">
                                <SelectItem value={tipo.id.toString()} className="cursor-pointer flex-1 pr-20">
                                  {tipo.nombre}
                                </SelectItem>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                                  <button type="button" disabled={deletingSolicitudTipoId === tipo.id} onClick={(e) => { e.stopPropagation(); setEditingSolicitudTipoId(tipo.id); setEditingSolicitudTipoNombre(tipo.nombre); setShowNewSolicitudTipo(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50" title="Editar tipo">
                                    <Pencil className="size-3" />
                                  </button>
                                  <button type="button" disabled={deletingSolicitudTipoId === tipo.id} onClick={(e) => { e.stopPropagation(); handleDeleteSolicitudTipo(tipo.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50" title="Eliminar tipo">
                                    {deletingSolicitudTipoId === tipo.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewSolicitudTipo(!showNewSolicitudTipo); setEditingSolicitudTipoId(null); }} className="size-12 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer" title="Crear nuevo tipo">
                          <Plus className="size-5" />
                        </Button>
                      </div>
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

                    <div className="pt-2 pl-4">
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-primary uppercase tracking-wider block mb-1">
                            Agenda de Campo Integrada
                          </span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Este asistente registrará de forma conjunta la solicitud y la planificación de visita técnica con el equipo inspector en los siguientes pasos.
                          </p>
                        </div>
                      </div>
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

              {/* PASO 4: PLANIFICACIÓN DE LA VISITA */}
              {currentStep === 3 && programarInmediato && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mb-2">
                    <div className="flex items-center gap-3 mb-4 text-primary font-bold uppercase tracking-widest text-xs">
                      <Calendar className="size-4" /> Configuración de Agenda de Campo
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

              {/* PASO 5: EQUIPO INSPECTOR */}
              {currentStep === 4 && programarInmediato && (
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
                onClick={currentStep === (programarInmediato ? STEPS.length - 1 : 2) ? handleSubmit(onFinalSubmit) : handleNext}
                disabled={isSubmitting || !isStepValid() || isAdvancing}
                className={cn(
                  "h-12 px-8 rounded-xl font-bold shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white bg-primary",
                  currentStep === (programarInmediato ? STEPS.length - 1 : 2)
                    ? "px-10 font-black bg-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/95" 
                    : "shadow-primary/20"
                )}
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Procesando...</>
                ) : isAdvancing ? (
                  <><Loader2 className="mr-2 size-4 animate-spin" /> Cargando...</>
                ) : currentStep === (programarInmediato ? STEPS.length - 1 : 2) ? (
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
