import { MoveLeft, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button';

function Error() {
    return (
        <main>
            <div>
                <ServerCrash size={50} className='bg-amber-400' />
                <div>
                    <h1>UPPS!!! Error 404</h1>
                    <hr />
                    <p>Al parecer intentas acceder a un apartado que no puede ser encontrada o es inexistente</p>
                </div>
            </div>
            <div>
                <Button> <MoveLeft /> Volver</Button>
            </div>
        </main>
    );
}

export default Error;