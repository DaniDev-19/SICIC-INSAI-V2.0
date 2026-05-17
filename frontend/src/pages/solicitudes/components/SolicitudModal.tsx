import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { Solicitud, TipoSolicitud } from '@/types/solicitudes';
import { FileText, Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSolicitudes } from '@/hooks/use-solicitudes';
import { clientesService } from '@/services/clientes.service';
import { propiedadesService } from '@/services/propiedades.service';
import type { Cliente } from '@/types/clientes';
import type { Propiedad } from '@/types/propiedades';

const solicitudSchema = z.object({
  codigo: z.string().optional(),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  fecha_resolucion: z.string().nullable().optional(),
  estatus: z.string().optional(),
  prioridad: z.string().optional(),
  medio_recepcion: z.string().optional(),
  tipo_solicitud_id: z.string().min(1, 'El tipo de solicitud es requerido'),
  solicitante_id: z.string().min(1, 'El solicitante es requerido'),
  propiedad_id: z.string().min(1, 'La propiedad es requerida'),
  atendido_por_id: z.string().nullable().optional(),
});

type SolicitudFormValues = z.infer<typeof solicitudSchema>;

interface SolicitudModalProps {
  isOpen: boolean;
  onClose: () => void;
  solicitud?: Solicitud | null;
  tipos: TipoSolicitud[];
  onCreateTipo?: (nombre: string) => Promise<any>;
  onUpdateTipo?: (args: { id: number; nombre: string }) => Promise<any>;
  onDeleteTipo?: (id: number) => Promise<any>;
}

export function SolicitudModal({
  isOpen,
  onClose,
  solicitud,
  tipos,
  onCreateTipo,
  onUpdateTipo,
  onDeleteTipo,
}: SolicitudModalProps) {
  const { createSolicitud, updateSolicitud, isCreating, isUpdating } = useSolicitudes();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      codigo: '',
      descripcion: '',
      fecha_resolucion: '',
      estatus: 'CREADA',
      prioridad: 'MEDIA',
      medio_recepcion: 'PRESENCIAL',
      tipo_solicitud_id: '',
      solicitante_id: '',
      propiedad_id: '',
      atendido_por_id: '',
    },
  });

  const selectedClienteId = watch('solicitante_id');
  const isLoading = isCreating || isUpdating;

  // Inline types management state
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [creatingTipo, setCreatingTipo] = useState(false);
  const [editingTipoId, setEditingTipoId] = useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = useState('');
  const [updatingTipoId, setUpdatingTipoId] = useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setIsLoadingRelated(true);
        const [clientesRes, propiedadesRes] = await Promise.all([
          clientesService.getAll({ limit: 1000 }),
          propiedadesService.getAll({ limit: 1000 })
        ]);
        setClientes(clientesRes.data || []);
        setPropiedades(propiedadesRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    if (isOpen) {
      fetchBaseData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (solicitud) {
      reset({
        codigo: solicitud.codigo || '',
        descripcion: solicitud.descripcion,
        fecha_resolucion: solicitud.fecha_resolucion ? solicitud.fecha_resolucion.split('T')[0] : '',
        estatus: solicitud.estatus,
        prioridad: solicitud.prioridad,
        medio_recepcion: solicitud.medio_recepcion,
        tipo_solicitud_id: solicitud.tipo_solicitud_id.toString(),
        solicitante_id: solicitud.solicitante_id.toString(),
        propiedad_id: solicitud.propiedad_id.toString(),
        atendido_por_id: solicitud.atendido_por_id?.toString() || '',
      });
    } else {
      reset({
        codigo: '',
        descripcion: '',
        fecha_resolucion: '',
        estatus: 'CREADA',
        prioridad: 'MEDIA',
        medio_recepcion: 'PRESENCIAL',
        tipo_solicitud_id: '',
        solicitante_id: '',
        propiedad_id: '',
        atendido_por_id: '',
      });
    }
    setShowNewTipo(false);
    setEditingTipoId(null);
  }, [solicitud, reset, isOpen]);

  const handleFormSubmit = async (values: SolicitudFormValues) => {
    const cleanData = {
      ...values,
      tipo_solicitud_id: parseInt(values.tipo_solicitud_id),
      solicitante_id: parseInt(values.solicitante_id),
      propiedad_id: parseInt(values.propiedad_id),
      atendido_por_id: values.atendido_por_id ? parseInt(values.atendido_por_id) : null,
      fecha_resolucion: values.fecha_resolucion || null,
    };

    if (solicitud) {
      await updateSolicitud({ id: solicitud.id, data: cleanData as any });
    } else {
      await createSolicitud(cleanData as any);
    }
    onClose();
  };

  const handleCreateTipo = async () => {
    if (!newTipoNombre.trim() || !onCreateTipo) return;
    setCreatingTipo(true);
    try {
      await onCreateTipo(newTipoNombre.trim());
      setNewTipoNombre('');
      setShowNewTipo(false);
    } finally {
      setCreatingTipo(false);
    }
  };

  const handleUpdateTipo = async (id: number) => {
    if (!editingTipoNombre.trim() || !onUpdateTipo) return;
    setUpdatingTipoId(id);
    try {
      await onUpdateTipo({ id, nombre: editingTipoNombre.trim() });
      setEditingTipoId(null);
      setEditingTipoNombre('');
    } catch { /* error handled by hook */ } finally {
      setUpdatingTipoId(null);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    if (!onDeleteTipo) return;
    setDeletingTipoId(id);
    try {
      await onDeleteTipo(id);
    } catch { /* error handled by hook */ } finally {
      setDeletingTipoId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-160 border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <FileText className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {solicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {solicitud ? `Expediente: ${solicitud.codigo}` : 'Registra una nueva solicitud de inspección'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">

            {/* Seccion 1: Identificación */}
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">
                  Solicitante <span className="text-rose-500">*</span>
                </label>
                <Select
                  onValueChange={(val) => {
                    setValue('solicitante_id', val, { shouldValidate: true });
                    const props = propiedades.filter(p => p.due_o_id === parseInt(val));
                    if (props.length === 1) {
                      setValue('propiedad_id', props[0].id.toString(), { shouldValidate: true });
                    } else if (props.length === 0) {
                      setValue('propiedad_id', '', { shouldValidate: true });
                    }
                  }}
                  value={watch('solicitante_id')}
                >
                  <SelectTrigger className={cn(
                    "cursor-pointer w-full h-12 rounded-xl bg-muted/10 border-border focus:bg-background transition-all",
                    errors.solicitante_id && "border-rose-500/50"
                  )}>
                    <SelectValue placeholder="Seleccionar Cliente" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-bold">{c.nombre}</span>
                          <span className="text-[10px] text-muted-foreground">{c.cedula_rif}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.solicitante_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.solicitante_id.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">
                  Propiedad / Predio <span className="text-rose-500">*</span>
                </label>
                <Select
                  onValueChange={(val) => {
                    setValue('propiedad_id', val, { shouldValidate: true });
                    const prop = propiedades.find(p => p.id === parseInt(val));
                    if (prop && prop.due_o_id) {
                      setValue('solicitante_id', prop.due_o_id.toString(), { shouldValidate: true });
                    }
                  }}
                  value={watch('propiedad_id')}
                  disabled={propiedades.length === 0}
                >
                  <SelectTrigger className={cn(
                    "cursor-pointer w-full h-12 rounded-xl bg-muted/10 border-border focus:bg-background transition-all",
                    errors.propiedad_id && "border-rose-500/50"
                  )}>
                    <SelectValue placeholder={propiedades.length === 0 ? "Sin propiedades registradas" : "Seleccionar Propiedad"} />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    {(selectedClienteId ? propiedades.filter(p => p.due_o_id === parseInt(selectedClienteId)) : propiedades).map(p => (
                      <SelectItem key={p.id} value={p.id.toString()} className="cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-bold">{p.nombre}</span>
                          {p.codigo_insai && <span className="text-[10px] text-muted-foreground">{p.codigo_insai}</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.propiedad_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.propiedad_id.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">
                  Tipo de Solicitud <span className="text-rose-500">*</span>
                </label>

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
                    <Button
                      type="button"
                      size="icon"
                      disabled={creatingTipo || !newTipoNombre.trim()}
                      onClick={handleCreateTipo}
                      className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer"
                    >
                      {creatingTipo ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => { setShowNewTipo(false); setNewTipoNombre(''); }}
                      className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                    >
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
                    <Button
                      type="button"
                      size="icon"
                      disabled={!editingTipoNombre.trim() || updatingTipoId === editingTipoId}
                      onClick={() => handleUpdateTipo(editingTipoId)}
                      className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                    >
                      {updatingTipoId === editingTipoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEditingTipoId(null); setEditingTipoNombre(''); }}
                      className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select onValueChange={(val) => setValue('tipo_solicitud_id', val, { shouldValidate: true })} value={watch('tipo_solicitud_id')}>
                    <SelectTrigger className={cn(
                      "cursor-pointer flex-1 h-12 rounded-xl bg-muted/10 border-border focus:bg-background transition-all",
                      errors.tipo_solicitud_id && "border-rose-500/50"
                    )}>
                      <SelectValue placeholder="Seleccionar Tipo" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect max-h-62.5 min-w-var(--radix-select-trigger-width)" position="popper" sideOffset={2}>
                      {tipos.map(t => (
                        <div key={t.id} className="group relative flex items-center">
                          <SelectItem value={t.id.toString()} className="cursor-pointer flex-1 pr-20">
                            {t.nombre}
                          </SelectItem>
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                            <button
                              type="button"
                              disabled={deletingTipoId === t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTipoId(t.id);
                                setEditingTipoNombre(t.nombre);
                                setShowNewTipo(false);
                              }}
                              className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                              title="Editar tipo"
                            >
                              <Pencil className="size-3" />
                            </button>
                            <button
                              type="button"
                              disabled={deletingTipoId === t.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTipo(t.id);
                              }}
                              className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                              title="Eliminar tipo"
                            >
                              {deletingTipoId === t.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setShowNewTipo(!showNewTipo); setEditingTipoId(null); }}
                    className="size-12 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                    title="Crear nuevo tipo"
                  >
                    <Plus className="size-5" />
                  </Button>
                </div>
                {errors.tipo_solicitud_id && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.tipo_solicitud_id.message}</p>}
              </div>
            </div>

            {/* Seccion 2: Detalles y Estado */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Prioridad</label>
                  <Select onValueChange={(val) => setValue('prioridad', val)} value={watch('prioridad')}>
                    <SelectTrigger className=" cursor-pointer w-full h-12 rounded-xl bg-muted/10 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="BAJA" className="cursor-pointer">Baja</SelectItem>
                      <SelectItem value="MEDIA" className="cursor-pointer">Media</SelectItem>
                      <SelectItem value="ALTA" className="cursor-pointer">Alta</SelectItem>
                      <SelectItem value="URGENTE" className="cursor-pointer text-rose-500 font-bold">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Recepción</label>
                  <Select onValueChange={(val) => setValue('medio_recepcion', val)} value={watch('medio_recepcion')}>
                    <SelectTrigger className="cursor-pointer w-full h-12 rounded-xl bg-muted/10 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="PRESENCIAL" className="cursor-pointer">Presencial</SelectItem>
                      <SelectItem value="WEB" className="cursor-pointer">Web</SelectItem>
                      <SelectItem value="TELEFONO" className="cursor-pointer">Teléfono</SelectItem>
                      <SelectItem value="CORREO" className="cursor-pointer">Correo</SelectItem>
                      <SelectItem value="OFICIO" className="cursor-pointer">Oficio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Estado Actual</label>
                <Select onValueChange={(val) => setValue('estatus', val)} value={watch('estatus')}>
                  <SelectTrigger className="cursor-pointer w-full h-12 rounded-xl bg-muted/10 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-48">
                    <SelectItem value="CREADA" className="cursor-pointer">Creada</SelectItem>
                    <SelectItem value="DIAGNOSTICADA" className="cursor-pointer">Diagnosticada</SelectItem>
                    <SelectItem value="PLANIFICADA" className="cursor-pointer">Planificada</SelectItem>
                    <SelectItem value="INSPECCIONANDO" className="cursor-pointer">Inspeccionando</SelectItem>
                    <SelectItem value="FINALIZADA" className="cursor-pointer">Finalizada</SelectItem>
                    <SelectItem value="NO_APROBADA" className="cursor-pointer">No Aprobada</SelectItem>
                    <SelectItem value="SEGUIMIENTO" className="cursor-pointer">Seguimiento</SelectItem>
                    <SelectItem value="CUARENTENA" className="cursor-pointer">Cuarentena</SelectItem>
                    <SelectItem value="NO_ATENDIDA" className="cursor-pointer">No Atendida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">Fecha Estimada Resolución</label>
                <Input
                  type="date"
                  {...register('fecha_resolucion')}
                  className="h-12 rounded-xl bg-muted/10 border-border focus:bg-background transition-all"
                />
              </div>
            </div>

            {/* Descripcion full width */}
            <div className="md:col-span-2 space-y-2 p-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">
                Descripción Detallada <span className="text-rose-500">*</span>
              </label>
              <Textarea
                {...register('descripcion')}
                placeholder="Indique el motivo de la solicitud y detalles relevantes..."
                className={cn(
                  "min-h-24 rounded-xl bg-muted/10 border-border focus:bg-background transition-all resize-none",
                  errors.descripcion && "border-rose-500/50"
                )}
              />
              {errors.descripcion && <p className="text-[10px] text-rose-500 font-bold uppercase pl-1">{errors.descripcion.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingRelated} className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all font-bold cursor-pointer">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
              ) : (
                solicitud ? 'Actualizar Solicitud' : 'Registrar Solicitud'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
