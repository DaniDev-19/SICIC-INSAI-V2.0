import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  KeyRound,
  Mail,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { type AxiosError } from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useLoginInstances } from '@/hooks/use-login-instances';
import { authService } from '@/services/auth.service';

const requestSchema = z.object({
  email: z.string().email('Introduce un correo electrónico válido'),
  instanceId: z.string().min(1, 'Debes seleccionar una sede / estado'),
});

const resetSchema = z
  .object({
    token: z.string().min(4, 'Ingresa el código de 6 dígitos enviado'),
    newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RequestFormValues = z.infer<typeof requestSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultInstanceId?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = '',
  defaultInstanceId = '',
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  // Step 1 Form
  const {
    register: registerReq,
    handleSubmit: handleSubmitReq,
    control: controlReq,
    watch: watchReq,
    setValue: setValueReq,
    formState: { errors: errorsReq },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      email: defaultEmail,
      instanceId: defaultInstanceId,
    },
  });

  // Step 2 Form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setValueReset,
    formState: { errors: errorsReset },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailVal = watchReq('email');
  const instanceIdVal = watchReq('instanceId');
  const emailIsValid = z.string().email().safeParse(emailVal.trim()).success;
  const { data: instances = [], isLoading: isLoadingInstances } = useLoginInstances(emailVal);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDevToken(null);
      setIsSubmitting(false);
      if (defaultEmail) setValueReq('email', defaultEmail);
      if (defaultInstanceId) setValueReq('instanceId', defaultInstanceId);
    }
  }, [isOpen, defaultEmail, defaultInstanceId, setValueReq]);

  // Request Code (Step 1)
  const onRequestCode = async (data: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authService.requestPasswordReset({
        email: data.email.trim(),
        instanceId: data.instanceId,
      });

      if (res.data?.token) {
        setDevToken(res.data.token);
        setValueReset('token', res.data.token);
      }

      toast.success('Solicitud procesada', {
        description: res.message || 'Código de recuperación listo.',
      });

      setStep(2);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error('Error al solicitar recuperación', {
        description: error.response?.data?.message || 'No se pudo generar el código.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password (Step 2)
  const onResetPassword = async (data: ResetFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: emailVal.trim(),
        instanceId: instanceIdVal,
        token: data.token.trim(),
        newPassword: data.newPassword,
      });

      toast.success('¡Contraseña restablecida!', {
        description: res.message,
      });

      setStep(3);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error('Error al restablecer contraseña', {
        description: error.response?.data?.message || 'El código es inválido o ha expirado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] glass-effect border-emerald-500/20 max-w-md rounded-3xl p-0 text-foreground shadow-2xl overflow-hidden flex flex-col max-h-[min(92vh,42rem)]">
        <DialogHeader className="flex flex-col items-center text-center space-y-2 p-6 pb-4 border-b border-border/30 shrink-0">
          <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner mb-1">
            {step === 3 ? (
              <CheckCircle2 className="size-8 text-emerald-500 animate-in zoom-in duration-500" />
            ) : (
              <KeyRound className="size-8 text-emerald-500" />
            )}
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {step === 1 && 'Recuperar Contraseña'}
            {step === 2 && 'Ingresar Código de Seguridad'}
            {step === 3 && '¡Contraseña Restablecida!'}
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs">
            {step === 1 &&
              'Ingrese su correo registrado y seleccione la sede para solicitar el código de recuperación.'}
            {step === 2 &&
              'Hemos enviado las instrucciones. Ingrese el código recibido y configure su nueva contraseña.'}
            {step === 3 &&
              'Su clave de acceso ha sido actualizada correctamente en el sistema.'}
          </DialogDescription>
        </DialogHeader>

        {/* Indicators Steps */}
        <div className="flex items-center justify-center gap-2 py-3 border-b border-border/20 bg-muted/5 shrink-0">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step >= 1 ? 'w-8 bg-emerald-500' : 'w-2 bg-muted'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step >= 2 ? 'w-8 bg-emerald-500' : 'w-2 bg-muted'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              step >= 3 ? 'w-8 bg-emerald-500' : 'w-2 bg-muted'
            }`}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
          {/* STEP 1: REQUEST CODE */}
          {step === 1 && (
            <form onSubmit={handleSubmitReq(onRequestCode)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...registerReq('email')}
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="pl-10 h-12 rounded-xl bg-muted/40 border-border focus-visible:ring-emerald-500/30 text-sm"
                    disabled={isSubmitting}
                  />
                </div>
                {errorsReq.email && (
                  <p className="text-xs text-rose-500 ml-2">{errorsReq.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 ml-1">
                  Sede / Estado
                </label>
                <Controller
                  name="instanceId"
                  control={controlReq}
                  render={({ field }) => (
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 z-10" />
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting || !emailIsValid || isLoadingInstances}
                      >
                        <SelectTrigger className="w-full pl-10 h-12 rounded-xl bg-muted/40 border-border text-sm">
                          <SelectValue
                            placeholder={
                              !emailIsValid
                                ? 'Ingrese correo válido primero'
                                : isLoadingInstances
                                ? 'Cargando sedes...'
                                : instances.length === 0
                                ? 'Sin sedes asociadas'
                                : 'Seleccione sede'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="glass-effect rounded-2xl border-border">
                          {instances.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id.toString()}>
                              {inst.nombre_mostrable}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />
                {errorsReq.instanceId && (
                  <p className="text-xs text-rose-500 ml-2">{errorsReq.instanceId.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !emailIsValid}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Generando Código...
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* STEP 2: ENTER TOKEN & NEW PASSWORD */}
          {step === 2 && (
            <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-4">
              {devToken && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    🔑 Código de prueba generado: <span className="font-mono text-base font-black">{devToken}</span>
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 ml-1">
                  Código de Recuperación
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...registerReset('token')}
                    type="text"
                    placeholder="123456"
                    className="pl-10 h-12 rounded-xl bg-muted/40 border-border focus-visible:ring-emerald-500/30 text-sm font-mono tracking-widest font-bold text-center uppercase"
                    disabled={isSubmitting}
                  />
                </div>
                {errorsReset.token && (
                  <p className="text-xs text-rose-500 ml-2">{errorsReset.token.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 ml-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...registerReset('newPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 rounded-xl bg-muted/40 border-border focus-visible:ring-emerald-500/30 text-sm"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errorsReset.newPassword && (
                  <p className="text-xs text-rose-500 ml-2">{errorsReset.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 ml-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...registerReset('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 rounded-xl bg-muted/40 border-border focus-visible:ring-emerald-500/30 text-sm"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errorsReset.confirmPassword && (
                  <p className="text-xs text-rose-500 ml-2">{errorsReset.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="w-1/3 h-12 rounded-2xl cursor-pointer font-bold"
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    'Restablecer'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                  Su contraseña para <span className="font-bold">{emailVal}</span> se actualizó correctamente. Ya puede ingresar al sistema.
                </p>
              </div>

              <Button
                type="button"
                onClick={onClose}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Iniciar Sesión
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
