import { useState } from 'react';
import { ServerOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface Error500Props {
    title?: string;
    message?: string;
}

export function Error500({
    title = "Servidor No Disponible",
    message = "No hemos podido establecer conexión con el servidor backend de SICIC-INSAI o ha ocurrido un error interno imprevisto. Por favor intenta reinterconectar."
}: Error500Props) {
    const navigate = useNavigate();
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            // Intentar una verificación rápida de estado del servidor
            await apiClient.get('/auth/me');
            toast.success("¡Conexión restablecida con éxito!");
            window.location.href = '/home';
        } catch (error) {
            console.error(error);
            toast.error("El servidor aún no responde. Intenta nuevamente en un momento.");
        } finally {
            setIsRetrying(false);
        }
    };

    const handleGoHome = () => {
        navigate('/home');
    };

    return (
        <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-md w-full bg-card/50 glass-effect border border-rose-500/20 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-rose-500 via-orange-500 to-rose-500 animate-pulse" />

                {/* Icon container */}
                <div className="size-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 ring-4 ring-rose-500/10 shadow-lg shadow-rose-500/5">
                    <ServerOff size={48} className="text-rose-500 animate-pulse" />
                </div>

                {/* Status code & title */}
                <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black rounded-full uppercase tracking-widest mb-3">
                    Código 500 / Service Unavailable
                </span>
                <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">{title}</h1>

                {/* Message */}
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="w-full space-y-3">
                    <Button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} className={isRetrying ? "animate-spin" : ""} />
                        {isRetrying ? "Verificando conexión..." : "Reintentar Conexión"}
                    </Button>

                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        className="w-full border-border/80 hover:bg-accent rounded-xl h-11 font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={16} />
                        Volver a la Pantalla Principal
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Error500;
