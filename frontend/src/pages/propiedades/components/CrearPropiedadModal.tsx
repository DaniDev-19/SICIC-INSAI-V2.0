import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  User,
  UserCheck,
  MapPin,
  Home,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
  Phone,
  Mail,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePropiedades } from '@/hooks/use-propiedades';
import { clientesService } from '@/services/clientes.service';
import { ubicacionService, type UbicacionBase } from '@/services/ubicacion.service';
import type { Cliente } from '@/types/clientes';

const propertyFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  codigo_insai: z.string().optional(),
  rif: z.string().optional(),
  hectareas_totales: z.string().optional(),
  tipo_propiedad_id: z.string().min(1, 'Selecciona un tipo de propiedad'),
  estado_id: z.string().min(1, 'Selecciona un estado'),
  municipio_id: z.string().min(1, 'Selecciona un municipio'),
  parroquia_id: z.string().min(1, 'Selecciona una parroquia'),
  sector_id: z.string().min(1, 'Selecciona un sector'),
  punto_referencia: z.string().optional(),
  google_maps_url: z.string().optional(),
  num_reg_hierro: z.string().optional(),
  num_reg_ganadero: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface CrearPropiedadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CrearPropiedadModal({ isOpen, onClose, onSuccess }: CrearPropiedadModalProps) {
  const navigate = useNavigate();
  const { createPropiedad, tipos, createTipo, updateTipo, deleteTipo } = usePropiedades();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Producer selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [producers, setProducers] = useState<Cliente[]>([]);
  const [isSearchingProducers, setIsSearchingProducers] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<Cliente | null>(null);

  // Location data
  const [estados, setEstados] = useState<UbicacionBase[]>([]);
  const [municipios, setMunicipios] = useState<UbicacionBase[]>([]);
  const [parroquias, setParroquias] = useState<UbicacionBase[]>([]);
  const [sectores, setSectores] = useState<UbicacionBase[]>([]);

  // Hierro image
  const [showHierroSection, setShowHierroSection] = useState(false);
  const [hierroFile, setHierroFile] = useState<File | null>(null);
  const [hierroPreview, setHierroPreview] = useState<string | null>(null);

  // Mini-CRUD Tipos
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [creatingTipo, setCreatingTipo] = useState(false);
  const [editingTipoId, setEditingTipoId] = useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = useState('');
  const [updatingTipoId, setUpdatingTipoId] = useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);

  // Mini-CRUD Municipio
  const [showNewMun, setShowNewMun] = useState(false);
  const [newMunNombre, setNewMunNombre] = useState('');
  const [creatingMun, setCreatingMun] = useState(false);
  const [editingMunId, setEditingMunId] = useState<number | null>(null);
  const [editingMunNombre, setEditingMunNombre] = useState('');
  const [updatingMunId, setUpdatingMunId] = useState<number | null>(null);
  const [deletingMunId, setDeletingMunId] = useState<number | null>(null);

  // Mini-CRUD Parroquia
  const [showNewPar, setShowNewPar] = useState(false);
  const [newParNombre, setNewParNombre] = useState('');
  const [creatingPar, setCreatingPar] = useState(false);
  const [editingParId, setEditingParId] = useState<number | null>(null);
  const [editingParNombre, setEditingParNombre] = useState('');
  const [updatingParId, setUpdatingParId] = useState<number | null>(null);
  const [deletingParId, setDeletingParId] = useState<number | null>(null);

  // Mini-CRUD Sector
  const [showNewSec, setShowNewSec] = useState(false);
  const [newSecNombre, setNewSecNombre] = useState('');
  const [creatingSec, setCreatingSec] = useState(false);
  const [editingSecId, setEditingSecId] = useState<number | null>(null);
  const [editingSecNombre, setEditingSecNombre] = useState('');
  const [updatingSecId, setUpdatingSecId] = useState<number | null>(null);
  const [deletingSecId, setDeletingSecId] = useState<number | null>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      nombre: '',
      codigo_insai: '',
      rif: '',
      hectareas_totales: '0',
      tipo_propiedad_id: '',
      estado_id: '',
      municipio_id: '',
      parroquia_id: '',
      sector_id: '',
      punto_referencia: '',
      google_maps_url: '',
      num_reg_hierro: '',
      num_reg_ganadero: '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const selectedEstado = watch('estado_id');
  const selectedMunicipio = watch('municipio_id');
  const selectedParroquia = watch('parroquia_id');

  // Load initial states and producers on open
  useEffect(() => {
    if (isOpen) {
      ubicacionService.getEstados().then(res => {
        const ests = res.data || [];
        setEstados(ests);
        if (ests.length > 0 && !form.getValues('estado_id')) {
          // Preselect Yaracuy if present, or first
          const yaracuy = ests.find(e => e.nombre.toLowerCase().includes('yaracuy')) || ests[0];
          setValue('estado_id', yaracuy.id.toString(), { shouldValidate: true });
        }
      });
      fetchProducers('');
    } else {
      // Reset state on close
      setStep(1);
      setSelectedProducer(null);
      setSearchQuery('');
      setHierroFile(null);
      setHierroPreview(null);
      setShowHierroSection(false);
      form.reset();
    }
  }, [isOpen, setValue, form]);

  // Search producers with debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchProducers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  const fetchProducers = async (q: string) => {
    setIsSearchingProducers(true);
    try {
      const res = await clientesService.getAll({ q: q.trim(), limit: 15 });
      setProducers(res.data || []);
    } catch (error) {
      console.error('Error fetching producers:', error);
    } finally {
      setIsSearchingProducers(false);
    }
  };

  // Location cascades
  useEffect(() => {
    if (selectedEstado) {
      ubicacionService.getMunicipios(parseInt(selectedEstado)).then(res => setMunicipios(res.data || []));
      setValue('municipio_id', '');
      setValue('parroquia_id', '');
      setValue('sector_id', '');
      setParroquias([]);
      setSectores([]);
    }
  }, [selectedEstado, setValue]);

  useEffect(() => {
    if (selectedMunicipio) {
      ubicacionService.getParroquias(parseInt(selectedMunicipio)).then(res => setParroquias(res.data || []));
      setValue('parroquia_id', '');
      setValue('sector_id', '');
      setSectores([]);
    }
  }, [selectedMunicipio, setValue]);

  useEffect(() => {
    if (selectedParroquia) {
      ubicacionService.getSectores(parseInt(selectedParroquia)).then(res => setSectores(res.data || []));
      setValue('sector_id', '');
    }
  }, [selectedParroquia, setValue]);

  // Hierro image handling
  const handleHierroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen del hierro no debe superar los 5MB');
        return;
      }
      setHierroFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHierroPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeHierroImage = () => {
    setHierroFile(null);
    setHierroPreview(null);
  };

  // Mini CRUD Tipo Propiedad
  const handleCreateTipo = async () => {
    if (!newTipoNombre.trim()) return;
    setCreatingTipo(true);
    try {
      const res = await createTipo(newTipoNombre.trim());
      setNewTipoNombre('');
      setShowNewTipo(false);
      if (res?.data?.id) {
        setValue('tipo_propiedad_id', res.data.id.toString(), { shouldValidate: true });
      }
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
    } finally {
      setUpdatingTipoId(null);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    setDeletingTipoId(id);
    try {
      await deleteTipo(id);
      if (watch('tipo_propiedad_id') === id.toString()) {
        setValue('tipo_propiedad_id', '');
      }
    } finally {
      setDeletingTipoId(null);
    }
  };

  // Mini CRUD Municipio
  const handleCreateMunicipio = async () => {
    if (!newMunNombre.trim() || !selectedEstado) return;
    setCreatingMun(true);
    try {
      const res = await ubicacionService.createMunicipio({
        nombre: newMunNombre.trim(),
        estado_id: parseInt(selectedEstado),
      });
      toast.success('Municipio creado exitosamente');
      setNewMunNombre('');
      setShowNewMun(false);
      const updated = await ubicacionService.getMunicipios(parseInt(selectedEstado));
      setMunicipios(updated.data || []);
      if (res.data?.id) {
        setValue('municipio_id', res.data.id.toString(), { shouldValidate: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear el municipio');
    } finally {
      setCreatingMun(false);
    }
  };

  const handleUpdateMunicipio = async (id: number) => {
    if (!editingMunNombre.trim()) return;
    setUpdatingMunId(id);
    try {
      await ubicacionService.updateMunicipio(id, { nombre: editingMunNombre.trim() });
      toast.success('Municipio actualizado');
      setEditingMunId(null);
      setEditingMunNombre('');
      const updated = await ubicacionService.getMunicipios(parseInt(selectedEstado));
      setMunicipios(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar el municipio');
    } finally {
      setUpdatingMunId(null);
    }
  };

  const handleDeleteMunicipio = async (id: number) => {
    setDeletingMunId(id);
    try {
      await ubicacionService.deleteMunicipio(id);
      toast.success('Municipio eliminado');
      if (selectedMunicipio === id.toString()) {
        setValue('municipio_id', '');
        setValue('parroquia_id', '');
        setValue('sector_id', '');
        setParroquias([]);
        setSectores([]);
      }
      const updated = await ubicacionService.getMunicipios(parseInt(selectedEstado));
      setMunicipios(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el municipio');
    } finally {
      setDeletingMunId(null);
    }
  };

  // Mini CRUD Parroquia
  const handleCreateParroquia = async () => {
    if (!newParNombre.trim() || !selectedMunicipio) return;
    setCreatingPar(true);
    try {
      const res = await ubicacionService.createParroquia({
        nombre: newParNombre.trim(),
        municipio_id: parseInt(selectedMunicipio),
      });
      toast.success('Parroquia creada exitosamente');
      setNewParNombre('');
      setShowNewPar(false);
      const updated = await ubicacionService.getParroquias(parseInt(selectedMunicipio));
      setParroquias(updated.data || []);
      if (res.data?.id) {
        setValue('parroquia_id', res.data.id.toString(), { shouldValidate: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear la parroquia');
    } finally {
      setCreatingPar(false);
    }
  };

  const handleUpdateParroquia = async (id: number) => {
    if (!editingParNombre.trim()) return;
    setUpdatingParId(id);
    try {
      await ubicacionService.updateParroquia(id, { nombre: editingParNombre.trim() });
      toast.success('Parroquia actualizada');
      setEditingParId(null);
      setEditingParNombre('');
      const updated = await ubicacionService.getParroquias(parseInt(selectedMunicipio));
      setParroquias(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar la parroquia');
    } finally {
      setUpdatingParId(null);
    }
  };

  const handleDeleteParroquia = async (id: number) => {
    setDeletingParId(id);
    try {
      await ubicacionService.deleteParroquia(id);
      toast.success('Parroquia eliminada');
      if (selectedParroquia === id.toString()) {
        setValue('parroquia_id', '');
        setValue('sector_id', '');
        setSectores([]);
      }
      const updated = await ubicacionService.getParroquias(parseInt(selectedMunicipio));
      setParroquias(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la parroquia');
    } finally {
      setDeletingParId(null);
    }
  };

  // Mini CRUD Sector
  const handleCreateSector = async () => {
    if (!newSecNombre.trim() || !selectedParroquia) return;
    setCreatingSec(true);
    try {
      const res = await ubicacionService.createSector({
        nombre: newSecNombre.trim(),
        parroquia_id: parseInt(selectedParroquia),
      });
      toast.success('Sector creado exitosamente');
      setNewSecNombre('');
      setShowNewSec(false);
      const updated = await ubicacionService.getSectores(parseInt(selectedParroquia));
      setSectores(updated.data || []);
      if (res.data?.id) {
        setValue('sector_id', res.data.id.toString(), { shouldValidate: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear el sector');
    } finally {
      setCreatingSec(false);
    }
  };

  const handleUpdateSector = async (id: number) => {
    if (!editingSecNombre.trim()) return;
    setUpdatingSecId(id);
    try {
      await ubicacionService.updateSector(id, { nombre: editingSecNombre.trim() });
      toast.success('Sector actualizado');
      setEditingSecId(null);
      setEditingSecNombre('');
      const updated = await ubicacionService.getSectores(parseInt(selectedParroquia));
      setSectores(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar el sector');
    } finally {
      setUpdatingSecId(null);
    }
  };

  const handleDeleteSector = async (id: number) => {
    setDeletingSecId(id);
    try {
      await ubicacionService.deleteSector(id);
      toast.success('Sector eliminado');
      if (watch('sector_id') === id.toString()) {
        setValue('sector_id', '');
      }
      const updated = await ubicacionService.getSectores(parseInt(selectedParroquia));
      setSectores(updated.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el sector');
    } finally {
      setDeletingSecId(null);
    }
  };

  // Final Form Submission
  const onSubmit = async (data: PropertyFormData) => {
    if (!selectedProducer) {
      toast.error('Debes seleccionar un productor para la propiedad');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        due_o_id: selectedProducer.id,
        nombre: data.nombre.trim(),
        tipo_propiedad_id: parseInt(data.tipo_propiedad_id),
        hectareas_totales: parseFloat(data.hectareas_totales || '0'),
        rif: data.rif?.trim() || undefined,
        codigo_insai: data.codigo_insai?.trim() || undefined,
        punto_referencia: data.punto_referencia?.trim() || undefined,
        status: 'ACTIVA',
        ubicacion: {
          sector_id: parseInt(data.sector_id),
          google_maps_url: data.google_maps_url?.trim() || '',
        },
      };

      if (data.num_reg_hierro || data.num_reg_ganadero || hierroFile) {
        payload.hierro = {
          num_reg_hierro: data.num_reg_hierro?.trim() || undefined,
          num_reg_ganadero: data.num_reg_ganadero?.trim() || undefined,
        };
        if (hierroFile) {
          payload.hierro_img = hierroFile;
        }
      }

      await createPropiedad(payload);

      toast.success(`Propiedad "${data.nombre}" registrada y vinculada a ${selectedProducer.nombre}`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar la propiedad');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-effect border-border max-w-3xl w-[95vw] p-0 overflow-hidden shadow-2xl rounded-3xl max-h-[92vh] flex flex-col">
        {/* Header with Stepper */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border bg-card/60 backdrop-blur-md shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Home className="size-5" />
                </span>
                Registrar Nueva Propiedad
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                {step === 1
                  ? 'Paso 1 de 2: Selecciona el productor registrado que será dueño del predio.'
                  : `Paso 2 de 2: Ingresa los datos del predio y su ubicación geográfica.`}
              </DialogDescription>
            </div>

            {/* Stepper Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/30 border border-border shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                  step === 1
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : selectedProducer
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {selectedProducer ? <Check className="size-3.5" /> : <User className="size-3.5" />}
                <span>1. Productor</span>
              </button>

              <ChevronRight className="size-3.5 text-muted-foreground/60" />

              <button
                type="button"
                onClick={() => {
                  if (selectedProducer) setStep(2);
                  else toast.warning('Primero debes seleccionar un productor');
                }}
                disabled={!selectedProducer}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                  step === 2
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : selectedProducer
                      ? 'text-foreground hover:bg-muted/50 cursor-pointer'
                      : 'text-muted-foreground/50 cursor-not-allowed'
                )}
              >
                <MapPin className="size-3.5" />
                <span>2. Predio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
          {step === 1 ? (
            /* ========================================================= */
            /* STEP 1: BUSCAR Y SELECCIONAR PRODUCTOR                    */
            /* ========================================================= */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Selected Producer Highlight */}
              {selectedProducer && (
                <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/40 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                      <UserCheck className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                          Productor Seleccionado
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground">
                          {selectedProducer.cedula_rif}
                        </span>
                        {selectedProducer.codigo_runsai && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            RUNSAI: {selectedProducer.codigo_runsai}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-foreground leading-snug">
                        {selectedProducer.nombre}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {selectedProducer.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-primary" /> {selectedProducer.telefono}
                          </span>
                        )}
                        {selectedProducer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3 text-primary" /> {selectedProducer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProducer(null)}
                    className="rounded-xl border-dashed hover:border-rose-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all self-end sm:self-center cursor-pointer"
                  >
                    <X className="size-4 mr-1" />
                    Cambiar
                  </Button>
                </div>
              )}

              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 block">
                  Buscar Productor en Base de Datos
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por Cédula, RIF, Nombre o Código RUNSAI..."
                    className="pl-10 pr-10 h-12 rounded-2xl bg-muted/10 border-border focus:bg-background text-sm transition-all"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Producer Results List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {isSearchingProducers ? 'Buscando productores...' : `Productores encontrados (${producers.length})`}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Haz clic en un productor para seleccionarlo
                  </span>
                </div>

                {isSearchingProducers ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-medium text-muted-foreground">Consultando productores...</p>
                  </div>
                ) : producers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar p-1">
                    {producers.map((prod) => {
                      const isCurrent = selectedProducer?.id === prod.id;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProducer(prod)}
                          className={cn(
                            'p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left group',
                            isCurrent
                              ? 'bg-primary/10 border-primary shadow-sm'
                              : 'bg-card/40 border-border hover:bg-card hover:border-primary/40 hover:shadow-md'
                          )}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                                {prod.cedula_rif}
                              </span>
                              {isCurrent ? (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                                  <Check className="size-3.5" /> Seleccionado
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  Elegir <ChevronRight className="size-3" />
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {prod.nombre}
                            </h5>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground">
                            {prod.codigo_runsai && (
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                                RUNSAI: {prod.codigo_runsai}
                              </span>
                            )}
                            {prod.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3" /> {prod.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 bg-muted/10 rounded-2xl border border-dashed border-border text-center">
                    <User className="size-10 text-muted-foreground/40" />
                    <div>
                      <p className="text-sm font-bold text-foreground">No se encontraron productores</p>
                      <p className="text-xs text-muted-foreground max-w-sm mt-1">
                        No hay coincidencias con "{searchQuery}". Si el productor aún no existe en el sistema, puedes inscribirlo con el asistente completo.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        navigate('/home/clientes');
                      }}
                      className="mt-2 rounded-xl text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                    >
                      <Plus className="size-4 mr-1.5" />
                      Inscribir Nuevo Productor en Clientes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* STEP 2: FORMULARIO DE DATOS DE LA PROPIEDAD Y UBICACIÓN   */
            /* ========================================================= */
            <form id="crear-propiedad-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
              {/* Selected Producer Mini Banner */}
              {selectedProducer && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <UserCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Productor Dueño
                        </span>
                        <span className="text-[11px] font-bold text-primary">
                          {selectedProducer.cedula_rif}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{selectedProducer.nombre}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-primary rounded-xl cursor-pointer"
                  >
                    <Pencil className="size-3.5 mr-1" />
                    Cambiar
                  </Button>
                </div>
              )}

              {/* Sección 1: Identificación del Predio */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <Home className="size-4 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    1. Datos de Identificación del Predio
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Nombre de la Propiedad / Predio <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      {...register('nombre')}
                      placeholder="Ej: Finca Las Delicias, Hato El Encanto..."
                      className={cn(
                        'h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm',
                        errors.nombre && 'border-rose-500/50 bg-rose-500/5 focus:border-rose-500'
                      )}
                    />
                    {errors.nombre && (
                      <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.nombre.message}</p>
                    )}
                  </div>

                  {/* Tipo de Propiedad (con mini-CRUD) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Tipo de Propiedad <span className="text-rose-500">*</span>
                    </label>

                    {/* Inline New Tipo Form */}
                    {showNewTipo && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={newTipoNombre}
                          onChange={(e) => setNewTipoNombre(e.target.value)}
                          placeholder="Nuevo tipo (ej: Silo, Hacienda)..."
                          className="h-10 rounded-xl bg-muted/10 border-primary/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTipo())}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={creatingTipo || !newTipoNombre.trim()}
                          onClick={handleCreateTipo}
                          className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          {creatingTipo ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowNewTipo(false);
                            setNewTipoNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    {/* Inline Edit Tipo Form */}
                    {editingTipoId !== null && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={editingTipoNombre}
                          onChange={(e) => setEditingTipoNombre(e.target.value)}
                          placeholder="Editar nombre del tipo..."
                          className="h-10 rounded-xl bg-muted/10 border-blue-500/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateTipo(editingTipoId))}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={updatingTipoId === editingTipoId || !editingTipoNombre.trim()}
                          onClick={() => handleUpdateTipo(editingTipoId)}
                          className="size-10 shrink-0 rounded-xl bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        >
                          {updatingTipoId === editingTipoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTipoId(null);
                            setEditingTipoNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Select
                        value={watch('tipo_propiedad_id') || ''}
                        onValueChange={(val) => setValue('tipo_propiedad_id', val, { shouldValidate: true })}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm transition-all',
                            errors.tipo_propiedad_id && 'border-rose-500/50 bg-rose-500/5'
                          )}
                        >
                          <SelectValue placeholder="Seleccione un tipo..." />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border max-h-56">
                          {tipos.map((t) => (
                            <div key={t.id} className="group relative flex items-center">
                              <SelectItem value={t.id.toString()} className="cursor-pointer flex-1 pr-16">
                                {t.nombre}
                              </SelectItem>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
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
                                  {deletingTipoId === t.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
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
                        onClick={() => {
                          setShowNewTipo(!showNewTipo);
                          setEditingTipoId(null);
                        }}
                        className="size-11 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                        title="Crear nuevo tipo de propiedad"
                      >
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    {errors.tipo_propiedad_id && (
                      <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.tipo_propiedad_id.message}</p>
                    )}
                  </div>

                  {/* Superficie Hectáreas */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Superficie Total (Hectáreas)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register('hectareas_totales')}
                      placeholder="0.00"
                      className="h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                    />
                  </div>

                  {/* RIF de la Propiedad */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      RIF del Predio (Opcional)
                    </label>
                    <Input
                      {...register('rif')}
                      placeholder="Ej: J-12345678-9"
                      className="h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                    />
                  </div>

                  {/* Código INSAI */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Código INSAI (Opcional)
                    </label>
                    <Input
                      {...register('codigo_insai')}
                      placeholder="Dejar vacío para generar automáticamente (ej: PRO-2026-0042)"
                      className="h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground pl-1">
                      Si lo omites, el sistema le asignará un correlativo oficial de forma automática.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sección 2: Ubicación Geográfica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border">
                  <MapPin className="size-4 text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    2. Ubicación Geográfica y Referencia
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Estado */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Estado <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={watch('estado_id') || ''}
                      onValueChange={(val) => setValue('estado_id', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm">
                        <SelectValue placeholder="Seleccione Estado" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border max-h-56">
                        {estados.map((e) => (
                          <SelectItem key={e.id} value={e.id.toString()} className="cursor-pointer">
                            {e.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Municipio (con mini-CRUD) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Municipio <span className="text-rose-500">*</span>
                    </label>

                    {showNewMun && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={newMunNombre}
                          onChange={(e) => setNewMunNombre(e.target.value)}
                          placeholder="Nuevo municipio..."
                          className="h-10 rounded-xl bg-muted/10 border-primary/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateMunicipio())}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={creatingMun || !newMunNombre.trim()}
                          onClick={handleCreateMunicipio}
                          className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          {creatingMun ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowNewMun(false);
                            setNewMunNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    {editingMunId !== null && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={editingMunNombre}
                          onChange={(e) => setEditingMunNombre(e.target.value)}
                          placeholder="Editar nombre..."
                          className="h-10 rounded-xl bg-muted/10 border-blue-500/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateMunicipio(editingMunId))}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={updatingMunId === editingMunId || !editingMunNombre.trim()}
                          onClick={() => handleUpdateMunicipio(editingMunId)}
                          className="size-10 shrink-0 rounded-xl bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        >
                          {updatingMunId === editingMunId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMunId(null);
                            setEditingMunNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Select
                        value={watch('municipio_id') || ''}
                        disabled={!selectedEstado}
                        onValueChange={(val) => setValue('municipio_id', val, { shouldValidate: true })}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm transition-all',
                            errors.municipio_id && 'border-rose-500/50 bg-rose-500/5',
                            !selectedEstado && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <SelectValue placeholder="Seleccione Municipio" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border max-h-56">
                          {municipios.map((m) => (
                            <div key={m.id} className="group relative flex items-center">
                              <SelectItem value={m.id.toString()} className="cursor-pointer flex-1 pr-16">
                                {m.nombre}
                              </SelectItem>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  disabled={deletingMunId === m.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingMunId(m.id);
                                    setEditingMunNombre(m.nombre);
                                    setShowNewMun(false);
                                  }}
                                  className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                                  title="Editar municipio"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingMunId === m.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMunicipio(m.id);
                                  }}
                                  className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                                  title="Eliminar municipio"
                                >
                                  {deletingMunId === m.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
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
                        disabled={!selectedEstado}
                        onClick={() => {
                          setShowNewMun(!showNewMun);
                          setEditingMunId(null);
                        }}
                        className="size-11 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer disabled:opacity-50"
                        title="Crear nuevo municipio"
                      >
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    {errors.municipio_id && (
                      <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.municipio_id.message}</p>
                    )}
                  </div>

                  {/* Parroquia (con mini-CRUD) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Parroquia <span className="text-rose-500">*</span>
                    </label>

                    {showNewPar && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={newParNombre}
                          onChange={(e) => setNewParNombre(e.target.value)}
                          placeholder="Nueva parroquia..."
                          className="h-10 rounded-xl bg-muted/10 border-primary/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateParroquia())}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={creatingPar || !newParNombre.trim()}
                          onClick={handleCreateParroquia}
                          className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          {creatingPar ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowNewPar(false);
                            setNewParNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    {editingParId !== null && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={editingParNombre}
                          onChange={(e) => setEditingParNombre(e.target.value)}
                          placeholder="Editar nombre..."
                          className="h-10 rounded-xl bg-muted/10 border-blue-500/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateParroquia(editingParId))}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={updatingParId === editingParId || !editingParNombre.trim()}
                          onClick={() => handleUpdateParroquia(editingParId)}
                          className="size-10 shrink-0 rounded-xl bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        >
                          {updatingParId === editingParId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingParId(null);
                            setEditingParNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Select
                        value={watch('parroquia_id') || ''}
                        disabled={!selectedMunicipio}
                        onValueChange={(val) => setValue('parroquia_id', val, { shouldValidate: true })}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm transition-all',
                            errors.parroquia_id && 'border-rose-500/50 bg-rose-500/5',
                            !selectedMunicipio && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <SelectValue placeholder="Seleccione Parroquia" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border max-h-56">
                          {parroquias.map((p) => (
                            <div key={p.id} className="group relative flex items-center">
                              <SelectItem value={p.id.toString()} className="cursor-pointer flex-1 pr-16">
                                {p.nombre}
                              </SelectItem>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  disabled={deletingParId === p.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingParId(p.id);
                                    setEditingParNombre(p.nombre);
                                    setShowNewPar(false);
                                  }}
                                  className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                                  title="Editar parroquia"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingParId === p.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteParroquia(p.id);
                                  }}
                                  className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                                  title="Eliminar parroquia"
                                >
                                  {deletingParId === p.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
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
                        disabled={!selectedMunicipio}
                        onClick={() => {
                          setShowNewPar(!showNewPar);
                          setEditingParId(null);
                        }}
                        className="size-11 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer disabled:opacity-50"
                        title="Crear nueva parroquia"
                      >
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    {errors.parroquia_id && (
                      <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.parroquia_id.message}</p>
                    )}
                  </div>

                  {/* Sector (con mini-CRUD) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Sector <span className="text-rose-500">*</span>
                    </label>

                    {showNewSec && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={newSecNombre}
                          onChange={(e) => setNewSecNombre(e.target.value)}
                          placeholder="Nuevo sector..."
                          className="h-10 rounded-xl bg-muted/10 border-primary/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateSector())}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={creatingSec || !newSecNombre.trim()}
                          onClick={handleCreateSector}
                          className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          {creatingSec ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setShowNewSec(false);
                            setNewSecNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    {editingSecId !== null && (
                      <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-200">
                        <Input
                          value={editingSecNombre}
                          onChange={(e) => setEditingSecNombre(e.target.value)}
                          placeholder="Editar nombre..."
                          className="h-10 rounded-xl bg-muted/10 border-blue-500/40 focus:bg-background text-xs"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateSector(editingSecId))}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="icon"
                          disabled={updatingSecId === editingSecId || !editingSecNombre.trim()}
                          onClick={() => handleUpdateSector(editingSecId)}
                          className="size-10 shrink-0 rounded-xl bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        >
                          {updatingSecId === editingSecId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSecId(null);
                            setEditingSecNombre('');
                          }}
                          className="size-10 shrink-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Select
                        value={watch('sector_id') || ''}
                        disabled={!selectedParroquia}
                        onValueChange={(val) => setValue('sector_id', val, { shouldValidate: true })}
                      >
                        <SelectTrigger
                          className={cn(
                            'w-full h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm transition-all',
                            errors.sector_id && 'border-rose-500/50 bg-rose-500/5',
                            !selectedParroquia && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <SelectValue placeholder="Seleccione Sector" />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-border max-h-56">
                          {sectores.map((s) => (
                            <div key={s.id} className="group relative flex items-center">
                              <SelectItem value={s.id.toString()} className="cursor-pointer flex-1 pr-16">
                                {s.nombre}
                              </SelectItem>
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  disabled={deletingSecId === s.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSecId(s.id);
                                    setEditingSecNombre(s.nombre);
                                    setShowNewSec(false);
                                  }}
                                  className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                                  title="Editar sector"
                                >
                                  <Pencil className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingSecId === s.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSector(s.id);
                                  }}
                                  className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                                  title="Eliminar sector"
                                >
                                  {deletingSecId === s.id ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3" />
                                  )}
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
                        disabled={!selectedParroquia}
                        onClick={() => {
                          setShowNewSec(!showNewSec);
                          setEditingSecId(null);
                        }}
                        className="size-11 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer disabled:opacity-50"
                        title="Crear nuevo sector"
                      >
                        <Plus className="size-5" />
                      </Button>
                    </div>
                    {errors.sector_id && (
                      <p className="text-[11px] font-bold text-rose-500 pl-1">{errors.sector_id.message}</p>
                    )}
                  </div>

                  {/* Punto de Referencia */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      Punto de Referencia / Vía de Acceso
                    </label>
                    <Textarea
                      {...register('punto_referencia')}
                      rows={2}
                      placeholder="Ej: A 500 metros del puente colgante, portón blanco a mano derecha..."
                      className="rounded-xl bg-muted/10 border-border focus:bg-background text-sm resize-none"
                    />
                  </div>

                  {/* URL Google Maps */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                      URL de Google Maps (Geolocalización)
                    </label>
                    <Input
                      {...register('google_maps_url')}
                      placeholder="https://maps.google.com/?q=..."
                      className="h-11 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Hierro y Registro Ganadero (Opcional - Colapsable) */}
              <div className="rounded-2xl border border-border bg-card/40 overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setShowHierroSection(!showHierroSection)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Shield className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Registro Ganadero y Hierro (Opcional)
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        N° de registro de hierro, n° ganadero e imagen digitalizada
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform duration-200',
                      showHierroSection && 'rotate-180 text-primary'
                    )}
                  />
                </button>

                {showHierroSection && (
                  <div className="p-4 pt-1 border-t border-border/50 space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                          N° Registro de Hierro
                        </label>
                        <Input
                          {...register('num_reg_hierro')}
                          placeholder="Ej: RH-2026-99"
                          className="h-10 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                          N° Registro Ganadero
                        </label>
                        <Input
                          {...register('num_reg_ganadero')}
                          placeholder="Ej: RG-4401"
                          className="h-10 rounded-xl bg-muted/10 border-border focus:bg-background text-sm"
                        />
                      </div>
                    </div>

                    {/* Foto o diseño de hierro */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                        Imagen del Hierro / Marca de Fuego
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-muted/10">
                        {hierroPreview ? (
                          <div className="relative size-24 rounded-xl overflow-hidden border border-border shrink-0 bg-background shadow-md">
                            <img
                              src={hierroPreview}
                              alt="Hierro preview"
                              className="w-full h-full object-contain p-1"
                            />
                            <button
                              type="button"
                              onClick={removeHierroImage}
                              className="absolute top-1 right-1 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow cursor-pointer"
                              title="Quitar imagen"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="size-24 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all shrink-0">
                            <Upload className="size-5 text-muted-foreground" />
                            <span className="text-[10px] font-bold text-muted-foreground text-center px-1">
                              Subir foto
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleHierroImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                        <div className="text-xs text-muted-foreground space-y-1 text-center sm:text-left">
                          <p className="font-semibold text-foreground">
                            {hierroFile ? hierroFile.name : 'Formatos permitidos: JPG, PNG o WEBP'}
                          </p>
                          <p className="text-[11px]">
                            Se recomienda una fotografía clara o dibujo digitalizado de la marca para su inspección en campo. Máximo 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-card/60 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-xl hover:bg-muted cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="primary"
                disabled={!selectedProducer}
                onClick={() => setStep(2)}
                className="rounded-xl px-5 flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
              >
                <span>Continuar a Datos del Predio</span>
                <ChevronRight className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="rounded-xl border-border hover:bg-muted flex items-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>Atrás</span>
              </Button>

              <Button
                type="submit"
                form="crear-propiedad-form"
                disabled={isSubmitting}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-bold shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando Predio...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>Registrar Propiedad</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
