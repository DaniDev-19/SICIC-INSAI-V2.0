import { MoveLeft, Ghost } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function Error() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-card/50 glass-effect border border-border/50 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-primary to-emerald-500" />

                <div className="size-24 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 ring-4 ring-rose-500/5">
                    <Ghost size={48} className='text-rose-500 animate-pulse' />
                </div>

                <h1 className="text-6xl font-black text-foreground mb-2 tracking-tighter">404</h1>
                <h2 className="text-xl font-bold text-muted-foreground mb-4 uppercase tracking-widest">Página no encontrada</h2>

                <p className="text-sm text-muted-foreground mb-8">
                    Al parecer intentas acceder a una ruta del sistema que no existe, fue movida o no se encuentra disponible.
                </p>

                <Button
                    onClick={() => navigate('/home')}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                >
                    <MoveLeft className="mr-2" />
                    Volver al Panel Principal
                </Button>
            </div>
        </div>
    );
}

export default Error;