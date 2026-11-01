import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Loader2, Eye, EyeOff, Building2, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { type AxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import image from '@/components/image';
import { useAuth } from '@/hooks/use-auth';
import { useLoginInstances } from '@/hooks/use-login-instances';
import { useVerifyMfaLogin } from '@/hooks/use-mfa';
import ForgotPasswordModal from './ForgotPasswordModal';
import ForceLoginModal from './ForceLoginModal';
import type { LoginResponse } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Introduce un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  instanceId: z.string().min(1, 'Debes seleccionar una instancia/estado'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isForceModalOpen, setIsForceModalOpen] = useState(false);
  const [isForceLogoutFlow, setIsForceLogoutFlow] = useState(false);

  // Estado para el segundo paso MFA
  const [mfaPendingToken, setMfaPendingToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const { login, isLoggingIn, isAuthenticated } = useAuth();
  const verifyMfaMutation = useVerifyMfaLogin();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      instanceId: '',
    },
  });

  const email = watch('email');
  const instanceId = watch('instanceId');
  const { data: instances = [], isLoading: isLoadingInstances, isFetching } = useLoginInstances(email);
  const emailIsValid = z.string().email().safeParse(email.trim()).success;

  useEffect(() => {
    if (!instanceId) return;
    const stillValid = instances.some((inst) => String(inst.id) === instanceId);
    if (!stillValid) {
      setValue('instanceId', '');
    }
  }, [instances, instanceId, setValue]);

  // Estado para bloqueo progresivo por intentos fallidos (HTTP 423)
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [lockoutMessage, setLockoutMessage] = useState<string | null>(null);

  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setLockoutMessage(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (isAuthenticated) {
      toast.info('Ya tienes una sesión activa. Redirigiendo...');
      navigate('/home');
      return;
    }

    try {
      const res = await login(data);

      if (res?.data?.mfaRequired && res.data.mfaPendingToken) {
        setMfaPendingToken(res.data.mfaPendingToken);
        toast.info('Autenticación de Dos Factores requerida', {
          description: 'Ingrese el código de su app autenticadora o un código de respaldo.',
        });
        return;
      }

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

      toast.success('¡Bienvenido al sistema SICIC-INSAI!');
      navigate('/home');
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; data?: { retryAfterMs?: number } }>;
      if (!error.response && error.request) {
        toast.error('Error de Conexión', {
          description: 'No se pudo contactar con el servidor. Verifique su internet.',
          duration: 5000,
        });
        return;
      }

      if (error.response?.status === 423) {
        const retryMs = error.response.data?.data?.retryAfterMs || 5 * 60 * 1000;
        const secs = Math.ceil(retryMs / 1000);
        setLockoutSeconds(secs);
        setLockoutMessage(error.response.data?.message || 'Cuenta bloqueada temporalmente.');
        toast.warning('Bloqueo por Intentos Fallidos', {
          description: error.response.data?.message,
          duration: 8000,
        });
        return;
      }

      if (error.response?.status === 409) {
        setIsForceModalOpen(true);
        toast.warning('Sesión Activa Detectada', {
          description: error.response.data?.message || 'Ya existe una sesión activa con esta cuenta.',
          duration: 6000,
        });
        return;
      }

      if (error.response?.status === 429) {
        toast.warning('Acceso Restringido', {
          description: error.response.data?.message || 'Demasiados intentos. Intente más tarde.',
        });
        return;
      }

      const message = error.response?.data?.message || 'Credenciales inválidas';
      toast.error('Fallo de Autenticación', {
        description: message,
      });
    }
  };

  const handleForceLoginSuccess = (res: LoginResponse) => {
    if (res?.data?.mfaRequired && res.data.mfaPendingToken) {
      setMfaPendingToken(res.data.mfaPendingToken);
      setIsForceLogoutFlow(Boolean(res.data.isForceLogout));
      toast.info('Autenticación de Dos Factores requerida', {
        description: 'Ingrese el código de su aplicación autenticadora para finalizar la desconexión e ingresar.',
      });
      return;
    }

    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
    }

    queryClient.setQueryData(['auth-user'], res);
    toast.success('Sesión previa desconectada exitosamente', {
      description: '¡Bienvenido al sistema SICIC-INSAI!',
    });
    navigate('/home');
  };

  const handleVerifyMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPendingToken || !mfaCode.trim()) return;

    verifyMfaMutation.mutate(
      { mfaPendingToken, code: mfaCode.trim() },
      {
        onSuccess: (res) => {
          if (res.data?.token) {
            localStorage.setItem('token', res.data.token);
          }
          queryClient.setQueryData(['auth-user'], res);
          toast.success(
            isForceLogoutFlow
              ? '¡Sesión previa desconectada y acceso autorizado!'
              : '¡Autenticación MFA Exitosa!',
            {
              description: 'Bienvenido al sistema SICIC-INSAI.',
            }
          );
          navigate('/home');
        },
      }
    );
  };

  const instancesLoading = emailIsValid && (isLoadingInstances || isFetching);


  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 transition-colors duration-500">
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${image.fondo})` }}
      />
      <div className="hidden md:block absolute inset-0 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-[1px] transition-colors duration-500" />

      <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none bg-linear-to-b from-[#02130c] via-[#041c12] to-[#010905]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(52, 211, 153, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/25 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-[90px] animate-pulse duration-1000" />
        <div className="absolute -bottom-20 left-10 w-64 h-64 bg-amber-500/15 rounded-full blur-[80px] animate-pulse duration-700" />

        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="agroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="50%"
            cy="36%"
            r="160"
            fill="none"
            stroke="url(#agroGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-[spin_45s_linear_infinite]"
          />
          <circle
            cx="50%"
            cy="36%"
            r="220"
            fill="none"
            stroke="url(#agroGrad)"
            strokeWidth="1"
            strokeDasharray="8 8"
            className="animate-[spin_70s_linear_infinite_reverse]"
          />
          <circle
            cx="50%"
            cy="36%"
            r="280"
            fill="none"
            stroke="url(#agroGrad)"
            strokeWidth="0.5"
            strokeDasharray="6 12"
          />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[88%] xs:max-w-sm sm:max-w-94.5 p-1 sm:p-0">
        <div className="backdrop-blur-2xl bg-white/10 dark:bg-emerald-950/20 border border-white/20 dark:border-white/10 rounded-3xl sm:rounded-[2.2rem] shadow-2xl overflow-hidden transition-all duration-500 group hover:shadow-emerald-500/20">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col items-center mb-4 sm:mb-6">
              <div className="p-2 mb-2 animate-in fade-in zoom-in duration-1000">
                <img
                  src={image.icon}
                  title='SICIC-INSAI-V2.0 LOGO'
                  alt="SICIC-INSAI-v2.0 LOGO"
                  className="w-25 h-25 sm:w-25 sm:h-25 object-contain drop-shadow-xl"
                />
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight text-center">SICIC-INSAI</h1>
              <p className="text-emerald-50/60 dark:text-emerald-50/40 mt-0.5 sm:mt-1 text-xs font-medium tracking-wide">Vigilancia y Control</p>
            </div>

            {mfaPendingToken ? (
              <form onSubmit={handleVerifyMfaSubmit} className="space-y-4 sm:space-y-6">
                <div
                  className={`flex flex-col items-center justify-center p-4 border rounded-2xl text-center space-y-2 ${isForceLogoutFlow
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                >
                  <ShieldCheck
                    className={`w-8 h-8 ${isForceLogoutFlow ? 'text-amber-400' : 'text-emerald-400'}`}
                  />
                  <h3 className="text-sm font-bold text-white">
                    {isForceLogoutFlow
                      ? 'Autorización 2FA de Desconexión'
                      : 'Verificación de Segundo Factor'}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${isForceLogoutFlow ? 'text-amber-100/80' : 'text-emerald-100/70'
                      }`}
                  >
                    {isForceLogoutFlow
                      ? 'Para desconectar la sesión previa de forma segura e ingresar aquí, introduce tu código de seguridad (TOTP o código de respaldo).'
                      : 'Ingrese el código de 6 dígitos generado por su app autenticadora o uno de sus códigos de respaldo.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-emerald-50/90 ml-1">Código de Seguridad (TOTP / Respaldo)</label>
                  <div className="relative group/input">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-emerald-100/40 group-focus-within/input:text-emerald-400 transition-all" />
                    <Input
                      type="text"
                      autoFocus
                      required
                      maxLength={9}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="123456"
                      className="pl-12 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-emerald-400 placeholder:text-white/20 font-mono tracking-widest text-center text-lg focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/40 h-12 sm:h-14 rounded-2xl transition-all"
                      disabled={verifyMfaMutation.isPending}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={verifyMfaMutation.isPending || !mfaCode.trim()}
                  className={`w-full h-12 sm:h-14 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl active:scale-[0.97] text-sm sm:text-base cursor-pointer ${isForceLogoutFlow
                    ? 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/40'
                    : 'bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40'
                    }`}
                >
                  {verifyMfaMutation.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</>
                  ) : isForceLogoutFlow ? (
                    'Confirmar y Desconectar Sesión Previa'
                  ) : (
                    'Verificar y Acceder'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaPendingToken(null);
                    setMfaCode('');
                    setIsForceLogoutFlow(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 text-xs text-emerald-200/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al inicio de sesión</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-6">
                {lockoutSeconds !== null && lockoutSeconds > 0 && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-center space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                      <Lock className="w-4 h-4 animate-bounce" />
                      <span>Acceso Temporalmente Bloqueado</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      {lockoutMessage}
                    </p>
                    <div className="text-xl font-black text-amber-400 font-mono tracking-widest my-1">
                      {formatCountdown(lockoutSeconds)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] text-amber-300 underline font-semibold cursor-pointer hover:text-amber-100 transition-colors"
                    >
                      ¿Olvidaste tu contraseña? Restablecer para desbloquear
                    </button>
                  </div>
                )}

                <div className="space-y-1 sm:space-y-1.5">
                  <label className="text-xs font-semibold text-emerald-50/90 ml-1">Correo Electrónico</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/40 group-focus-within/input:text-emerald-400 transition-all" />
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="pl-11 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/40 h-10.5 sm:h-11.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all"
                      disabled={isLoggingIn || (lockoutSeconds !== null && lockoutSeconds > 0)}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 font-medium ml-2">{errors.email.message}</p>}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-semibold text-emerald-50/90 ml-1">Estado / Instancia</label>
                  <Controller
                    name="instanceId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative group/input">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/40 z-10 pointer-events-none transition-colors group-focus-within/input:text-emerald-400" />
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoggingIn || !emailIsValid || instancesLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                        >
                          <SelectTrigger className="w-full pl-11 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white h-10.5 sm:h-11.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all focus:ring-emerald-500/30 hover:bg-white/10 shadow-none outline-none ring-0 focus:border-emerald-500/50">
                            <SelectValue
                              placeholder={
                                !emailIsValid
                                  ? 'Ingrese su correo primero...'
                                  : instancesLoading
                                    ? 'Cargando sedes...'
                                    : instances.length === 0
                                      ? 'Sin sedes asignadas'
                                      : 'Seleccione su estado...'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white/10 backdrop-blur-2xl border-white/20 text-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 border-t-white/30 border-l-white/30 min-w-50 max-h-75">
                            <div className="p-2">
                              {instances.map((inst) => (
                                <SelectItem
                                  key={inst.id}
                                  value={inst.id.toString()}
                                  className="hover:bg-white/20 focus:bg-white/20 cursor-pointer py-2 px-3 rounded-xl transition-all outline-none border-none ring-0 focus:ring-0 mb-1 last:mb-0 group/item text-xs sm:text-sm"
                                >
                                  <span className="font-semibold text-white/90 group-hover/item:text-white transition-colors">{inst.nombre_mostrable}</span>
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  {errors.instanceId && <p className="text-xs text-red-400 font-medium ml-2">{errors.instanceId.message}</p>}
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-semibold text-emerald-50/90">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] sm:text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer transition-colors focus:outline-none"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-100/40 group-focus-within/input:text-emerald-400 transition-all" />
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-11 pr-11 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/40 h-10.5 sm:h-11.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all"
                      disabled={isLoggingIn || (lockoutSeconds !== null && lockoutSeconds > 0)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 font-medium ml-2">{errors.password.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn || instancesLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                  className="w-full h-10.5 sm:h-11.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-900/40 active:scale-[0.97] mt-1 text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>
                  ) : lockoutSeconds !== null && lockoutSeconds > 0 ? (
                    `Bloqueado (${formatCountdown(lockoutSeconds)})`
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="py-2.5 px-4 sm:py-3 sm:px-6 bg-white/5 dark:bg-black/20 border-t border-white/5 text-center">
            <p className="text-[11px] text-emerald-100/30 font-medium">
              © {new Date().getFullYear()} SICIC-INSAI - Sistema de Información para el Control de Inspecciones de Campo
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
        defaultInstanceId={instanceId}
      />

      <ForceLoginModal
        isOpen={isForceModalOpen}
        onClose={() => setIsForceModalOpen(false)}
        email={watch('email')}
        instanceId={watch('instanceId')}
        onSuccess={handleForceLoginSuccess}
      />

      <div className="absolute top-[-10%] right-[-10%] w-60 sm:w-96 h-60 sm:h-96 bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
    </div>
  );
}
