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
import type { Animal, TipoAnimal } from '@/types/animales';
import { Dog, Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnimales } from '@/hooks/use-animales';

const numericString = z.string()
  .regex(/^[0-9]*([.,][0-9]+)?$/, 'Debe ser un número válido')
  .optional()
  .or(z.literal(''))
  .nullable();

const animalSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  nombre_cientifico: z.string().nullable().optional(),
  dieta: z.string().nullable().optional(),
  esperanza_vida: z.string().nullable().optional(),
  habitat_principal: z.string().nullable().optional(),
  peso_promedio_kg: numericString,
  longitud_promedio_mt: numericString,
  descripcion: z.string().nullable().optional(),
  tipo_animal_id: z.string().min(1, 'El tipo de animal es requerido'),
});

type AnimalFormValues = z.infer<typeof animalSchema>;

interface AnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal?: Animal | null;
  tipos: TipoAnimal[];
  onCreateTipo?: (nombre: string) => Promise<any>;
  onUpdateTipo?: (args: { id: number; nombre: string }) => Promise<any>;
  onDeleteTipo?: (id: number) => Promise<any>;
}

export function AnimalModal({
  isOpen,
  onClose,
  animal,
  tipos,
  onCreateTipo,
  onUpdateTipo,
  onDeleteTipo,
}: AnimalModalProps) {
  const { createAnimal, updateAnimal, isCreating, isUpdating } = useAnimales();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      nombre: '',
      nombre_cientifico: '',
      dieta: '',
      esperanza_vida: '',
      habitat_principal: '',
      peso_promedio_kg: '',
      longitud_promedio_mt: '',
      descripcion: '',
      tipo_animal_id: '',
    },
  });

  const isLoading = isCreating || isUpdating;

  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [creatingTipo, setCreatingTipo] = useState(false);

  const [editingTipoId, setEditingTipoId] = useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = useState('');
  const [updatingTipoId, setUpdatingTipoId] = useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);

  useEffect(() => {
    if (animal) {
      reset({
        nombre: animal.nombre,
        nombre_cientifico: animal.nombre_cientifico || '',
        dieta: animal.dieta || '',
        esperanza_vida: animal.esperanza_vida || '',
        habitat_principal: animal.habitat_principal || '',
        peso_promedio_kg: animal.peso_promedio_kg?.toString() || '',
        longitud_promedio_mt: animal.longitud_promedio_mt?.toString() || '',
        descripcion: animal.descripcion || '',
        tipo_animal_id: animal.tipo_animal_id?.toString() || '',
      });
    } else {
      reset({
        nombre: '',
        nombre_cientifico: '',
        dieta: '',
        esperanza_vida: '',
        habitat_principal: '',
        peso_promedio_kg: '',
        longitud_promedio_mt: '',
        descripcion: '',
        tipo_animal_id: '',
      });
    }
    setShowNewTipo(false);
    setEditingTipoId(null);
  }, [animal, reset, isOpen]);

  const handleFormSubmit = async (values: AnimalFormValues) => {
    const cleanNumeric = (val: string | number | null | undefined) => {
      if (!val) return null;
      const cleaned = val.toString().replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    };

    const cleanData = {
      ...values,
      tipo_animal_id: parseInt(values.tipo_animal_id),
      peso_promedio_kg: cleanNumeric(values.peso_promedio_kg),
      longitud_promedio_mt: cleanNumeric(values.longitud_promedio_mt),
    };

    if (animal) {
      await updateAnimal({ id: animal.id, data: cleanData });
    } else {
      await createAnimal(cleanData as any);
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
      <DialogContent className="sm:max-w-125 border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Dog className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {animal ? 'Editar Animal' : 'Nuevo Animal'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {animal ? 'Modifica la información del animal' : 'Registra un nuevo animal en el sistema'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
          <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                Nombre del Animal <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('nombre')}
                placeholder="Ej. Ganado Vacuno"
                className={cn(
                  "h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                  errors.nombre && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500 ring-rose-500/20"
                )}
              />
              {errors.nombre && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Nombre Científico</label>
              <Input
                {...register('nombre_cientifico')}
                placeholder="Ej. Bos taurus"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all italic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                Tipo de Animal <span className="text-rose-500">*</span>
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

              <div className="flex items-center gap-2">
                <Select
                  onValueChange={(val) => setValue('tipo_animal_id', val, { shouldValidate: true })}
                  value={watch('tipo_animal_id')}
                >
                  <SelectTrigger className={cn(
                    "w-full h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all",
                    errors.tipo_animal_id && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                  )}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border max-h-62.5 min-w-var(--radix-select-trigger-width)" position="popper" sideOffset={2}>
                    {tipos.map((tipo) => (
                      <div key={tipo.id} className="group relative flex items-center">
                        <SelectItem value={tipo.id.toString()} className="cursor-pointer flex-1 pr-20">
                          {tipo.nombre}
                        </SelectItem>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                          <button
                            type="button"
                            disabled={deletingTipoId === tipo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTipoId(tipo.id);
                              setEditingTipoNombre(tipo.nombre);
                              setShowNewTipo(false);
                            }}
                            className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                            title="Editar tipo"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingTipoId === tipo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTipo(tipo.id);
                            }}
                            className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                            title="Eliminar tipo"
                          >
                            {deletingTipoId === tipo.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
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
                  className="size-12 shrink-0 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                  title="Crear nuevo tipo"
                >
                  <Plus className="size-5" />
                </Button>
              </div>
              {errors.tipo_animal_id && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">{errors.tipo_animal_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Dieta</label>
              <Input
                {...register('dieta')}
                placeholder="Ej. Herbívoro"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Esperanza de Vida</label>
              <Input
                {...register('esperanza_vida')}
                placeholder="Ej. 15-20 años"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Hábitat Principal</label>
              <Input
                {...register('habitat_principal')}
                placeholder="Ej. Llanuras, Granjas"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Peso Promedio (kg)</label>
              <Input
                {...register('peso_promedio_kg')}
                placeholder="0.00"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Longitud Promedio (m)</label>
              <Input
                {...register('longitud_promedio_mt')}
                placeholder="0.00"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Descripción (Opcional)</label>
              <Textarea
                {...register('descripcion')}
                placeholder="Breve descripción..."
                className="min-h-25 rounded-xl border-border bg-muted/10 focus:bg-background transition-all resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 pb-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6 cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all font-bold cursor-pointer">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                animal ? 'Guardar Cambios' : 'Registrar Animal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
