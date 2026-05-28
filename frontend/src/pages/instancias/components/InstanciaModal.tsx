import { useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Server, Database } from 'lucide-react';
import { useInstances } from '@/hooks/use-instances';
import type { MasterInstance } from '@/types/instance';
import { cn } from '@/lib/utils';

const dbNameRegex = /^[a-z][a-z0-9_]*$/;

const schema = z.object({
  nombre_mostrable: z.string().min(3, 'Mínimo 3 caracteres'),
  db_name: z
    .string()
    .min(3)
    .regex(dbNameRegex, 'Solo minúsculas, números y guión bajo (ej: db_insai_operativa)'),
  status: z.boolean(),
});

interface InstanciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance?: MasterInstance | null;
}

export function InstanciaModal({ isOpen, onClose, instance }: InstanciaModalProps) {
  const { createInstance, updateInstance, isCreating, isUpdating } = useInstances();
  const isEditing = !!instance;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre_mostrable: '', db_name: '', status: true },
  });

  const status = watch('status');
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;
    if (instance) {
      reset({
        nombre_mostrable: instance.nombre_mostrable,
        db_name: instance.db_name,
        status: instance.status,
      });
    } else {
      reset({ nombre_mostrable: '', db_name: '', status: true });
    }
  }, [instance, reset, isOpen]);

  const onFormSubmit = async (values: z.infer<typeof schema>) => {
    if (instance) {
      await updateInstance({
        id: instance.id,
        nombre_mostrable: values.nombre_mostrable,
        status: values.status,
      });
    } else {
      await createInstance(values);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="bg-primary/5 p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Server className="size-6 text-primary" />
                {isEditing ? 'Editar instancia' : 'Nueva instancia'}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre_mostrable">Nombre visible *</Label>
              <Input
                id="nombre_mostrable"
                {...register('nombre_mostrable')}
                placeholder="Ej: Sede Yaracuy"
                className={cn('h-11 rounded-xl', errors.nombre_mostrable && 'border-rose-500')}
              />
              {errors.nombre_mostrable && (
                <p className="text-xs text-rose-500">{errors.nombre_mostrable.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="db_name">Nombre de base de datos *</Label>
              <div className="relative">
                <Database className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="db_name"
                  {...register('db_name')}
                  disabled={isEditing}
                  placeholder="db_insai_operativa"
                  className={cn(
                    'h-11 pl-11 rounded-xl font-mono text-sm',
                    errors.db_name && 'border-rose-500',
                    isEditing && 'opacity-60'
                  )}
                />
              </div>
              {errors.db_name && (
                <p className="text-xs text-rose-500">{errors.db_name.message}</p>
              )}
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  El nombre de la base de datos no se puede modificar.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <Label htmlFor="status">Instancia activa</Label>
              <Switch
                id="status"
                checked={status}
                onCheckedChange={(v) => setValue('status', v)}
              />
            </div>
          </div>

          <DialogFooter className="p-6 border-t border-border/50 gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="rounded-xl">
              {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
              {isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
