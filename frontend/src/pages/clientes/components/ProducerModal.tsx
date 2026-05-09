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
import { useClientes } from '@/hooks/use-clientes';
import type { Cliente } from '@/types/clientes';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const producerSchema = z.object({
  cedula_rif: z.string().min(6, 'Mínimo 6 caracteres'),
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  codigo_runsai: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion_fiscal: z.string().optional(),
});

type ProducerFormValues = z.infer<typeof producerSchema>;

interface ProducerModalProps {
  isOpen: boolean;
  onClose: () => void;
  producer: Cliente | null;
}

export function ProducerModal({ isOpen, onClose, producer }: ProducerModalProps) {
  const { updateCliente } = useClientes();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProducerFormValues>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      cedula_rif: '',
      nombre: '',
      codigo_runsai: '',
      telefono: '',
      email: '',
      direccion_fiscal: '',
    },
  });

  useEffect(() => {
    if (producer) {
      form.reset({
        cedula_rif: producer.cedula_rif,
        nombre: producer.nombre,
        codigo_runsai: producer.codigo_runsai || '',
        telefono: producer.telefono || '',
        email: producer.email || '',
        direccion_fiscal: producer.direccion_fiscal || '',
      });
    }
  }, [producer, form]);

  const onSubmit = async (values: ProducerFormValues) => {
    if (!producer) return;
    setIsSubmitting(true);
    try {
      await updateCliente({ id: producer.id, data: values });
      toast.success('Productor actualizado exitosamente');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el productor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125 border-none shadow-2xl glass-effect p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <User className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                Editar Productor
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Actualiza los datos de contacto y fiscales del productor seleccionado
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Cédula / RIF <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...form.register('cedula_rif')}
                  readOnly
                  className="h-12 rounded-xl border-border bg-muted/20 focus:bg-background transition-all font-bold text-foreground/50 cursor-not-allowed shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Código RUNSAI
                </label>
                <Input
                  {...form.register('codigo_runsai')}
                  placeholder="Ej. RUN-001"
                  className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                Nombre o Razón Social <span className="text-rose-500">*</span>
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
                  Teléfono
                </label>
                <Input
                  {...form.register('telefono')}
                  className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                  Email
                </label>
                <Input
                  {...form.register('email')}
                  type="email"
                  className="h-12 rounded-xl border-border bg-muted/10 focus:bg-background transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">
                Dirección Fiscal
              </label>
              <Textarea
                {...form.register('direccion_fiscal')}
                className="min-h-24 rounded-xl border-border bg-muted/10 focus:bg-background transition-all resize-none shadow-sm"
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
              disabled={isSubmitting}
              className="rounded-xl h-12 px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all font-bold cursor-pointer"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
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
