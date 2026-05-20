import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Car, Palette, Layers, Info } from 'lucide-react';
import { useVehiculos } from '@/hooks/use-vehiculos';
import type { Vehiculo } from '@/types/vehiculos';
import { cn } from '@/lib/utils';

const vehiculoSchema = z.object({
  placa: z.string()
    .min(3, 'La placa debe tener al menos 3 caracteres')
    .max(20, 'La placa no puede exceder los 20 caracteres')
    .toUpperCase(),
  marca: z.string().max(50, 'La marca no puede exceder los 50 caracteres').optional().or(z.literal('')),
  modelo: z.string().max(50, 'El modelo no puede exceder los 50 caracteres').optional().or(z.literal('')),
  tipo: z.enum(['MOTO', 'CARRO', 'CAMIONETA', 'OTRO']),
  color: z.string().max(30, 'El color no puede exceder los 30 caracteres').optional().or(z.literal('')),
  status: z.enum(['OPERATIVO', 'MANTENIMIENTO', 'INACTIVO']).default('OPERATIVO'),
});

interface VehiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo?: Vehiculo | null;
}

export function VehiculoModal({
  isOpen,
  onClose,
  vehiculo,
}: VehiculoModalProps) {
  const { createVehiculo, updateVehiculo, isCreating, isUpdating } = useVehiculos();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      tipo: 'CARRO' as 'MOTO' | 'CARRO' | 'CAMIONETA' | 'OTRO',
      color: '',
      status: 'OPERATIVO' as 'OPERATIVO' | 'MANTENIMIENTO' | 'INACTIVO',
    },
  });

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isOpen) {
      if (vehiculo) {
        reset({
          placa: vehiculo.placa,
          marca: vehiculo.marca || '',
          modelo: vehiculo.modelo || '',
          tipo: vehiculo.tipo || 'CARRO',
          color: vehiculo.color || '',
          status: (vehiculo.status as 'OPERATIVO' | 'MANTENIMIENTO' | 'INACTIVO') || 'OPERATIVO',
        });
      } else {
        reset({
          placa: '',
          marca: '',
          modelo: '',
          tipo: 'CARRO',
          color: '',
          status: 'OPERATIVO',
        });
      }
    }
  }, [vehiculo, reset, isOpen]);

  const onFormSubmit = async (values: z.infer<typeof vehiculoSchema>) => {
    const formattedValues = {
      placa: values.placa,
      marca: values.marca || null,
      modelo: values.modelo || null,
      tipo: values.tipo,
      color: values.color || null,
      status: values.status,
    };
    try {
      if (vehiculo) {
        await updateVehiculo({ id: vehiculo.id, data: formattedValues });
      } else {
        await createVehiculo(formattedValues);
      }
      onClose();
    } catch {
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="bg-primary/5 p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-2">
                <Car className="size-6 text-primary" />
                {vehiculo ? 'Editar Vehículo' : 'Registrar Vehículo'}
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">
                {vehiculo ? 'Actualiza los datos técnicos o estado del vehículo.' : 'Registra un nuevo vehículo para la logística e inspecciones de campo.'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="placa" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Placa / Matrícula <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground/60 select-none">
                    VE
                  </span>
                  <Input
                    id="placa"
                    {...register('placa')}
                    placeholder="AB123CD"
                    className={cn(
                      "h-12 pl-10 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-mono font-bold tracking-widest uppercase",
                      errors.placa && "border-rose-500/50 bg-rose-500/5 focus:border-rose-500"
                    )}
                  />
                </div>
                {errors.placa && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1 animate-in fade-in slide-in-from-left-1">{errors.placa.message as string}</p>}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Tipo de Vehículo <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  control={control}
                  name="tipo"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="tipo"
                        className={cn(
                          "w-full h-12 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-bold cursor-pointer",
                          errors.tipo && "border-rose-500/50"
                        )}
                      >
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border rounded-xl">
                        <SelectItem value="CARRO" className="cursor-pointer font-medium">Carro</SelectItem>
                        <SelectItem value="MOTO" className="cursor-pointer font-medium">Moto</SelectItem>
                        <SelectItem value="CAMIONETA" className="cursor-pointer font-medium">Camioneta</SelectItem>
                        <SelectItem value="OTRO" className="cursor-pointer font-medium">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipo && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1">{errors.tipo.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="marca" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Marca
                </Label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="marca"
                    {...register('marca')}
                    placeholder="Ej: Toyota, Chevrolet"
                    className="h-12 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-medium"
                  />
                </div>
                {errors.marca && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1">{errors.marca.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Modelo
                </Label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="modelo"
                    {...register('modelo')}
                    placeholder="Ej: Hilux, Aveo"
                    className="h-12 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-medium"
                  />
                </div>
                {errors.modelo && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1">{errors.modelo.message as string}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="color" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Color
                </Label>
                <div className="relative">
                  <Palette className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="color"
                    {...register('color')}
                    placeholder="Ej: Blanco, Rojo"
                    className="h-12 pl-11 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-medium"
                  />
                </div>
                {errors.color && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1">{errors.color.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-bold uppercase text-muted-foreground ml-1">
                  Estatus de Operación
                </Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="status"
                        className="w-full h-12 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm font-bold cursor-pointer"
                      >
                        <SelectValue placeholder="Seleccione un estatus" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect border-border rounded-xl">
                        <SelectItem value="OPERATIVO" className="cursor-pointer text-emerald-600 font-bold">OPERATIVO</SelectItem>
                        <SelectItem value="MANTENIMIENTO" className="cursor-pointer text-amber-600 font-bold">MANTENIMIENTO</SelectItem>
                        <SelectItem value="INACTIVO" className="cursor-pointer text-rose-600 font-bold">INACTIVO</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider pl-1">{errors.status.message as string}</p>}
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-2xl border border-blue-500/10 bg-blue-500/5 items-start">
              <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Los vehículos registrados aquí estarán disponibles en el módulo de <strong>Planificación de Inspecciones</strong> para ser asignados a las rutas de campo oficiales.
              </p>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-6 border-t border-border/50 gap-2 sm:gap-0">
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
                  <Loader2 className="mr-2 size-4 animate-spin" /> Guardando...
                </>
              ) : vehiculo ? 'Guardar Cambios' : 'Registrar Vehículo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
