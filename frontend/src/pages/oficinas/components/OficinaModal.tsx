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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Building2, MapPin, Globe } from 'lucide-react';
import { useOficinas } from '@/hooks/use-oficinas';
import type { Oficina } from '@/types/oficinas';
import { cn } from '@/lib/utils';

const oficinaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  ubicacion_gms: z.string().optional().or(z.literal('')),
  es_centro_validacion: z.boolean().default(false),
  direccion: z.string().optional().or(z.literal('')),
});

interface OficinaModalProps {
  isOpen: boolean;
  onClose: () => void;
  oficina?: Oficina | null;
}

export function OficinaModal({
  isOpen,
  onClose,
  oficina,
}: OficinaModalProps) {
  const { createOficina, updateOficina, isCreating, isUpdating } = useOficinas();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(oficinaSchema),
    defaultValues: {
      nombre: '',
      ubicacion_gms: '',
      es_centro_validacion: false,
      direccion: '',
    },
  });

  const isLoading = isCreating || isUpdating;
  const isCentroVal = watch('es_centro_validacion');

  useEffect(() => {
    if (isOpen) {
      if (oficina) {
        reset({
          nombre: oficina.nombre,
          ubicacion_gms: oficina.ubicacion_gms || '',
          es_centro_validacion: oficina.es_centro_validacion,
          direccion: oficina.direccion || '',
        });
      } else {
        reset({
          nombre: '',
          ubicacion_gms: '',
          es_centro_validacion: false,
          direccion: '',
        });
      }
    }
  }, [oficina, reset, isOpen]);

  const onFormSubmit = async (values: z.infer<typeof oficinaSchema>) => {
    if (oficina) {
      await updateOficina({ id: oficina.id, ...values });
    } else {
      await createOficina(values);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl glass-effect border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden p-0 flex flex-col max-h-[min(92vh,48rem)]">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden min-w-0 max-w-full">
          <div className="bg-primary/5 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/50 shrink-0 pr-12">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2 truncate">
                <Building2 className="size-5 sm:size-6 text-primary shrink-0" />
                <span className="truncate">{oficina ? 'Editar Oficina' : 'Nueva Oficina'}</span>
              </DialogTitle>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-0.5 truncate">
                {oficina ? 'Actualiza los datos de la oficina o sede.' : 'Registra una nueva sede administrativa o operativa.'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-w-0 space-y-4 sm:space-y-5">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="nombre" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Nombre de la Oficina <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  {...register('nombre')}
                  placeholder="Ej: Sede Principal Caracas"
                  className={cn(
                    "h-12 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm w-full",
                    errors.nombre && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                  )}
                />
              </div>
              {errors.nombre && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">{errors.nombre.message as string}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0 max-w-full">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="ubicacion_gms" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Ubicación GMS
                </Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="ubicacion_gms"
                    {...register('ubicacion_gms')}
                    placeholder="Coordenadas..."
                    className="h-12 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 p-3.5 rounded-2xl border border-border bg-background/30 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <Label htmlFor="es_centro" className="text-[11px] font-bold uppercase text-muted-foreground truncate">
                    Centro de Validación
                  </Label>
                  <Switch
                    id="es_centro"
                    checked={isCentroVal}
                    onCheckedChange={(v) => setValue('es_centro_validacion', v)}
                    className="shrink-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="direccion" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                Dirección Física
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 size-4 text-muted-foreground" />
                <Textarea
                  id="direccion"
                  {...register('direccion')}
                  placeholder="Indique la dirección detallada..."
                  className="min-h-25 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm resize-none w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-3 sm:p-4 border-t border-border/50 shrink-0 flex flex-row items-center justify-between w-full gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-2xl h-11 px-4 sm:px-6 font-bold hover:bg-background transition-all cursor-pointer text-xs sm:text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl h-11 px-5 sm:px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer text-xs sm:text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Guardando...
                </>
              ) : oficina ? 'Guardar Cambios' : 'Registrar Oficina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
