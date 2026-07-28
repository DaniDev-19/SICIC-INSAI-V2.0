import { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Users,
  Megaphone,
  Clock,
  AlertTriangle,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  Building2,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { mailService, type PlantillaCorreo, type SendComunicadoResponse } from '@/services/mail.service';
import { empleadosService } from '@/services/empleados.service';
import type { Empleado } from '@/types/empleados';

const ICON_MAP: Record<string, any> = {
  Users,
  Megaphone,
  Clock,
  AlertTriangle,
  Award
};

export default function MailPage() {
  const [plantillas, setPlantillas] = useState<PlantillaCorreo[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [selectedEmpleadoIds, setSelectedEmpleadoIds] = useState<number[]>([]);
  const [selectedPlantillaId, setSelectedPlantillaId] = useState<string | null>(null);

  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [motivo, setMotivo] = useState('MANUAL');

  const [searchEmpleado, setSearchEmpleado] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [resultadoEnvio, setResultadoEnvio] = useState<SendComunicadoResponse['data'] | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [plantillasRes, empRes] = await Promise.all([
        mailService.getPlantillas(),
        empleadosService.getAll({ limit: 500 })
      ]);
      setPlantillas(plantillasRes);
      setEmpleados(empRes.data || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      toast.error('No se pudieron cargar los empleados o las plantillas.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSelectPlantilla = (plantilla: PlantillaCorreo) => {
    setSelectedPlantillaId(plantilla.id);
    setAsunto(plantilla.asunto);
    // Eliminar etiquetas HTML simples para el editor de texto libre pero mantener saltos
    const cleanBody = plantilla.cuerpo
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?strong>/gi, '')
      .replace(/<\/?em>/gi, '');
    setMensaje(cleanBody);
    setMotivo(plantilla.categoria);
    toast.info(`Plantilla "${plantilla.nombre}" cargada en el editor`);
  };

  const handleToggleEmpleado = (id: number) => {
    setSelectedEmpleadoIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllEmpleados = () => {
    if (selectedEmpleadoIds.length === empleados.length) {
      setSelectedEmpleadoIds([]);
    } else {
      setSelectedEmpleadoIds(empleados.map(e => e.id));
    }
  };

  const insertVariable = (varName: string) => {
    setMensaje(prev => `${prev} ${varName}`);
  };

  const handleSendMail = async () => {
    if (selectedEmpleadoIds.length === 0) {
      toast.error('Selecciona al menos un empleado para enviar el comunicado.');
      return;
    }
    if (!asunto.trim()) {
      toast.error('Escribe el asunto del correo.');
      return;
    }
    if (!mensaje.trim()) {
      toast.error('Escribe el contenido del mensaje.');
      return;
    }

    setIsSending(true);
    setResultadoEnvio(null);

    // Formatear párrafos del mensaje a HTML si se redactó libremente
    const formattedMensaje = mensaje
      .split('\n')
      .map(line => line.trim())
      .join('<br/>');

    try {
      const res = await mailService.sendComunicado({
        empleado_ids: selectedEmpleadoIds.length === empleados.length ? 'ALL' : selectedEmpleadoIds,
        asunto,
        mensaje: formattedMensaje,
        motivo
      });

      setResultadoEnvio(res.data);

      if (res.data.simulado) {
        toast.warning(`Envío simulado para ${res.data.enviados} empleados (SMTP_PASS no configurado).`);
      } else {
        toast.success(`¡Comunicado enviado exitosamente a ${res.data.enviados} empleados!`);
      }
    } catch (error: any) {
      console.error('Error enviando correo:', error);
      toast.error(error?.response?.data?.message || 'Fallo al enviar los correos.');
    } finally {
      setIsSending(false);
    }
  };

  const filteredEmpleados = empleados.filter(emp => {
    const full = `${emp.nombre} ${emp.apellido} ${emp.cedula} ${emp.cargos?.nombre || ''} ${emp.oficinas?.nombre || ''}`.toLowerCase();
    return full.includes(searchEmpleado.toLowerCase());
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Mail className="size-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Comunicados y Notificaciones por Correo
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px]">
                Módulo Oficial INSAI
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Envía comunicados institucionales masivos o personalizados a los funcionarios y técnicos registrados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={selectedEmpleadoIds.length === empleados.length && empleados.length > 0 ? "default" : "outline"}
            size="sm"
            onClick={handleSelectAllEmpleados}
            className="rounded-xl gap-2 font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 cursor-pointer"
          >
            <Users className="size-4 text-emerald-600" />
            {selectedEmpleadoIds.length === empleados.length && empleados.length > 0
              ? `Todos Seleccionados (${empleados.length})`
              : `Seleccionar Todos (${empleados.length} Empleados)`}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadInitialData}
            disabled={isLoadingData}
            className="rounded-xl gap-2 font-medium"
          >
            <RefreshCw className={`size-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            Actualizar Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel Izquierdo: Destinatarios y Plantillas */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="plantillas" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-12 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger value="plantillas" className="rounded-lg font-bold gap-2 text-xs">
                <Sparkles className="size-4 text-amber-500" />
                Plantillas Predefinidas
              </TabsTrigger>
              <TabsTrigger value="destinatarios" className="rounded-lg font-bold gap-2 text-xs">
                <Users className="size-4 text-emerald-500" />
                Destinatarios ({selectedEmpleadoIds.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB: PLANTILLAS */}
            <TabsContent value="plantillas" className="space-y-4 mt-4">
              <p className="text-xs text-muted-foreground font-medium px-1">
                Selecciona una plantilla oficial para cargar automáticamente la estructura del mensaje:
              </p>
              <div className="space-y-3 max-h-[35rem] overflow-y-auto custom-scrollbar pr-1">
                {plantillas.map(plantilla => {
                  const IconComp = ICON_MAP[plantilla.icono] || FileText;
                  const isSelected = selectedPlantillaId === plantilla.id;

                  return (
                    <Card
                      key={plantilla.id}
                      onClick={() => handleSelectPlantilla(plantilla)}
                      className={`cursor-pointer transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md ${
                        isSelected
                          ? 'border-2 border-emerald-500 bg-emerald-500/5 shadow-md'
                          : 'border-border/60 bg-card/60'
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`size-9 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'
                            }`}>
                              <IconComp className="size-4" />
                            </div>
                            <CardTitle className="text-sm font-bold">{plantilla.nombre}</CardTitle>
                          </div>
                          {isSelected && <Check className="size-4 text-emerald-500" />}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {plantilla.descripcion}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB: DESTINATARIOS */}
            <TabsContent value="destinatarios" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, cédula, cargo..."
                      value={searchEmpleado}
                      onChange={e => setSearchEmpleado(e.target.value)}
                      className="pl-9 h-10 rounded-xl"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllEmpleados}
                    className="rounded-xl h-10 px-3 text-xs font-bold shrink-0"
                  >
                    {selectedEmpleadoIds.length === empleados.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                </div>

                <div className="border border-border/60 rounded-xl p-2 bg-card/60 max-h-[30rem] overflow-y-auto custom-scrollbar divide-y divide-border/40">
                  {filteredEmpleados.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground italic">
                      No se encontraron empleados.
                    </div>
                  ) : (
                    filteredEmpleados.map(emp => {
                      const isChecked = selectedEmpleadoIds.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleEmpleado(emp.id)}
                          className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={isChecked} onCheckedChange={() => handleToggleEmpleado(emp.id)} />
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {emp.nombre} {emp.apellido}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="size-3" /> {emp.cargos?.nombre || 'General'}
                                </span>
                                •
                                <span className="flex items-center gap-1">
                                  <Building2 className="size-3" /> {emp.oficinas?.nombre || 'Sede'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-mono">
                            {emp.email || 'Con cuenta'}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel Derecho: Redacción del Mensaje y Envío */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Redacción del Comunicado</CardTitle>
                  <CardDescription className="text-xs">
                    Puedes editar manualmente el asunto y cuerpo del mensaje antes de realizar el envío.
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold uppercase text-[10px]">
                  Modo: {motivo}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Asunto */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Asunto del Correo <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={asunto}
                  onChange={e => setAsunto(e.target.value)}
                  placeholder="Ej. [CONVOCATORIA] Reunión de Trabajo..."
                  className="h-12 rounded-xl text-sm font-semibold border-border bg-muted/10 focus:bg-background transition-all"
                />
              </div>

              {/* Inserción de Variables Dinámicas */}
              <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Info className="size-3.5 text-blue-500" /> Insertar Variables Dinámicas
                  </span>
                  <span className="text-[10px] text-muted-foreground">Haz clic para agregar al cuerpo</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Nombre del Empleado', value: '{nombre}' },
                    { label: 'Cargo', value: '{cargo}' },
                    { label: 'Oficina', value: '{oficina}' },
                    { label: 'Cédula', value: '{cedula}' },
                    { label: 'Fecha Actual', value: '{fecha}' }
                  ].map(v => (
                    <Button
                      key={v.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(v.value)}
                      className="h-7 text-xs font-mono rounded-lg bg-background hover:bg-primary/10 hover:text-primary border-border cursor-pointer"
                    >
                      + {v.value}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mensaje */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Cuerpo del Mensaje <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  value={mensaje}
                  onChange={e => setMensaje(e.target.value)}
                  placeholder="Escribe aquí el contenido del mensaje o selecciona una plantilla..."
                  className="min-h-[220px] rounded-xl text-sm leading-relaxed border-border bg-muted/10 focus:bg-background transition-all resize-y custom-scrollbar"
                />
              </div>

              {/* Botón Acción Envío */}
              <div className="pt-2 flex items-center justify-between border-t border-border/50">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>Destinatarios seleccionados: <strong className="text-foreground">{selectedEmpleadoIds.length}</strong></span>
                  {selectedEmpleadoIds.length === 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllEmpleados}
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline cursor-pointer hover:opacity-80"
                    >
                      (Seleccionar Todos)
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleSendMail}
                  disabled={isSending || selectedEmpleadoIds.length === 0}
                  className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all gap-2"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      Enviando Comunicado...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Enviar Correo Masivo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado del Envío */}
          {resultadoEnvio && (
            <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="size-5" />
                  Reporte de Envío de Comunicado
                </div>
                {resultadoEnvio.simulado && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">
                    Modo Simulación SMTP
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-background border border-border/50">
                    <p className="text-muted-foreground font-semibold">Total Procesados</p>
                    <p className="text-lg font-bold text-foreground">{resultadoEnvio.total}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-700 font-semibold">Entregados</p>
                    <p className="text-lg font-bold text-emerald-600">{resultadoEnvio.enviados}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <p className="text-rose-700 font-semibold">Omitidos / Sin Correo</p>
                    <p className="text-lg font-bold text-rose-600">{resultadoEnvio.fallidos}</p>
                  </div>
                </div>

                {resultadoEnvio.detallesFallidos.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> Detalle de Omitidos:
                    </p>
                    <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                      {resultadoEnvio.detallesFallidos.map((f, idx) => (
                        <li key={idx}>
                          <strong>{f.nombre}</strong>: {f.motivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
