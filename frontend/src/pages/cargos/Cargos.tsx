import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
function Cargos() {
    const Navigate = useNavigate();
    return (
        <div>
            <section className="justify-center text-center font-bold text-5xl">

                <h1>Te saludo desde cargo</h1>
                <div >
                    <Button size='lg' variant='destructive' onClick={() => Navigate('/home')}>
                        <ChevronLeft /> Volver Al Home
                    </Button>
                </div>
            </section>
        </div>
    );
}

export default Cargos;