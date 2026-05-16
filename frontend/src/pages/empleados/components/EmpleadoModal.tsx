import { useEffect, useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, User, MapPin, Briefcase, ClipboardList, X, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { useEmpleados } from '@/hooks/use-empleados';
import { useProgramas } from '@/hooks/use-programas';
import type { Empleado } from '@/types/empleados';

const empleadoSchema = z.object({
  cedula: z.string().min(5, 'Cédula muy corta').max(20),
  nombre: z.string().min(2, 'Nombre muy corto').max(100),
  apellido: z.string().min(2, 'Apellido muy corto').max(100),
  telefono: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email('Email inválido').max(100).optional().or(z.literal('')),
  fechas_ingreso: z.string().optional().or(z.literal('')),
  status_laboral: z.string().default('ACTIVO'),
  contrato_id: z.string().optional().or(z.literal('')),
  cargo_id: z.string().optional().or(z.literal('')),
  departamento_id: z.string().optional().or(z.literal('')),
  profesion_id: z.string().optional().or(z.literal('')),
  oficina_id: z.string().optional().or(z.literal('')),
  residencia: z.object({
    direccion_detallada: z.string().optional().or(z.literal('')),
    punto_referencia: z.string().optional().or(z.literal('')),
    google_maps_url: z.string().optional().or(z.literal('')),
  }).optional(),
});

interface EmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado?: Empleado | null;
}

export function EmpleadoModal({
  isOpen,
  onClose,
  empleado,
}: EmpleadoModalProps) {
  const { 
    createEmpleado, 
    updateEmpleado, 
    isCreating, 
    isUpdating,
    catalogos,
    createCargo,
    updateCargo,
    deleteCargo,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
    createProfesion,
    updateProfesion,
    deleteProfesion,
    createContrato,
    updateContrato,
    deleteContrato
  } = useEmpleados();
  
  const { programas } = useProgramas();
  
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProgramas, setSelectedProgramas] = useState<number[]>([]);

  // Estados para creación en línea de catálogos
  const [showNewCargo, setShowNewCargo] = useState(false);
  const [newCargoNombre, setNewCargoNombre] = useState('');
  const [editingCargoId, setEditingCargoId] = useState<number | null>(null);
  const [editingCargoNombre, setEditingCargoNombre] = useState('');

  const [showNewDepto, setShowNewDepto] = useState(false);
  const [newDeptoNombre, setNewDeptoNombre] = useState('');
  const [editingDeptoId, setEditingDeptoId] = useState<number | null>(null);
  const [editingDeptoNombre, setEditingDeptoNombre] = useState('');

  const [showNewProf, setShowNewProf] = useState(false);
  const [newProfNombre, setNewProfNombre] = useState('');
  const [editingProfId, setEditingProfId] = useState<number | null>(null);
  const [editingProfNombre, setEditingProfNombre] = useState('');

  const [showNewContrato, setShowNewContrato] = useState(false);
  const [newContratoNombre, setNewContratoNombre] = useState('');
  const [editingContratoId, setEditingContratoId] = useState<number | null>(null);
  const [editingContratoNombre, setEditingContratoNombre] = useState('');

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      fechas_ingreso: '',
      status_laboral: 'ACTIVO',
      contrato_id: '',
      cargo_id: '',
      departamento_id: '',
      profesion_id: '',
      oficina_id: '',
      residencia: {
        direccion_detallada: '',
        punto_referencia: '',
        google_maps_url: '',
      },
    },
  });

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (empleado) {
        reset({
          cedula: empleado.cedula,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          telefono: empleado.telefono || '',
          email: empleado.email || '',
          fechas_ingreso: empleado.fechas_ingreso ? new Date(empleado.fechas_ingreso).toISOString().split('T')[0] : '',
          status_laboral: empleado.status_laboral || 'ACTIVO',
          contrato_id: empleado.contrato_id?.toString() || '',
          cargo_id: empleado.cargo_id?.toString() || '',
          departamento_id: empleado.departamento_id?.toString() || '',
          profesion_id: empleado.profesion_id?.toString() || '',
          oficina_id: empleado.oficina_id?.toString() || '',
          residencia: {
            direccion_detallada: empleado.empleado_residencia?.[0]?.direccion_detallada || '',
            punto_referencia: empleado.empleado_residencia?.[0]?.punto_referencia || '',
            google_maps_url: empleado.empleado_residencia?.[0]?.google_maps_url || '',
          },
        });
        setFotoPreview(empleado.empleado_foto?.[0]?.foto_url || null);
        setSelectedProgramas(empleado.empleados_programas?.map((ep) => ep.programas.id) || []);
      } else {
        reset();
        setFotoPreview(null);
        setSelectedProgramas([]);
      }
      setFotoFile(null);
    }
  }, [empleado, reset, isOpen]);

  // Handlers para catálogos en línea
  const handleCreateCargo = async () => {
    if (!newCargoNombre.trim()) return;
    setProcessingId(0);
    try { await createCargo(newCargoNombre.trim()); setNewCargoNombre(''); setShowNewCargo(false); } finally { setProcessingId(null); }
  };
  const handleUpdateCargo = async (id: number) => {
    if (!editingCargoNombre.trim()) return;
    setProcessingId(id);
    try { await updateCargo({ id, nombre: editingCargoNombre.trim() }); setEditingCargoId(null); setEditingCargoNombre(''); } finally { setProcessingId(null); }
  };
  const handleDeleteCargo = async (id: number) => {
    setDeletingId(id);
    try { await deleteCargo(id); } finally { setDeletingId(null); }
  };

  const handleCreateDepto = async () => {
    if (!newDeptoNombre.trim()) return;
    setProcessingId(0);
    try { await createDepartamento(newDeptoNombre.trim()); setNewDeptoNombre(''); setShowNewDepto(false); } finally { setProcessingId(null); }
  };
  const handleUpdateDepto = async (id: number) => {
    if (!editingDeptoNombre.trim()) return;
    setProcessingId(id);
    try { await updateDepartamento({ id, nombre: editingDeptoNombre.trim() }); setEditingDeptoId(null); setEditingDeptoNombre(''); } finally { setProcessingId(null); }
  };
  const handleDeleteDepto = async (id: number) => {
    setDeletingId(id);
    try { await deleteDepartamento(id); } finally { setDeletingId(null); }
  };

  const handleCreateProf = async () => {
    if (!newProfNombre.trim()) return;
    setProcessingId(0);
    try { await createProfesion(newProfNombre.trim()); setNewProfNombre(''); setShowNewProf(false); } finally { setProcessingId(null); }
  };
  const handleUpdateProf = async (id: number) => {
    if (!editingProfNombre.trim()) return;
    setProcessingId(id);
    try { await updateProfesion({ id, nombre: editingProfNombre.trim() }); setEditingProfId(null); setEditingProfNombre(''); } finally { setProcessingId(null); }
  };
  const handleDeleteProf = async (id: number) => {
    setDeletingId(id);
    try { await deleteProfesion(id); } finally { setDeletingId(null); }
  };

  const handleCreateContrato = async () => {
    if (!newContratoNombre.trim()) return;
    setProcessingId(0);
    try { await createContrato(newContratoNombre.trim()); setNewContratoNombre(''); setShowNewContrato(false); } finally { setProcessingId(null); }
  };
  const handleUpdateContrato = async (id: number) => {
    if (!editingContratoNombre.trim()) return;
    setProcessingId(id);
    try { await updateContrato({ id, nombre: editingContratoNombre.trim() }); setEditingContratoId(null); setEditingContratoNombre(''); } finally { setProcessingId(null); }
  };
  const handleDeleteContrato = async (id: number) => {
    setDeletingId(id);
    try { await deleteContrato(id); } finally { setDeletingId(null); }
  };

  const onFormSubmit = async (values: z.infer<typeof empleadoSchema>) => {
    const formData = new FormData();
    
    // Flatten values and append to FormData
    (Object.keys(values) as Array<keyof typeof values>).forEach(key => {
      const value = values[key];
      if (key === 'residencia') {
        formData.append('residencia', JSON.stringify(value));
      } else if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (fotoFile) {
      formData.append('foto', fotoFile);
    }

    if (selectedProgramas.length > 0) {
      formData.append('programas_ids', JSON.stringify(selectedProgramas));
    }

    if (empleado) {
      await updateEmpleado({ id: empleado.id, data: formData });
    } else {
      await createEmpleado(formData);
    }
    onClose();
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePrograma = (id: number) => {
    setSelectedProgramas(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0 h-[90vh] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-border/50 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                {empleado ? <Briefcase className="size-6 text-primary" /> : <User className="size-6 text-primary" />}
                {empleado ? 'Actualizar Ficha de Empleado' : 'Registro de Nuevo Empleado'}
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">
                {empleado ? 'Modifica la información laboral y personal del trabajador.' : 'Ingresa los datos para dar de alta a un nuevo integrante del equipo.'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Sección de Foto y Datos Básicos */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="size-32 rounded-3xl overflow-hidden border-4 border-background shadow-xl bg-muted/30 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-primary/20">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="size-full object-cover" />
                    ) : (
                      <User className="size-16 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                    <Camera className="size-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFotoChange} 
                  />
                </div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Foto de Perfil</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Cédula de Identidad</Label>
                  <Input {...register('cedula')} placeholder="V-12345678" className="h-11 rounded-xl bg-background/50" />
                  {errors.cedula && <span className="text-[10px] text-rose-500 font-bold ml-1">{errors.cedula.message as string}</span>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Estatus Laboral</Label>
                  <Select 
                    value={watch('status_laboral')} 
                    onValueChange={(v) => setValue('status_laboral', v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect rounded-xl border-border">
                      <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                      <SelectItem value="VACACIONES">VACACIONES</SelectItem>
                      <SelectItem value="REPOSO">REPOSO</SelectItem>
                      <SelectItem value="JUBILADO">JUBILADO</SelectItem>
                      <SelectItem value="RETIRADO">RETIRADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nombres</Label>
                  <Input {...register('nombre')} placeholder="Juan Alberto" className="h-11 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Apellidos</Label>
                  <Input {...register('apellido')} placeholder="Pérez García" className="h-11 rounded-xl bg-background/50" />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Sección Laboral */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Briefcase className="size-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground/80">Información Laboral</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Departamento */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Departamento</Label>
                  {showNewDepto && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={newDeptoNombre}
                        onChange={(e) => setNewDeptoNombre(e.target.value)}
                        placeholder="Nuevo departamento..."
                        className="h-9 rounded-lg text-xs border-primary/30 focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateDepto())}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === 0 || !newDeptoNombre.trim()} onClick={handleCreateDepto} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                        {processingId === 0 ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewDepto(false); setNewDeptoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  {editingDeptoId !== null && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={editingDeptoNombre}
                        onChange={(e) => setEditingDeptoNombre(e.target.value)}
                        placeholder="Editar nombre..."
                        className="h-9 rounded-lg text-xs border-blue-500/30 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateDepto(editingDeptoId))}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === editingDeptoId || !editingDeptoNombre.trim()} onClick={() => handleUpdateDepto(editingDeptoId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        {processingId === editingDeptoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingDeptoId(null); setEditingDeptoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={watch('departamento_id') || ''} onValueChange={(v) => setValue('departamento_id', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-background/50 flex-1">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-effect rounded-xl border-border">
                        {catalogos.departamentos.map(d => (
                          <div key={d.id} className="group relative flex items-center">
                            <SelectItem value={d.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-16">{d.nombre}</SelectItem>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingDeptoId(d.id); setEditingDeptoNombre(d.nombre); setShowNewDepto(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer"><Pencil className="size-3" /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteDepto(d.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer">{deletingId === d.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}</button>
                            </div>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewDepto(!showNewDepto); setEditingDeptoId(null); }} className="size-10 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Cargo */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cargo</Label>
                  {showNewCargo && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={newCargoNombre}
                        onChange={(e) => setNewCargoNombre(e.target.value)}
                        placeholder="Nuevo cargo..."
                        className="h-9 rounded-lg text-xs border-primary/30 focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCargo())}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === 0 || !newCargoNombre.trim()} onClick={handleCreateCargo} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                        {processingId === 0 ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewCargo(false); setNewCargoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  {editingCargoId !== null && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={editingCargoNombre}
                        onChange={(e) => setEditingCargoNombre(e.target.value)}
                        placeholder="Editar nombre..."
                        className="h-9 rounded-lg text-xs border-blue-500/30 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateCargo(editingCargoId))}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === editingCargoId || !editingCargoNombre.trim()} onClick={() => handleUpdateCargo(editingCargoId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        {processingId === editingCargoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingCargoId(null); setEditingCargoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={watch('cargo_id') || ''} onValueChange={(v) => setValue('cargo_id', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-background/50 flex-1">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-effect rounded-xl border-border">
                        {catalogos.cargos.map(c => (
                          <div key={c.id} className="group relative flex items-center">
                            <SelectItem value={c.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-16">{c.nombre}</SelectItem>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingCargoId(c.id); setEditingCargoNombre(c.nombre); setShowNewCargo(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer"><Pencil className="size-3" /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCargo(c.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer">{deletingId === c.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}</button>
                            </div>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewCargo(!showNewCargo); setEditingCargoId(null); }} className="size-10 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Oficina (Sigue igual - compleja) */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Oficina / Sede</Label>
                  <Select value={watch('oficina_id') || ''} onValueChange={(v) => setValue('oficina_id', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-background/50">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent className="glass-effect rounded-xl border-border">
                      {catalogos.oficinas.map(o => <SelectItem key={o.id} value={o.id.toString()}>{o.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo Contrato */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Tipo Contrato</Label>
                  {showNewContrato && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={newContratoNombre}
                        onChange={(e) => setNewContratoNombre(e.target.value)}
                        placeholder="Nuevo tipo..."
                        className="h-9 rounded-lg text-xs border-primary/30 focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateContrato())}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === 0 || !newContratoNombre.trim()} onClick={handleCreateContrato} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                        {processingId === 0 ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewContrato(false); setNewContratoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  {editingContratoId !== null && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={editingContratoNombre}
                        onChange={(e) => setEditingContratoNombre(e.target.value)}
                        placeholder="Editar nombre..."
                        className="h-9 rounded-lg text-xs border-blue-500/30 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateContrato(editingContratoId))}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === editingContratoId || !editingContratoNombre.trim()} onClick={() => handleUpdateContrato(editingContratoId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        {processingId === editingContratoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingContratoId(null); setEditingContratoNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={watch('contrato_id') || ''} onValueChange={(v) => setValue('contrato_id', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-background/50 flex-1">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-effect rounded-xl border-border">
                        {catalogos.contratos.map(c => (
                          <div key={c.id} className="group relative flex items-center">
                            <SelectItem value={c.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-16">{c.nombre}</SelectItem>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingContratoId(c.id); setEditingContratoNombre(c.nombre); setShowNewContrato(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer"><Pencil className="size-3" /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteContrato(c.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer">{deletingId === c.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}</button>
                            </div>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewContrato(!showNewContrato); setEditingContratoId(null); }} className="size-10 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Profesión */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Profesión</Label>
                  {showNewProf && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={newProfNombre}
                        onChange={(e) => setNewProfNombre(e.target.value)}
                        placeholder="Nueva profesión..."
                        className="h-9 rounded-lg text-xs border-primary/30 focus:border-primary"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateProf())}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === 0 || !newProfNombre.trim()} onClick={handleCreateProf} className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer">
                        {processingId === 0 ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewProf(false); setNewProfNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  {editingProfId !== null && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                      <Input
                        value={editingProfNombre}
                        onChange={(e) => setEditingProfNombre(e.target.value)}
                        placeholder="Editar nombre..."
                        className="h-9 rounded-lg text-xs border-blue-500/30 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUpdateProf(editingProfId))}
                        autoFocus
                      />
                      <Button type="button" size="icon" disabled={processingId === editingProfId || !editingProfNombre.trim()} onClick={() => handleUpdateProf(editingProfId)} className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        {processingId === editingProfId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingProfId(null); setEditingProfNombre(''); }} className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer">
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={watch('profesion_id') || ''} onValueChange={(v) => setValue('profesion_id', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-background/50 flex-1">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-effect rounded-xl border-border">
                        {catalogos.profesiones.map(p => (
                          <div key={p.id} className="group relative flex items-center">
                            <SelectItem value={p.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-16">{p.nombre}</SelectItem>
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); setEditingProfId(p.id); setEditingProfNombre(p.nombre); setShowNewProf(false); }} className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer"><Pencil className="size-3" /></button>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteProf(p.id); }} className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer">{deletingId === p.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}</button>
                            </div>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setShowNewProf(!showNewProf); setEditingProfId(null); }} className="size-10 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Fecha Ingreso</Label>
                  <Input type="date" {...register('fechas_ingreso')} className="h-10 rounded-xl bg-background/50" />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Sección Residencia */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground/80">Ubicación y Residencia</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Dirección Detallada</Label>
                  <Input {...register('residencia.direccion_detallada')} placeholder="Calle 1, Casa #2..." className="h-10 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Punto de Referencia</Label>
                  <Input {...register('residencia.punto_referencia')} placeholder="Cerca de la plaza..." className="h-10 rounded-xl bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">URL Google Maps</Label>
                  <Input {...register('residencia.google_maps_url')} placeholder="https://goo.gl/maps/..." className="h-10 rounded-xl bg-background/50" />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50 w-full" />

            {/* Sección Programas */}
            <div className="space-y-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <ClipboardList className="size-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground/80">Programas Asignados</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {programas.map(prog => (
                  <button
                    key={prog.id}
                    type="button"
                    onClick={() => togglePrograma(prog.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 ${
                      selectedProgramas.includes(prog.id)
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 ring-2 ring-amber-500/20'
                      : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
                    }`}
                  >
                    <ClipboardList className={`size-3 ${selectedProgramas.includes(prog.id) ? 'text-amber-500' : 'text-muted-foreground/50'}`} />
                    {prog.nombre}
                  </button>
                ))}
                {programas.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No hay programas disponibles para asignar.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-6 border-t border-border/50 shrink-0 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-2xl h-12 px-6 font-bold hover:bg-background transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl h-12 px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Procesando...
                </>
              ) : empleado ? 'Actualizar Ficha' : 'Registrar Empleado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
