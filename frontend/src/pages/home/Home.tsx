import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import {
    Settings,
    Users,
    BarChart3,
    Package,
    ClipboardList,
    LayoutDashboard,
    Activity,
    CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardData {
    value: string | number;
    trend: {
        value: string;
        label: string;
        positive?: boolean;
        neutral?: boolean;
    };
}

const chartData = [
    { name: 'Lun', registros: 400, auditorias: 240 },
    { name: 'Mar', registros: 300, auditorias: 139 },
    { name: 'Mie', registros: 900, auditorias: 480 },
    { name: 'Jue', registros: 278, auditorias: 390 },
    { name: 'Vie', registros: 189, auditorias: 480 },
    { name: 'Sab', registros: 539, auditorias: 380 },
    { name: 'Dom', registros: 349, auditorias: 430 },
];

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Record<string, DashboardData>>({});

    useEffect(() => {
        // Simulating API fetch
        const timer = setTimeout(() => {
            setData({
                dashboard: { value: 24, trend: { value: "+12%", label: "vs mes anterior", positive: true } },
                cargos: { value: 12, trend: { value: "Estable", label: "sin cambios", neutral: true } },
                inventario: { value: 145, trend: { value: "+5", label: "nuevos hoy", positive: true } },
                reportes: { value: "85%", trend: { value: "-2%", label: "vs ayer", positive: false } },
                auditoria: { value: 3, trend: { value: "Alerta", label: "críticos", positive: false } },
                configuracion: { value: "OK", trend: { value: "100%", label: "uptime", positive: true } }
            });
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const dashboardCards = [
        {
            id: "dashboard",
            title: "Dashboard",
            description: "Vista general del sistema",
            icon: LayoutDashboard,
            color: "text-blue-600",
            path: "/"
        },
        {
            id: "cargos",
            title: "Cargos",
            description: "Gestión de roles y cargos",
            icon: Users,
            color: "text-green-600",
            path: "/cargos"
        },
        {
            id: "inventario",
            title: "Inventario",
            description: "Control de productos y stock",
            icon: Package,
            color: "text-orange-600",
            path: "/"
        },
        {
            id: "reportes",
            title: "Reportes",
            description: "Análisis y estadísticas detalladas",
            icon: BarChart3,
            color: "text-purple-600",
            path: "/"
        },
        {
            id: "auditoria",
            title: "Auditoría",
            description: "Registro de actividades y logs",
            icon: ClipboardList,
            color: "text-red-600",
            path: "/"
        },
        {
            id: "configuracion",
            title: "Configuración",
            description: "Ajustes globales del sistema",
            icon: Settings,
            color: "text-slate-600",
            path: "/"
        }
    ];

    return (
        <div className="p-6 lg:p-10 space-y-4">
            <div>
                <div className="mb-5">
                    <p className="text-muted-foreground font-medium">Gestiona tu sistema de forma eficiente y profesional.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-4">
                    {dashboardCards.map((card) => (
                        <Card
                            key={card.id}
                            title={card.title}
                            description={card.description}
                            icon={card.icon}
                            iconClassName={card.color}
                            value={data[card.id]?.value}
                            trend={data[card.id]?.trend}
                            loading={loading}
                            onClick={() => navigate(card.path)}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="size-5 text-primary" />
                            <h3 className="text-lg font-bold">Actividad del Sistema</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRegistros" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="registros"
                                    stroke="var(--color-primary, #3b82f6)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRegistros)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[200px]">
                        <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="size-8 text-green-500" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold">Estado del Servidor</h4>
                            <p className="text-sm text-muted-foreground">Todos los sistemas operativos</p>
                        </div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold uppercase tracking-wider">
                            En Linea
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;