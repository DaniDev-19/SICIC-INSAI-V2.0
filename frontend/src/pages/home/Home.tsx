import Card from "@/components/ui/Card";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {

    const Navigate = useNavigate();

    return (
        <div>
            <div className=" w-5xl h-auto flex py-10 px-10 gap-5 flex-wrap">

                <Card
                    title="pulsame si quieres navegar"
                    description="mi primera carta"
                    className="cursor-pointer transition-all"
                    onClick={() => Navigate('/cargos')}
                    icon={Settings}
                    iconClassName="text-orange-700 w-15 h-15"
                />
                <Card
                    title="pulsame si quieres navegar"
                    description="mi primera carta"
                    className={'cursor-pointer transition-all'}
                    onClick={() => Navigate('/')}
                />
                <Card
                    title="pulsame si quieres navegar"
                    description="mi primera carta"
                    className="cursor-pointer transition-all"
                    onClick={() => Navigate('/')}
                />
                <Card
                    title="pulsame si quieres navegar"
                    description="mi primera carta"
                    className="cursor-pointer  transition-all"
                    onClick={() => Navigate('/')}
                />
            </div>
        </div>
    );
}

export default Home;