import { useDashboardStats } from "@/hooks/use-dashboard";
import {
    Users, ClipboardList, CheckCircle2, Clock, Activity,
    Building2, Award, TrendingUp, FileText, Loader2,
    ShieldCheck, MapPin, CalendarDays, ArrowRight, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminMetrics, InspectorMetrics } from "@/services/dashboard.service";

export default function Home() {
    const navigate = useNavigate();
    const { user, currentInstance } = useAuth();
    const { data: dashboardData, isLoading } = useDashboardStats();

    const isInspector = dashboardData?.roleType === 'inspector';
    const roleTitle = currentInstance?.rol || 'Usuario';
    const instanceName = currentInstance?.nombre || 'INSAI';

    const now = new Date();
    const dateStr = now.toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'FINALIZADA':
                return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">FINALIZADA</Badge>;
            case 'EN_PROCESO':
                return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">EN PROCESO</Badge>;
            default:
                return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">PENDIENTE</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="relative">
                    <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-emerald-500" />
                    </div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Cargando estadísticas del sistema...</p>
            </div>
        );
    }

    const metrics = dashboardData?.data?.metrics;
    const chartData = dashboardData?.data?.chartData || [];
    const recentActivity = dashboardData?.data?.recentActivity || [];
    const topInspectores = dashboardData?.data?.topInspectores || [];

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">

            {/* ── WELCOME BANNER ──────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

                {/* Content */}
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 lg:p-9">
                    <div className="flex items-start gap-5">
                        {/* Avatar */}
                        <div className="shrink-0 relative">
                            <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-xl font-black text-emerald-500">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
                        </div>

                        <div>
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                                    <MapPin className="size-3" /> {instanceName}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                                    <Zap className="size-3 text-amber-500" /> {roleTitle}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                                ¡Bienvenido,{' '}
                                <span className="text-emerald-500">
                                    {user?.username}
                                </span>
                                !
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                                {isInspector
                                    ? 'Resumen de tus inspecciones asignadas y actividad operacional en campo.'
                                    : 'Panel ejecutivo de control general e inspecciones del territorio.'}
                            </p>

                            {/* Date chip */}
                            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground font-medium">
                                <CalendarDays className="size-3.5 text-emerald-500/70" />
                                <span className="capitalize">{dateStr}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right CTA */}
                    <div className="flex items-center gap-3 lg:shrink-0">
                        <Button
                            onClick={() => navigate('/home/planificacion')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl h-11 px-5 shadow-sm cursor-pointer text-sm gap-2 transition-all hover:scale-105"
                        >
                            <ClipboardList className="size-4" />
                            Ver Planificaciones
                            <ArrowRight className="size-3.5 opacity-70" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── METRIC CARDS ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isInspector ? (
                    <>
                        <MetricCard icon={<CheckCircle2 className="size-5" />} color="emerald"
                            label="Inspecciones Realizadas"
                            value={(metrics as InspectorMetrics)?.misInspecciones || 0}
                            sub={<span className="flex items-center gap-1"><TrendingUp className="size-3" /> Registradas por ti</span>}
                        />
                        <MetricCard icon={<ClipboardList className="size-5" />} color="blue"
                            label="Planificaciones Asignadas"
                            value={(metrics as InspectorMetrics)?.misPlanificaciones || 0}
                            sub="Total en tu historial"
                        />
                        <MetricCard icon={<Clock className="size-5" />} color="amber"
                            label="Pendientes / Por Vacío"
                            value={(metrics as InspectorMetrics)?.misPendientes || 0}
                            sub="Requieren atención"
                            valueColor="text-amber-400"
                        />
                        <MetricCard icon={<Award className="size-5" />} color="teal"
                            label="Finalizadas"
                            value={(metrics as InspectorMetrics)?.misFinalizadas || 0}
                            sub="Completadas con éxito"
                        />
                    </>
                ) : (
                    <>
                        <MetricCard icon={<CheckCircle2 className="size-5" />} color="emerald"
                            label="Total Inspecciones"
                            value={(metrics as AdminMetrics)?.totalInspecciones || 0}
                            sub="En el estado activo"
                        />
                        <MetricCard icon={<ClipboardList className="size-5" />} color="blue"
                            label="Planificaciones"
                            value={(metrics as AdminMetrics)?.totalPlanificaciones || 0}
                            sub="Programadas e inspeccionadas"
                        />
                        <MetricCard icon={<Users className="size-5" />} color="purple"
                            label="Inspectores / Empleados"
                            value={(metrics as AdminMetrics)?.totalEmpleados || 0}
                            sub="Personal activo"
                        />
                        <MetricCard icon={<Building2 className="size-5" />} color="amber"
                            label="Propiedades / Predios"
                            value={(metrics as AdminMetrics)?.totalPropiedades || 0}
                            sub="Unidades productivas"
                        />
                    </>
                )}
            </div>

            {/* ── CHART + SIDEBAR ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-md shadow-xl flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Activity className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                {isInspector ? 'Tu Tendencia Semanal de Planificaciones' : 'Actividad General de Inspecciones'}
                            </h3>
                            <p className="text-xs text-muted-foreground">Registro dinámico de los últimos 7 días</p>
                        </div>
                    </div>

                    <div className="h-[260px] w-full" style={{ minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                                <Tooltip contentStyle={{
                                    backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))',
                                    borderRadius: '12px', color: 'hsl(var(--foreground))',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                                }} />
                                <Area type="monotone"
                                    dataKey={isInspector ? "misPlanificaciones" : "planificaciones"}
                                    stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrimary)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar widget */}
                <div className="flex flex-col">
                    {!isInspector && topInspectores.length > 0 ? (
                        <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-md shadow-xl flex-1 flex flex-col">
                            <div className="flex items-center gap-2.5 mb-1">
                                <Award className="size-5 text-emerald-400" />
                                <h3 className="font-bold text-sm text-foreground">Rendimiento por Empleado</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">Top inspectores con más asignaciones</p>
                            <div className="space-y-2.5 flex-1 overflow-y-auto">
                                {topInspectores.map((insp, idx) => (
                                    <div key={insp.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground">{insp.nombreCompleto}</p>
                                                <p className="text-[10px] text-muted-foreground">C.I: {insp.cedula}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                                            {insp.planificacionesAsignadas} asig.
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-md shadow-xl flex-1 flex flex-col justify-center items-center text-center space-y-4">
                            <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="size-7" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground">Sistema SICIC-INSAI</h4>
                                <p className="text-xs text-muted-foreground mt-1">Conexión cifrada y monitoreada en tiempo real.</p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                Sistema Operativo
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── RECENT ACTIVITY TABLE ───────────────────────────────── */}
            <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                {isInspector ? 'Mis Próximas Inspecciones Asignadas' : 'Últimas Planificaciones Registradas'}
                            </h3>
                            <p className="text-xs text-muted-foreground">Listado de inspecciones y evaluaciones en sistema</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/home/planificacion')}
                        className="rounded-xl text-xs cursor-pointer gap-1.5"
                    >
                        Ver Todas <ArrowRight className="size-3" />
                    </Button>
                </div>

                {recentActivity.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No hay planificaciones o inspecciones recientes registradas.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground uppercase text-[10px]">
                                    <th className="py-3 px-4 font-semibold">Predio / Propiedad</th>
                                    <th className="py-3 px-4 font-semibold">Tipo de Solicitud</th>
                                    <th className="py-3 px-4 font-semibold">Estatus</th>
                                    <th className="py-3 px-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {recentActivity.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 font-medium text-foreground">
                                            {item.propiedades?.nombre_predio || 'Sin propiedad asignada'}
                                            <span className="block text-[10px] text-muted-foreground font-normal">
                                                Cód: {item.propiedades?.codigo_propiedad || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {item.programas?.nombre || 'General'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate('/home/planificacion')}
                                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer rounded-lg text-xs gap-1"
                                            >
                                                Ver Detalles <ArrowRight className="size-3" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Metric Card component ────────────────────────────────────────────────────
type MetricCardProps = {
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'purple' | 'amber' | 'teal';
    label: string;
    value: number;
    sub: React.ReactNode;
    valueColor?: string;
};

const colorMap: Record<MetricCardProps['color'], { bg: string; text: string; hover: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', hover: 'hover:border-emerald-500/30' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    hover: 'hover:border-blue-500/30'    },
    purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  hover: 'hover:border-purple-500/30'  },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   hover: 'hover:border-amber-500/30'   },
    teal:    { bg: 'bg-teal-500/10',    text: 'text-teal-400',    hover: 'hover:border-teal-500/30'    },
};

function MetricCard({ icon, color, label, value, sub, valueColor }: MetricCardProps) {
    const c = colorMap[color];
    return (
        <div className={`p-5 rounded-2xl border bg-card/50 backdrop-blur-sm border-border shadow-sm ${c.hover} transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>{icon}</div>
            </div>
            <div className="mt-3">
                <span className={`text-3xl font-black tracking-tight ${valueColor || 'text-foreground'}`}>{value}</span>
                <p className={`text-xs ${c.text} font-medium mt-1`}>{sub}</p>
            </div>
        </div>
    );
}