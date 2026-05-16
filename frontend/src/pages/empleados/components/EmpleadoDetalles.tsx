import { useQuery } from '@tanstack/react-query';
import { empleadosService } from '@/services/empleados.service';
import { Loader2, User, FileText, Activity, MapPin, Briefcase, Mail, Phone, Calendar, BadgeCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmpleadoDetallesProps {
  empleadoId: number;
  empleadoNombre: string;
}

export function EmpleadoDetalles({ empleadoId, empleadoNombre }: EmpleadoDetallesProps) {
  const { data: fullEmpleadoResp, isLoading } = useQuery({
    queryKey: ['empleado-detail', empleadoId],
    queryFn: () => empleadosService.getById(empleadoId),
    enabled: !!empleadoId,
  });

  const empleado = fullEmpleadoResp?.data;

  const handleGenerarPDF = () => {
    toast.success('Generando ficha PDF del empleado...');
    // Lógica futura para exportar a PDF
  };

  const handleVerHistorial = () => {
    toast.info('Mostrando historial de actividades (Próximamente)');
    // Lógica futura para ver historial en bitácora
  };

  if (isLoading || !empleado) {
    return (
      <div className="flex justify-center items-center p-12 bg-card rounded-2xl border border-border shadow-xl glass-effect mt-6">
        <Loader2 className="size-8 text-primary animate-spin" />
      </div>
    );
  }

  const fotoUrl = empleado.empleado_foto?.[0]?.foto_url;
  const residencia = empleado.empleado_residencia?.[0];
  const programas = empleado.empleados_programas?.map((ep: any) => ep.programas) || [];

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xl glass-effect p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500 mt-6">
      {/* Header y Botones de Reporte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {fotoUrl ? (
              <img src={fotoUrl} alt={empleadoNombre} className="size-16 rounded-xl object-cover border-2 border-primary/20 shadow-sm" />
            ) : (
              <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="size-8 text-primary" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-background ${empleado.status_laboral === 'ACTIVO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Expediente del Empleado</h2>
            <p className="text-sm text-muted-foreground font-medium">Información detallada de: <strong className="text-primary">{empleado.nombre} {empleado.apellido}</strong></p>
            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase mt-1">C.I: {empleado.cedula}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleVerHistorial} variant="outline" className="rounded-xl font-bold bg-muted/50 border-border hover:bg-muted hover:text-foreground cursor-pointer">
            <Activity className="size-4 mr-2" />
            Historial
          </Button>
          <Button onClick={handleGenerarPDF} className="rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <FileText className="size-4 mr-2" />
            Ficha PDF
          </Button>
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Info Laboral */}
        <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-2">
            <Briefcase className="size-5 text-blue-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/80">Laboral</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Cargo / Profesión</p>
              <p className="text-sm font-bold text-foreground">{empleado.cargos?.nombre || 'N/A'} • {empleado.profesiones?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Departamento</p>
              <p className="text-sm font-medium">{empleado.departamentos?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Oficina / Sede</p>
              <p className="text-sm font-medium">{empleado.oficinas?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Tipo Contrato</p>
              <p className="text-sm font-medium">{empleado.contrato?.nombre || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Info Personal & Contacto */}
        <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-2">
            <BadgeCheck className="size-5 text-emerald-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/80">Contacto & Personal</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Teléfono</p>
              <div className="flex items-center gap-2">
                <Phone className="size-3 text-muted-foreground" />
                <p className="text-sm font-medium">{empleado.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="size-3 text-muted-foreground" />
                <p className="text-sm font-medium">{empleado.email || 'No registrado'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Fecha Ingreso</p>
              <div className="flex items-center gap-2">
                <Calendar className="size-3 text-muted-foreground" />
                <p className="text-sm font-medium">{empleado.fechas_ingreso ? new Date(empleado.fechas_ingreso).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Estatus</p>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-block ${empleado.status_laboral === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {empleado.status_laboral}
              </span>
            </div>
          </div>
        </div>

        {/* Residencia */}
        <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 mb-2 border-b border-border/50 pb-2">
            <MapPin className="size-5 text-rose-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/80">Residencia</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Sector</p>
              <p className="text-sm font-medium text-foreground">{residencia?.sectores?.nombre || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Dirección Detallada</p>
              <p className="text-sm font-medium">{residencia?.direccion_detallada || 'No registrada'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Punto de Referencia</p>
              <p className="text-sm font-medium">{residencia?.punto_referencia || 'No registrado'}</p>
            </div>
            {residencia?.google_maps_url && (
              <div>
                <a href={residencia.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-1">
                  <MapPin className="size-3" /> Ver en Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Programas */}
      {programas.length > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="size-5 text-amber-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground/80">Programas Asignados</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {programas.map((prog: any) => (
              <span key={prog.id} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
                <BadgeCheck className="size-3" /> {prog.nombre}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
