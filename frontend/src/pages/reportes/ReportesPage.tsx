import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  FileText,
  ShieldCheck,
  Activity,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  Warehouse,
  Loader2,
  FolderGit2,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { clientesService } from '@/services/clientes.service';
import { propiedadesService } from '@/services/propiedades.service';
import { empleadosService } from '@/services/empleados.service';
import { inspectionsService } from '@/services/inspecciones.service';
import { solicitudesService } from '@/services/solicitudes.service';
import { avalesService } from '@/services/avales.service';
import { actaSilosService } from '@/services/acta-silos.service';
import {
  openCaracStatalPdf,
  openRankingClientesPdf,
  openInspeccionesEmpleadoPdf,
  openAvalesSanitariosPdf,
  openInspeccionesSilosPdf,
  openEmpleadosProgramasPdf,
} from '@/reports/ejecutivos/generateEjecutivoNuevosPdf';

export default function ReportesPage() {
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('todos');

  // Fetch Real Data from APIs
  const { data: inspeccionesResp, isLoading: loadingInsp } = useQuery({
    queryKey: ['reportes-real-inspecciones'],
    queryFn: () => inspectionsService.getAll({ limit: 100 }),
  });

  const { data: solicitudesResp, isLoading: loadingSol } = useQuery({
    queryKey: ['reportes-real-solicitudes'],
    queryFn: () => solicitudesService.getAll({ limit: 100 }),
  });

  const { data: clientesResp, isLoading: loadingCli } = useQuery({
    queryKey: ['reportes-real-clientes'],
    queryFn: () => clientesService.getAll({ limit: 100 }),
  });

  const { data: propiedadesResp, isLoading: loadingProp } = useQuery({
    queryKey: ['reportes-real-propiedades'],
    queryFn: () => propiedadesService.getAll({ limit: 100 }),
  });

  const { data: empleadosResp, isLoading: loadingEmp } = useQuery({
    queryKey: ['reportes-real-empleados'],
    queryFn: () => empleadosService.getAll({ limit: 100 }),
  });

  const { data: caracStatalResp, isLoading: loadingCarac } = useQuery({
    queryKey: ['reportes-real-carac-statal'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/carac_statal');
        return res.data;
      } catch (err) {
        return { data: [] };
      }
    },
  });

  const { data: avalesResp, isLoading: loadingAvales } = useQuery({
    queryKey: ['reportes-real-avales'],
    queryFn: () => avalesService.getAll({ limit: 100 }),
  });

  const { data: silosResp, isLoading: loadingSilos } = useQuery({
    queryKey: ['reportes-real-silos'],
    queryFn: () => actaSilosService.getAll({ limit: 100 }),
  });

  const isLoadingGlobal = loadingInsp || loadingSol || loadingCli || loadingProp || loadingEmp || loadingCarac || loadingAvales || loadingSilos;

  // Real KPI Aggregations
  const totalInspecciones = inspeccionesResp?.pagination?.totalCount || inspeccionesResp?.data?.length || 0;
  const totalSolicitudes = solicitudesResp?.pagination?.totalCount || solicitudesResp?.data?.length || 0;
  const totalClientes = clientesResp?.pagination?.totalCount || clientesResp?.data?.length || 0;
  const totalPropiedades = propiedadesResp?.pagination?.totalCount || propiedadesResp?.data?.length || 0;

  // Empleados y Programas asignados
  const empleadosList = empleadosResp?.data || [];
  const empleadosConPrograma = empleadosList.map((e: any) => ({
    id: e.id,
    nombre: e.nombre,
    apellido: e.apellido,
    cedula: e.cedula,
    cargo_nombre: e.cargos?.nombre || e.cargo || 'Funcionario',
    oficina_nombre: e.oficinas?.nombre || 'Sede Regional',
    programas: (e.empleados_programas || []).map((ep: any) => ep.programas?.nombre).filter(Boolean),
  })).filter((e: any) => e.programas.length > 0);

  // Chart Data
  const solicitudesList = solicitudesResp?.data || [];
  const solicitudesChartData = [
    { name: 'Planificadas', total: solicitudesList.filter((s: any) => s.estatus === 'PLANIFICADA').length },
    { name: 'Inspeccionando', total: solicitudesList.filter((s: any) => s.estatus === 'INSPECCIONANDO').length },
    { name: 'No Atendidas', total: solicitudesList.filter((s: any) => s.estatus === 'NO ATENDIDA' || !s.estatus).length },
  ];

  const inspeccionesList = inspeccionesResp?.data || [];
  const inspeccionesChartData = [
    { name: 'Pendientes', total: inspeccionesList.filter((i: any) => i.status === 'PENDIENTE').length, color: '#f59e0b' },
    { name: 'Completadas', total: inspeccionesList.filter((i: any) => i.status === 'COMPLETADA' || i.status === 'FINALIZADA').length, color: '#10b981' },
    { name: 'En Proceso', total: inspeccionesList.filter((i: any) => i.status === 'EN_PROCESO').length, color: '#3b82f6' },
  ];

  // PDF Generators Handlers
  const handleCaracStatalPdf = async () => {
    const toastId = toast.loading('Generando Reporte de Caracterización Estatal...');
    try {
      const records = caracStatalResp?.data || [];
      await openCaracStatalPdf(records);
      toast.success('Reporte de Caracterización Estatal listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar la Caracterización Estatal', { id: toastId });
    }
  };

  const handleRankingClientesPdf = async () => {
    const toastId = toast.loading('Generando Ranking de Productores...');
    try {
      const clientes = clientesResp?.data || [];
      const ranking = clientes
        .map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          cedula_rif: c.cedula_rif,
          totalSolicitudes: c.solicitudes?.length || (solicitudesList.filter((s: any) => s.solicitante_id === c.id).length),
          totalPredios: c.propiedades?.length || 0,
        }))
        .sort((a: any, b: any) => b.totalSolicitudes - a.totalSolicitudes);

      await openRankingClientesPdf(ranking);
      toast.success('Ranking de Productores listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el Ranking de Productores', { id: toastId });
    }
  };

  const handleInspeccionesEmpleadoPdf = async () => {
    const toastId = toast.loading('Generando Informe de Inspecciones por Inspector...');
    try {
      let filteredInsp = inspeccionesList;
      let inspectorInfo: { nombre: string; apellido: string; cedula: string } | null = null;

      if (selectedInspectorId !== 'todos') {
        const empId = Number(selectedInspectorId);
        const empObj = (empleadosResp?.data || []).find((e: any) => e.id === empId);
        if (empObj) {
          inspectorInfo = {
            nombre: empObj.nombre,
            apellido: empObj.apellido,
            cedula: empObj.cedula,
          };
        }
        filteredInsp = inspeccionesList.filter((i: any) => {
          const empIds = (i.planificaciones?.planificacion_empleados || []).map((pe: any) => pe.empleado_id);
          return empIds.includes(empId) || i.empleado_id === empId || i.inspector_id === empId;
        });
      }

      const mapped = filteredInsp.map((i: any) => {
        const propiedadNombre = i.planificaciones?.solicitudes?.propiedades?.nombre || 'Propiedad / Predio no especificado';
        const clienteNombre = i.planificaciones?.solicitudes?.clientes?.nombre || i.atendido_por_nombre || 'N/A';
        const inspectoresArr = (i.planificaciones?.planificacion_empleados || [])
          .map((pe: any) => pe.empleados ? `${pe.empleados.nombre} ${pe.empleados.apellido}` : null)
          .filter(Boolean);

        return {
          id: i.id,
          n_control: i.n_control,
          propiedad_nombre: propiedadNombre,
          productor_nombre: clienteNombre,
          inspector_nombres: inspectoresArr.length > 0 ? inspectoresArr.join(', ') : 'Inspector Asignado',
          fecha_inspeccion: i.fecha_inspeccion,
          status: i.status || 'COMPLETADA',
        };
      });

      await openInspeccionesEmpleadoPdf(mapped, inspectorInfo);
      toast.success('Informe de Inspecciones por Inspector listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el Informe de Inspecciones por Inspector', { id: toastId });
    }
  };

  const handleAvalesSanitariosPdf = async () => {
    const toastId = toast.loading('Generando Consolidado de Avales Sanitarios...');
    try {
      const avales = avalesResp?.data || [];
      await openAvalesSanitariosPdf(avales);
      toast.success('Consolidado de Avales Sanitarios listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el Consolidado de Avales Sanitarios', { id: toastId });
    }
  };

  const handleInspeccionesSilosPdf = async () => {
    const toastId = toast.loading('Generando Informe de Inspecciones de Silos...');
    try {
      const silos = silosResp?.data || [];
      await openInspeccionesSilosPdf(silos);
      toast.success('Informe de Inspecciones de Silos listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el Informe de Silos', { id: toastId });
    }
  };

  const handleEmpleadosProgramasPdf = async () => {
    const toastId = toast.loading('Generando Informe de Empleados y Jefes de Programas...');
    try {
      const list = (empleadosResp?.data || []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        cedula: e.cedula,
        cargo_nombre: e.cargos?.nombre || e.cargo || 'Funcionario',
        oficina_nombre: e.oficinas?.nombre || 'Sede Regional',
        programasNombres: (e.empleados_programas || []).map((ep: any) => ep.programas?.nombre).filter(Boolean),
      })).filter((e: any) => e.programasNombres.length > 0 || e.cargo_nombre.toLowerCase().includes('jefe') || e.cargo_nombre.toLowerCase().includes('coordinador'));

      await openEmpleadosProgramasPdf(list.length > 0 ? list : (empleadosResp?.data || []).map((e: any) => ({
        id: e.id,
        nombre: e.nombre,
        apellido: e.apellido,
        cedula: e.cedula,
        cargo_nombre: e.cargos?.nombre || e.cargo || 'Funcionario',
        oficina_nombre: e.oficinas?.nombre || 'Sede Regional',
        programasNombres: (e.empleados_programas || []).map((ep: any) => ep.programas?.nombre).filter(Boolean),
      })));
      toast.success('Informe de Jefes y Asignaciones a Programas listo', { id: toastId });
    } catch (error) {
      toast.error('Error al generar el Informe de Programas', { id: toastId });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner Limpio & Elegante */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/60 p-6 sm:p-8 text-foreground shadow-sm glass-effect">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
              <BarChart3 className="size-3.5 text-emerald-500" /> Inteligencia & Análisis en Tiempo Real
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Centro de Reportes e Inteligencia Operativa
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Consolidado oficial de inspecciones de campo, programas asignados a empleados, caracterización estatal y avales sanitarios del INSAI.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-muted/30 border border-border/60 text-center">
              <p className="text-lg font-black text-emerald-600">Datos Auditados</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Sistema Oficial INSAI</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm glass-effect flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Inspecciones</p>
            <h4 className="text-2xl font-black text-foreground">
              {isLoadingGlobal ? <Loader2 className="size-5 animate-spin text-primary" /> : `${totalInspecciones} Registros`}
            </h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Operativos en base de datos</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm glass-effect flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Productores Registrados</p>
            <h4 className="text-2xl font-black text-foreground">
              {isLoadingGlobal ? <Loader2 className="size-5 animate-spin text-primary" /> : `${totalClientes} Clientes`}
            </h4>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">RUNSAI / Clientes activos</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm glass-effect flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
            <UserCheck className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Empleados con Programas</p>
            <h4 className="text-2xl font-black text-foreground">
              {isLoadingGlobal ? <Loader2 className="size-5 animate-spin text-primary" /> : `${empleadosConPrograma.length} Asignados`}
            </h4>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Con programas sanitarios activos</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm glass-effect flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solicitudes de Campo</p>
            <h4 className="text-2xl font-black text-foreground">
              {isLoadingGlobal ? <Loader2 className="size-5 animate-spin text-primary" /> : `${totalSolicitudes} Solicitudes`}
            </h4>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">En proceso de atención</p>
          </div>
        </div>
      </div>

      {/* DETALLE DIRECTO EN PANTALLA: EMPLEADOS Y SUS PROGRAMAS ASIGNADOS */}
      {/* <div className="p-6 rounded-3xl border border-border/60 bg-card shadow-sm glass-effect space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <FolderGit2 className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                Empleados con Programas Sanitorios Asignados ({empleadosConPrograma.length})
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Desglose en tiempo real de funcionarios técnicos y programas asignados a su cargo.
              </p>
            </div>
          </div>

          <Button
            onClick={handleEmpleadosProgramasPdf}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm gap-2 h-10 px-4 shrink-0 cursor-pointer"
          >
            <FileText className="size-4" /> Exportar Informe Completo PDF
          </Button>
        </div>

        {isLoadingGlobal ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : empleadosConPrograma.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empleadosConPrograma.map((emp: any) => (
              <div
                key={emp.id}
                className="p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-purple-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      {emp.nombre} {emp.apellido}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      C.I: {emp.cedula} • {emp.cargo_nombre}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground bg-background">
                    {emp.oficina_nombre}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-border/30">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Programas Asignados ({emp.programas.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.programas.map((progNombre: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                      >
                        {progNombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-muted/20 rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground">
              No hay empleados con programas asignados actualmente en la base de datos.
            </p>
          </div>
        )}
      </div> */}

      {/* Panels de Gráficas REALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl border border-border/60 bg-card shadow-sm glass-effect space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-emerald-600" />
              <h3 className="text-base font-black text-foreground">Distribución Real de Solicitudes de Inspección</h3>
            </div>
            <Badge variant="outline" className="text-[11px] font-bold text-muted-foreground">
              Base de Datos
            </Badge>
          </div>

          <div className="h-[260px] w-full" style={{ minWidth: 0 }}>
            {isLoadingGlobal ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-8 text-emerald-600 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={solicitudesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground) / 0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border/60 bg-card shadow-sm glass-effect flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h3 className="text-base font-black text-foreground">Inspecciones por Estatus</h3>
          </div>

          <div className="h-[200px] w-full flex items-center justify-center" style={{ minWidth: 0 }}>
            {isLoadingGlobal ? (
              <Loader2 className="size-8 text-emerald-600 animate-spin" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inspeccionesChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="total"
                  >
                    {inspeccionesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold border-t border-border/40 pt-3">
            {inspeccionesChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-muted-foreground">{item.name}: {item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFORMES EJECUTIVOS ÚTILES */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Reportes Especiales y Documentos Oficiales PDF
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Informes consolidados listos para exportación y presentación institucional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reporte 1: Caracterización Estatal */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                  <MapPin className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Recursos Estatales
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Caracterización Estatal de Recursos
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Informe de dotación de veterinarios oficiales, paraveterinarios, personal administrativo y vehículos operativos por municipio.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleCaracStatalPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Caracterización PDF
              </Button>
            </div>
          </div>

          {/* Reporte 2: Ranking de Productores */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <Award className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Productores
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Ranking de Productores Atendidos
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Clasificación de productores y clientes con mayor volumen de solicitudes de inspección y predios agropecuarios atados.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleRankingClientesPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Ranking PDF
              </Button>
            </div>
          </div>

          {/* Reporte 3: Inspecciones por Inspector */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Briefcase className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Inspectores
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Desempeño e Inspecciones por Inspector
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Historial de inspecciones de campo ejecutadas y atendidas por funcionario técnico o inspector de área.
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-muted-foreground">Filtrar por Inspector:</label>
                <select
                  value={selectedInspectorId}
                  onChange={(e) => setSelectedInspectorId(e.target.value)}
                  className="w-full h-9 rounded-xl bg-muted/30 border border-border text-xs font-medium px-3 text-foreground"
                >
                  <option value="todos">Todos los Inspectores / Funcionarios</option>
                  {(empleadosResp?.data || []).map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.apellido} ({emp.cedula})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleInspeccionesEmpleadoPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Desempeño PDF
              </Button>
            </div>
          </div>

          {/* Reporte 4: Consolidado de Avales Sanitarios */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <ShieldCheck className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Salud Animal
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Consolidado de Avales Sanitarios
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Informe de auditoría de avales sanitarios emitidos, predios validados e inventario total de ganado bovino y bufalino.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleAvalesSanitariosPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Avales PDF
              </Button>
            </div>
          </div>

          {/* Reporte 5: Inspecciones a Silos y Plantas */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
                  <Warehouse className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Agroindustria
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Inspección a Silos y Almacenamiento
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Informe de actas de inspección a silos agroindustriales, empresas registradas y verificación fitosanitaria de granos.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleInspeccionesSilosPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Silos PDF
              </Button>
            </div>
          </div>

          {/* Reporte 6: Empleados Asignados a Programas y Jefes de Programa */}
          <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between glass-effect space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Users className="size-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Programas & Jefes
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-black text-foreground">
                  Empleados y Jefes de Programas
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Auditoría de asignación de empleados técnicos y jefes responsables vinculados a los programas sanitarios del INSAI.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <Button
                onClick={handleEmpleadosProgramasPdf}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer gap-2 transition-all hover:scale-[1.02]"
              >
                <FileText className="size-4" /> Exportar Programas PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
