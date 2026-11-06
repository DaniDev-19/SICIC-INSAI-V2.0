import { MoveLeft, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function Error() {
    const navigate = useNavigate();

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-md w-full bg-card/60 glass-effect border border-border/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden my-auto min-w-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-primary to-emerald-500" />

                <div className="size-16 sm:size-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 sm:mb-6 ring-4 ring-rose-500/5 shrink-0">
                    <Ghost className="size-8 sm:size-12 text-rose-500 animate-pulse" />
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-foreground mb-1.5 sm:mb-2 tracking-tighter">404</h1>
                <h2 className="text-base sm:text-xl font-bold text-muted-foreground mb-3 sm:mb-4 uppercase tracking-widest">Página no encontrada</h2>

                <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 leading-relaxed break-words">
                    Al parecer intentas acceder a una ruta del sistema que no existe, fue movida o no se encuentra disponible.
                </p>

                <Button
                    onClick={handleGoBack}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 sm:h-12 font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 text-xs sm:text-sm"
                >
                    <MoveLeft className="mr-2 size-4" />
                    Volver a la página anterior
                </Button>
            </div>
        </div>
    );
}

export default Error;