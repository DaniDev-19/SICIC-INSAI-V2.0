import React, { useEffect } from 'react';
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
import { usePropiedades } from '@/hooks/use-propiedades';
import type { Propiedad } from '@/types/propiedades';
import { Loader2, Home, MapPin, Scale, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const propertySchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  codigo_insai: z.string().optional(),
  rif: z.string().optional(),
  punto_referencia: z.string().optional(),
  hectareas_totales: z.string().optional(),
  tipo_propiedad_id: z.string().min(1, 'El tipo de propiedad es requerido'),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propiedad: Propiedad | null;
}

export function PropertyModal({ isOpen, onClose, propiedad }: PropertyModalProps) {
  const { updatePropiedad, tipos, isUpdating, createTipo, updateTipo, deleteTipo } = usePropiedades();

  const [showNewTipo, setShowNewTipo] = React.useState(false);
  const [newTipoNombre, setNewTipoNombre] = React.useState('');
  const [creatingTipo, setCreatingTipo] = React.useState(false);

  const [editingTipoId, setEditingTipoId] = React.useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = React.useState('');
  const [updatingTipoId, setUpdatingTipoId] = React.useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = React.useState<number | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      nombre: '',
      codigo_insai: '',
      rif: '',
      punto_referencia: '',
      hectareas_totales: '0',
      tipo_propiedad_id: '',
    },
  });

  useEffect(() => {
    if (propiedad) {
      form.reset({
        nombre: propiedad.nombre,
        codigo_insai: propiedad.codigo_insai || '',
        rif: propiedad.rif || '',
        punto_referencia: propiedad.punto_referencia || '',
        hectareas_totales: propiedad.hectareas_totales?.toString() || '0',
        tipo_propiedad_id: propiedad.tipo_propiedad_id?.toString() || '',
      });
    }
    setShowNewTipo(false);
    setEditingTipoId(null);
  }, [propiedad, form]);

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
    } catch { /* error handled by hook */ } finally {
      setUpdatingTipoId(null);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    setDeletingTipoId(id);
    try {
      await deleteTipo(id);
    } catch { /* error handled by hook */ } finally {
      setDeletingTipoId(null);
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    if (!propiedad) return;

    try {
      await updatePropiedad({
        id: propiedad.id,
        data: {
          ...values,
          tipo_propiedad_id: values.tipo_propiedad_id ? parseInt(values.tipo_propiedad_id) : null,
          hectareas_totales: values.hectareas_totales ? parseFloat(values.hectareas_totales) : 0
        }
      });
      onClose();
    } catch (error: any) {
      // Error handled by useMutation onError
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[42rem] border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Home className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Editar Propiedad
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Actualiza los datos básicos de la unidad de producción
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                Nombre de la Propiedad <span className="text-rose-500">*</span>
              </label>
              <Input
                {...form.register('nombre')}
                className={cn(
                  "h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all font-bold",
                  form.formState.errors.nombre && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500 ring-rose-500/20"
                )}
              />
              {form.formState.errors.nombre && (
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Código INSAI
                </label>
                <Input
                  {...form.register('codigo_insai')}
                  placeholder="PRO-202X-XXXX"
                  className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  RIF (Si aplica)
                </label>
                <Input
                  {...form.register('rif')}
                  placeholder="J-XXXXXXXXX"
                  className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Hectáreas Totales
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    {...form.register('hectareas_totales')}
                    type="number"
                    step="0.01"
                    className="h-12 pl-10 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm font-bold text-emerald-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Tipo de Propiedad <span className="text-rose-500">*</span>
                </label>

                {showNewTipo && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 mb-2">
                    <Input
                      value={newTipoNombre}
                      onChange={(e) => setNewTipoNombre(e.target.value)}
                      placeholder="Nuevo tipo..."
                      className="h-9 rounded-lg text-sm border-primary/30 focus:border-primary bg-background"
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
                      placeholder="Editar nombre..."
                      className="h-9 rounded-lg text-sm border-blue-500/30 focus:border-blue-500 bg-background"
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
                    value={form.watch('tipo_propiedad_id') || ''}
                    onValueChange={(val) => form.setValue('tipo_propiedad_id', val)}
                  >
                    <SelectTrigger className="w-full h-12 cursor-pointer rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-border rounded-2xl shadow-2xl max-h-[250px] min-w-(--radix-select-trigger-width)" position="popper" sideOffset={2}>
                      {tipos.map(t => (
                        <div key={t.id} className="group relative flex items-center">
                          <SelectItem value={t.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-20">
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
                      {tipos.length === 0 && (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No hay tipos registrados. Usa el botón <strong>+</strong> para crear uno.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setShowNewTipo(!showNewTipo); setEditingTipoId(null); }}
                    className="size-12 shrink-0 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                    title="Crear nuevo tipo"
                  >
                    <Plus className="size-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1  flex items-center gap-2">
                <MapPin className="size-3" /> Punto de Referencia
              </label>
              <Textarea
                {...form.register('punto_referencia')}
                placeholder="Indique referencias cercanas para llegar al predio..."
                className="min-h-24 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 pb-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl h-12 px-6 cursor-pointer font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all font-bold cursor-pointer"
            >
              {isUpdating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Actualizando...</>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
