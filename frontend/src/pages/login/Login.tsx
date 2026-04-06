import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, Loader2, Eye, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import image from '@/components/image';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
    email: z.string().email('Introduce un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    instanceId: z.string().min(1, 'Debes seleccionar una instancia/estado'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoggingIn, isAuthenticated, instances, isLoading: isAuthLoading } = useAuth();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            instanceId: '',
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        if (isAuthenticated) {
            toast.info('Ya tienes una sesión activa. Redirigiendo...');
            window.location.href = '/home';
            return;
        }

        try {
            await login(data);
            toast.success('¡Bienvenido al sistema SICIC-INSAI!');
            window.location.href = '/home';
        } catch (error: any) {
            if (!error.response && error.request) {
                toast.error('Error de Conexión', {
                    description: 'No se pudo contactar con el servidor. Verifique su internet.',
                    duration: 5000,
                });
                return;
            }

            if (error.response?.status === 429) {
                toast.warning('Acceso Restringido', {
                    description: error.response.data.message || 'Demasiados intentos. Intente más tarde.',
                });
                return;
            }

            const message = error.response?.data?.message || 'Credenciales inválidas';
            toast.error('Fallo de Autenticación', {
                description: message,
            });
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden transition-colors duration-500"
            style={{ backgroundImage: `url(${image.fondo})` }}
        >
            <div className="absolute inset-0 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-[1px] transition-colors duration-500" />

            <div className="relative z-10 w-full max-w-[95%] sm:max-w-md p-2 sm:p-0">
                <div className="backdrop-blur-2xl bg-white/10 dark:bg-emerald-950/20 border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 group hover:shadow-emerald-500/20">

                    <div className="p-6 sm:p-10">
                        <div className="flex flex-col items-center mb-6 sm:mb-10">
                            <div className="p-3 mb-4 animate-in fade-in zoom-in duration-1000">
                                <img
                                    src={image.icon}
                                    alt="SICIC Logo"
                                    className="w-30 h-30 sm:w-30 sm:h-30 object-contain drop-shadow-xl"
                                />
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight text-center">SICIC-INSAI</h1>
                            <p className="text-emerald-50/60 dark:text-emerald-50/40 mt-1 sm:mt-2 text-xs sm:text-sm font-medium tracking-wide">Vigilancia y Control</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-emerald-50/90 ml-1">Estado / Instancia</label>
                                <Controller
                                    name="instanceId"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="relative group/input">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-emerald-100/40 z-10 pointer-events-none" />
                                            <Select 
                                                onValueChange={field.onChange} 
                                                defaultValue={field.value}
                                                disabled={isLoggingIn || isAuthLoading}
                                            >
                                                <SelectTrigger className="w-full pl-12 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white h-12 sm:h-14 rounded-2xl transition-all focus:ring-emerald-500/30">
                                                    <SelectValue placeholder="Seleccione su estado..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-emerald-900 border-emerald-700 text-white rounded-xl shadow-2xl">
                                                    {instances.map((inst: any) => (
                                                        <SelectItem 
                                                            key={inst.id} 
                                                            value={inst.id.toString()}
                                                            className="hover:bg-emerald-800 cursor-pointer focus:bg-emerald-700"
                                                        >
                                                            {inst.nombre_mostrable}
                                                        </SelectItem>
                                                    ))}
                                                    {instances.length === 0 && !isAuthLoading && (
                                                        <div className="p-2 text-xs text-white/50 italic text-center">No hay instancias activas</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                {errors.instanceId && <p className="text-[10px] sm:text-xs text-red-400 font-medium ml-2">{errors.instanceId.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-semibold text-emerald-50/90 ml-1">Correo Electrónico</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-emerald-100/40 group-focus-within/input:text-emerald-400 transition-all" />
                                    <Input
                                        {...register('email')}
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        className="pl-12 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/40 h-12 sm:h-14 rounded-2xl transition-all"
                                        disabled={isLoggingIn}
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] sm:text-xs text-red-400 font-medium ml-2">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs sm:text-sm font-semibold text-emerald-50/90">Contraseña</label>
                                    <button type="button" className="text-[10px] sm:text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer transition-colors focus:outline-none">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-emerald-100/40 group-focus-within/input:text-emerald-400 transition-all" />
                                    <Input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-12 pr-12 bg-white/5 dark:bg-black/20 border-white/10 dark:border-white/5 text-white placeholder:text-white/20 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/40 h-12 sm:h-14 rounded-2xl transition-all"
                                        disabled={isLoggingIn}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] sm:text-xs text-red-400 font-medium ml-2">{errors.password.message}</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoggingIn || isAuthLoading}
                                className="w-full h-12 sm:h-14 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-900/40 active:scale-[0.97] mt-2 text-sm sm:text-base cursor-pointer"
                            >
                                {isLoggingIn ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Iniciando...</>
                                ) : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </div>

                    <div className="p-4 sm:p-6 bg-white/5 dark:bg-black/20 border-t border-white/5 text-center">
                        <p className="text-[10px] sm:text-xs text-emerald-100/30 font-medium">
                            © {new Date().getFullYear()} INSAI - Sistema Integral de Control
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute top-[-10%] right-[-10%] w-60 sm:w-96 h-60 sm:h-96 bg-emerald-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-48 sm:w-80 h-48 sm:h-80 bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
        </div>
    );
}