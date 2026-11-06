import { useState, useEffect } from 'react';
import { useBackup } from '@/hooks/use-backup';
import {
  Database,
  Download,
  Trash2,
  RefreshCw,
  HardDrive,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function RespaldosTab() {
  const {
    respaldos,
    stats,
    config,
    isLoading,
    isFetching,
    refetchList,
    crearRespaldoManual,
    isCreatingManual,
    eliminarRespaldo,
    isDeleting,
    guardarConfiguracion,
    isSavingConfig,
    descargar,
    downloadingFile,
  } = useBackup();

  // Estados locales
  const [targetManual, setTargetManual] = useState<'operativa' | 'master' | 'all'>('operativa');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  // Estados para formulario de configuración automática
  const [autoEnabled, setAutoEnabled] = useState<boolean>(config?.enabled ?? false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(config?.frequency || 'daily');
  const [time, setTime] = useState<string>(config?.time || '02:00');
  const [maxCopies, setMaxCopies] = useState<number>(config?.maxCopies || 10);
  const [isConfigDirty, setIsConfigDirty] = useState(false);

  // Sincronizar cuando config se carga del servidor
  useEffect(() => {
    if (config && !isConfigDirty) {
      setAutoEnabled(config.enabled ?? false);
      setFrequency(config.frequency || 'daily');
      setTime(config.time || '02:00');
      setMaxCopies(config.maxCopies || 10);
    }
  }, [config, isConfigDirty]);

  const handleToggleAuto = (val: boolean) => {
    setAutoEnabled(val);
    setIsConfigDirty(true);
  };

  const handleFrequencyChange = (val: 'daily' | 'weekly' | 'monthly') => {
    setFrequency(val);
    setIsConfigDirty(true);
  };

  const handleTimeChange = (val: string) => {
    setTime(val);
    setIsConfigDirty(true);
  };

  const handleMaxCopiesChange = (val: string) => {
    setMaxCopies(Number(val) || 10);
    setIsConfigDirty(true);
  };

  const handleSaveConfig = async () => {
    await guardarConfiguracion({
      enabled: autoEnabled,
      frequency,
      time,
      maxCopies,
    });
    setIsConfigDirty(false);
  };

  const handleCrearManual = async () => {
    await crearRespaldoManual(targetManual);
  };

  const handleConfirmDelete = async () => {
    if (fileToDelete) {
      await eliminarRespaldo(fileToDelete);
      setFileToDelete(null);
    }
  };

  // Filtrado de respaldos
  const filteredRespaldos = respaldos.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dbName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTipo === 'todos') return true;
    if (filterTipo === 'manual') return item.tipo === 'manual';
    if (filterTipo === 'automatico') return item.tipo === 'automatico';
    if (filterTipo === 'master') return item.target === 'master';
    if (filterTipo === 'operativa') return item.target === 'operativa';
    return true;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        relative: formatDistanceToNow(d, { addSuffix: true, locale: es }),
        formatted: d.toLocaleString('es-VE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    } catch {
      return { relative: 'Reciente', formatted: dateStr };
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0 max-w-full">
      {/* ── MÉTRICAS Y RESUMEN RÁPIDO (MOBILE FIRST) ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full min-w-0">
        {/* Total Respaldos */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs flex items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Respaldos Almacenados</p>
            <p className="text-2xl font-black text-foreground truncate">{stats?.totalRespaldos ?? 0}</p>
            <span className="text-[11px] text-muted-foreground block truncate">Archivos en /respaldos</span>
          </div>
          <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="size-5" />
          </div>
        </div>

        {/* Espacio en Disco */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs flex items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Espacio Ocupado</p>
            <p className="text-2xl font-black text-foreground truncate">{stats?.espacioOcupadoFormatted ?? '0 B'}</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block truncate">Cuidado de disco activo</span>
          </div>
          <div className="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <HardDrive className="size-5" />
          </div>
        </div>

        {/* Último Respaldo */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs flex items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1 pr-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Último Respaldo</p>
            <p className="text-sm font-bold text-foreground truncate">
              {stats?.ultimoRespaldo ? formatDate(stats.ultimoRespaldo.fecha).relative : 'Ninguno aún'}
            </p>
            <span className="text-[11px] text-muted-foreground block truncate">
              {stats?.ultimoRespaldo ? `${stats.ultimoRespaldo.target.toUpperCase()} • ${stats.ultimoRespaldo.sizeFormatted}` : 'Genera uno ahora'}
            </span>
          </div>
          <div className="size-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Calendar className="size-5" />
          </div>
        </div>

        {/* Estado Automático */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs flex items-center justify-between gap-3 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate">Respaldo Automático</p>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn("size-2 rounded-full shrink-0", stats?.autoEnabled ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50")} />
              <p className="text-sm font-bold text-foreground truncate">{stats?.autoEnabled ? 'Activo' : 'Desactivado'}</p>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate">
              {stats?.autoEnabled ? `${stats.autoFrequency === 'daily' ? 'Diario' : 'Semanal'} a las ${stats.autoTime}` : 'Configúralo abajo'}
            </span>
          </div>
          <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0", stats?.autoEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
            <Clock className="size-5" />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DOBLE: MANUAL + AUTOMÁTICO (MOBILE FIRST: 1 COL, LG: 2 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0 max-w-full">
        {/* TARJETA 1: RESPALDO MANUAL */}
        <div className="p-4 sm:p-6 rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md shadow-sm space-y-4 min-w-0 max-w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Database className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-foreground tracking-tight truncate">Generar Respaldo Manual</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">Crea un volcado SQL inmediato y descárgalo o consérvalo en el servidor.</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wide">Base de Datos a Respaldar</Label>
              <Select value={targetManual} onValueChange={(v: 'operativa' | 'master' | 'all') => setTargetManual(v)}>
                <SelectTrigger className="h-11 rounded-xl bg-background border-border/80">
                  <SelectValue placeholder="Seleccione base de datos..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="operativa">
                    <span className="font-semibold">Base de Datos Operativa (Sede Actual)</span>
                    <span className="block text-[11px] text-muted-foreground">Inspecciones, solicitudes, inventario, fincas</span>
                  </SelectItem>
                  <SelectItem value="master">
                    <span className="font-semibold">Base de Datos Master</span>
                    <span className="block text-[11px] text-muted-foreground">Usuarios globales, roles, permisos e instancias</span>
                  </SelectItem>
                  <SelectItem value="all">
                    <span className="font-semibold">Respaldo Completo (Ambas)</span>
                    <span className="block text-[11px] text-muted-foreground">Genera ambos volcados organizados por nombre y fecha</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <FileCode className="size-3.5 text-primary" />
                <span>Formato del archivo resultante:</span>
              </div>
              <p className="font-mono text-[11px] text-primary/90 break-all">
                respaldos/backup_{targetManual}_[nombre_bd]_[fecha]_[hora]_manual.sql
              </p>
            </div>

            <Button
              onClick={handleCrearManual}
              disabled={isCreatingManual}
              className="w-full h-11 rounded-xl font-bold gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] bg-primary text-primary-foreground shadow-sm"
            >
              {isCreatingManual ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Generando volcado SQL...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Crear Respaldo Ahora</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* TARJETA 2: CONFIGURACIÓN AUTOMÁTICA */}
        <div className="p-4 sm:p-6 rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md shadow-sm space-y-4 flex flex-col justify-between min-w-0 max-w-full">
          <div>
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Clock className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground tracking-tight truncate">Respaldos Automáticos</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">Programador interno en segundo plano sin dependencias externas.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={autoEnabled}
                  onCheckedChange={handleToggleAuto}
                  aria-label="Activar respaldos automáticos"
                />
              </div>
            </div>

            <div className={cn("space-y-3.5 pt-4 transition-opacity", !autoEnabled && "opacity-50 pointer-events-none")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Frecuencia */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wide">Frecuencia</Label>
                  <Select value={frequency} onValueChange={handleFrequencyChange} disabled={!autoEnabled}>
                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="daily">Diario (Todos los días)</SelectItem>
                      <SelectItem value="weekly">Semanal (Una vez por semana)</SelectItem>
                      <SelectItem value="monthly">Mensual (1ro de cada mes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hora de Ejecución */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wide">Hora de Ejecución (24h)</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={!autoEnabled}
                    className="h-10 rounded-xl bg-background border-border/80 text-xs"
                  />
                </div>
              </div>

              {/* Límite de Retención (Rotación para bajo consumo de disco) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center justify-between">
                  <span>Conservar Últimas Copias (Auto-limpieza)</span>
                  <span className="text-primary font-bold">{maxCopies} respaldos</span>
                </Label>
                <Select value={String(maxCopies)} onValueChange={handleMaxCopiesChange} disabled={!autoEnabled}>
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    <SelectItem value="5">Últimos 5 respaldos (Ideal para discos pequeños)</SelectItem>
                    <SelectItem value="10">Últimos 10 respaldos (Recomendado)</SelectItem>
                    <SelectItem value="15">Últimos 15 respaldos</SelectItem>
                    <SelectItem value="30">Últimos 30 respaldos (Mes completo)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Al alcanzar este límite, las copias más viejas se descartan automáticamente para no saturar la memoria ni el disco.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isSavingConfig || (!isConfigDirty && autoEnabled === config?.enabled)}
              variant={isConfigDirty ? "default" : "outline"}
              className="w-full h-10 rounded-xl text-xs font-bold gap-2 cursor-pointer"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Guardando configuración...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Guardar Parámetros de Respaldo</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── LISTADO DE RESPALDOS EXISTENTES (MOBILE FIRST) ──────────── */}
      <div className="p-4 sm:p-6 rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md shadow-sm space-y-4 min-w-0 max-w-full">
        {/* Cabecera de la lista + Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <span className="truncate">Historial de Respaldos</span>
              <Badge variant="outline" className="text-[11px] font-semibold bg-muted/50 shrink-0">
                {filteredRespaldos.length} archivo{filteredRespaldos.length === 1 ? '' : 's'}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">Archivos almacenados en la carpeta del servidor listos para descargar o archivar.</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchList()}
              disabled={isFetching}
              className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-primary")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros rápidos */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de archivo o base de datos..."
              className="h-10 pl-9 rounded-xl bg-background border-border text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="h-10 w-full sm:w-44 rounded-xl bg-background border-border text-xs">
                <Filter className="size-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="todos">Todos los respaldos</SelectItem>
                <SelectItem value="operativa">Solo Operativa</SelectItem>
                <SelectItem value="master">Solo Master</SelectItem>
                <SelectItem value="manual">Solo Manuales</SelectItem>
                <SelectItem value="automatico">Solo Automáticos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── VISTA MÓVIL: TARJETAS RESPONSIVAS (< md) ────────────────── */}
        <div className="block md:hidden space-y-3 pt-2">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
              <RefreshCw className="size-6 animate-spin mx-auto text-primary" />
              <p>Consultando carpeta de respaldos...</p>
            </div>
          ) : filteredRespaldos.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20 space-y-2">
              <Database className="size-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs font-semibold text-foreground">No se encontraron respaldos</p>
              <p className="text-[11px] text-muted-foreground">Usa el botón "Crear Respaldo Ahora" para generar el primero.</p>
            </div>
          ) : (
            filteredRespaldos.map((item) => {
              const { relative, formatted } = formatDate(item.createdAt);
              const isDownloading = downloadingFile === item.filename;

              return (
                <div
                  key={item.filename}
                  className="p-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/30 transition-all space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileCode className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground break-all leading-tight">{item.filename}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatted} ({relative})</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold px-2 py-0 border",
                          item.target === 'master'
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        )}
                      >
                        {item.target.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium px-1.5 py-0 bg-muted text-muted-foreground"
                      >
                        {item.tipo}
                      </Badge>
                      <span className="text-[11px] font-mono font-semibold text-muted-foreground ml-1">
                        {item.sizeFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => descargar(item.filename)}
                        disabled={isDownloading}
                        className="size-8 rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                        title="Descargar respaldo"
                      >
                        <Download className={cn("size-3.5", isDownloading && "animate-bounce text-primary")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFileToDelete(item.filename)}
                        disabled={isDeleting}
                        className="size-8 rounded-lg cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                        title="Eliminar respaldo"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── VISTA DESKTOP: TABLA ESTRUCTURADA (>= md) ───────────────── */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Archivo / Nombre</th>
                <th className="py-3 px-4">Base de Datos</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Fecha de Generación</th>
                <th className="py-3 px-4 text-right">Tamaño</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    <RefreshCw className="size-5 animate-spin mx-auto text-primary mb-2" />
                    Cargando lista de respaldos...
                  </td>
                </tr>
              ) : filteredRespaldos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No se encontraron archivos de respaldo con el criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredRespaldos.map((item) => {
                  const { relative, formatted } = formatDate(item.createdAt);
                  const isDownloading = downloadingFile === item.filename;

                  return (
                    <tr key={item.filename} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <FileCode className="size-4 text-primary shrink-0" />
                          <span className="font-mono text-xs">{item.filename}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0 border",
                            item.target === 'master'
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {item.target.toUpperCase()} ({item.dbName})
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                          {item.tipo}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <span>{formatted}</span>
                        <span className="block text-[10px] text-muted-foreground/80">{relative}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                        {item.sizeFormatted}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => descargar(item.filename)}
                            disabled={isDownloading}
                            className="h-8 px-2.5 rounded-lg text-xs gap-1.5 cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                          >
                            <Download className={cn("size-3.5", isDownloading && "animate-bounce text-primary")} />
                            <span>Descargar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFileToDelete(item.filename)}
                            disabled={isDeleting}
                            className="size-8 rounded-lg cursor-pointer hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────── */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-border bg-card p-6 max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <div className="size-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
              <AlertCircle className="size-6" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              ¿Eliminar archivo de respaldo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Esta acción eliminará permanentemente el archivo <strong className="text-foreground break-all">{fileToDelete}</strong> de la carpeta del servidor. Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
            <AlertDialogCancel className="rounded-xl h-10 text-xs font-bold cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl h-10 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
            >
              Sí, eliminar respaldo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

