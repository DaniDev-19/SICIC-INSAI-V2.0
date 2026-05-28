import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { Stepper } from '@/components/ui/Stepper';
import { useUsers } from '@/hooks/use-users';
import { useInstancesOptions } from '@/hooks/use-instances';
import { roleService } from '@/services/role.service';
import type { MasterUser } from '@/types/user';
import { cn } from '@/lib/utils';

const credentialsSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  status: z.boolean(),
});

const editSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.union([z.literal(''), z.string().min(6, 'Mínimo 6 caracteres')]).optional(),
  status: z.boolean(),
});

const WIZARD_STEPS = [
  { title: 'Credenciales', description: 'Cuenta global' },
  { title: 'Acceso', description: 'Instancia y rol' },
];

type UsuarioFormValues = {
  username: string;
  email: string;
  password?: string;
  status: boolean;
};

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: MasterUser | null;
}

export function UsuarioModal({ isOpen, onClose, user }: UsuarioModalProps) {
  const { createUser, updateUser, isCreating, isUpdating } = useUsers();
  const isEditing = !!user;
  const [step, setStep] = useState(0);
  const [instanciaId, setInstanciaId] = useState('');
  const [rolId, setRolId] = useState('');

  const { data: instances = [] } = useInstancesOptions(isOpen && !isEditing);
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-options'],
    queryFn: () => roleService.getRoles({ limit: 200, status: 'true' }),
    enabled: isOpen && !isEditing,
    select: (res) => res.data || [],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEditing ? editSchema : credentialsSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      status: true,
    },
  });

  const status = watch('status');
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setInstanciaId('');
    setRolId('');
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        password: '',
        status: user.status,
      });
    } else {
      reset({ username: '', email: '', password: '', status: true });
    }
  }, [user, reset, isOpen]);

  const handleNextStep = async () => {
    const valid = await trigger(['username', 'email', 'password']);
    if (valid) setStep(1);
  };

  const onFormSubmit = async (values: UsuarioFormValues, withAssignment = false) => {
    if (user) {
      const payload: Record<string, unknown> = {
        username: values.username,
        email: values.email,
        status: values.status,
      };
      if (values.password && values.password.length >= 6) {
        payload.password = values.password;
      }
      await updateUser({ id: user.id, ...payload });
    } else {
      if (!values.password || values.password.length < 6) return;
      const payload: Parameters<typeof createUser>[0] = {
        username: values.username,
        email: values.email,
        password: values.password,
        status: values.status,
      };
      if (withAssignment && instanciaId && rolId) {
        payload.initial_assignment = {
          instancia_id: Number(instanciaId),
          rol_id: Number(rolId),
        };
      }
      await createUser(payload);
    }
    onClose();
  };

  const canSubmitCreate = instanciaId && rolId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <form
          key={user?.id ?? 'new'}
          onSubmit={isEditing ? handleSubmit((values) => onFormSubmit(values)) : (e) => e.preventDefault()}
        >
          <div className="bg-primary/5 p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="size-6 text-primary" />
                {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
              </DialogTitle>
            </DialogHeader>
            {!isEditing && (
              <div className="mt-6 px-2">
                <Stepper steps={WIZARD_STEPS} currentStep={step} className="mb-0" />
              </div>
            )}
          </div>

          <div className="p-8 space-y-5">
            {(isEditing || step === 0) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario *</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      {...register('username')}
                      className={cn('h-11 pl-11 rounded-xl', errors.username && 'border-rose-500')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-rose-500">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className={cn('h-11 pl-11 rounded-xl', errors.email && 'border-rose-500')}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña {isEditing ? '(opcional)' : '*'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      className={cn('h-11 pl-11 rounded-xl', errors.password && 'border-rose-500')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <Label htmlFor="status">Usuario activo</Label>
                  <Switch
                    id="status"
                    checked={status}
                    onCheckedChange={(v) => setValue('status', v)}
                  />
                </div>
              </>
            )}

            {!isEditing && step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Asigne una sede y rol para que el usuario pueda iniciar sesión. Puede omitir este paso y configurarlo después.
                </p>
                <div className="space-y-2">
                  <Label>Instancia</Label>
                  <Select value={instanciaId} onValueChange={setInstanciaId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {instances.map((inst) => (
                        <SelectItem key={inst.id} value={String(inst.id)}>
                          {inst.nombre_mostrable}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={rolId} onValueChange={setRolId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((rol) => (
                        <SelectItem key={rol.id} value={String(rol.id)}>
                          {rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-border/50 gap-2 flex-wrap sm:justify-end">
            {isEditing ? (
              <>
                <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading} className="rounded-xl">
                  {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                  Guardar
                </Button>
              </>
            ) : step === 0 ? (
              <>
                <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
                  Cancelar
                </Button>
                <Button type="button" variant="primary" onClick={handleNextStep} className="rounded-xl">
                  Siguiente
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => setStep(0)} className="rounded-xl">
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  className="rounded-xl"
                  onClick={handleSubmit((values) => onFormSubmit(values, false))}
                >
                  Omitir
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={isLoading || !canSubmitCreate}
                  className="rounded-xl"
                  onClick={handleSubmit((values) => onFormSubmit(values, true))}
                >
                  {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                  Crear usuario
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
