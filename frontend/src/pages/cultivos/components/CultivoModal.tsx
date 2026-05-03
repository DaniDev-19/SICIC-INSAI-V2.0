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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Cultivo, TipoCultivo } from '@/types/cultivos';
import { Sprout, Loader2 } from 'lucide-react';

const cultivoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  nombre_cientifico: z.string().nullable().optional(),
  descripcion: z.string().nullable().optional(),
  tipo_cultivo_id: z.string().min(1, 'El tipo de cultivo es requerido'),
});

type CultivoFormValues = z.infer<typeof cultivoSchema>;

interface CultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  cultivo?: Cultivo | null;
  tipos: TipoCultivo[];
  isLoading?: boolean;
}

export function CultivoModal({
  isOpen,
  onClose,
  onSubmit,
  cultivo,
  tipos,
  isLoading,
}: CultivoModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CultivoFormValues>({
    resolver: zodResolver(cultivoSchema),
    defaultValues: {
      nombre: '',
      nombre_cientifico: '',
      descripcion: '',
      tipo_cultivo_id: '',
    },
  });

  useEffect(() => {
    if (cultivo) {
      reset({
        nombre: cultivo.nombre,
        nombre_cientifico: cultivo.nombre_cientifico || '',
        descripcion: cultivo.descripcion || '',
        tipo_cultivo_id: cultivo.tipo_cultivo_id?.toString() || '',
      });
    } else {
      reset({
        nombre: '',
        nombre_cientifico: '',
        descripcion: '',
        tipo_cultivo_id: '',
      });
    }
  }, [cultivo, reset, isOpen]);

  const handleFormSubmit = async (values: CultivoFormValues) => {
    await onSubmit({
      ...values,
      tipo_cultivo_id: parseInt(values.tipo_cultivo_id),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Sprout className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {cultivo ? 'Editar Cultivo' : 'Nuevo Cultivo'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {cultivo ? 'Modifica la información del cultivo' : 'Registra un nuevo tipo de cultivo en el sistema'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Nombre del Cultivo</label>
              <Input
                {...register('nombre')}
                placeholder="Ej. Maíz Amarillo"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
              {errors.nombre && <p className="text-xs text-rose-500 font-medium pl-1">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Nombre Científico</label>
              <Input
                {...register('nombre_cientifico')}
                placeholder="Ej. Zea mays"
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all italic"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Tipo de Cultivo</label>
              <Select
                onValueChange={(val) => setValue('tipo_cultivo_id', val)}
                defaultValue={cultivo?.tipo_cultivo_id?.toString() || ''}
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border">
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()} className="cursor-pointer">
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_cultivo_id && <p className="text-xs text-rose-500 font-medium pl-1">{errors.tipo_cultivo_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Descripción (Opcional)</label>
              <Input
                {...register('descripcion')}
                placeholder="Breve descripción..."
                className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-6">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all font-bold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                cultivo ? 'Guardar Cambios' : 'Registrar Cultivo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
