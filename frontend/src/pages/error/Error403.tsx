import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface Error403Props {
    title?: string;
    message?: string;
}

export function Error403({
    title = "Acceso Denegado",
    message = "No tienes los permisos necesarios asignados a tu rol para acceder a esta sección del sistema. Esta acción ha sido registrada por motivos de seguridad."
}: Error403Props) {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleGoHome = () => {
        navigate('/home');
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-md w-full bg-card/60 glass-effect border border-amber-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden my-auto min-w-0">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

                {/* Icon container */}
                <div className="size-16 sm:size-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 sm:mb-6 ring-4 ring-amber-500/10 shadow-lg shadow-amber-500/5 shrink-0">
                    <ShieldAlert className="size-8 sm:size-12 text-amber-500 animate-bounce" />
                </div>

                {/* Status code & title */}
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest mb-2 sm:mb-3">
                    Código 403 Forbidden
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-foreground mb-2 tracking-tight break-words">{title}</h1>

                {/* Message */}
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 leading-relaxed break-words">
                    {message}
                </p>

                {/* Actions */}
                <div className="w-full space-y-2.5 sm:space-y-3">
                    <Button
                        onClick={handleGoHome}
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 sm:h-12 font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                        <Home size={16} />
                        Volver a la Página Principal
                    </Button>

                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-border/80 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 rounded-xl h-10 sm:h-11 font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                        <LogOut size={15} />
                        Cerrar Sesión de Cuenta
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Error403;
