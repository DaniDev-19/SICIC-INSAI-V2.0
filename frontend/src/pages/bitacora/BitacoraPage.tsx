import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Eye,
  Database,
  User as UserIcon,
  ChevronLeft,
  Users,
  Terminal,
  ListFilter as Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBitacora } from '@/hooks/use-bitacora';
import type { BitacoraLog } from '@/types/bitacora';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const PayloadViewer = ({ data, color }: { data: any, color: 'rose' | 'emerald' }) => {
  if (data === null || data === undefined) {
    return <span className="text-muted-foreground/50 italic text-xs">Nulo</span>;
  }

  if (typeof data !== 'object') {
    return <span className="font-mono">{String(data)}</span>;
  }

  const colorClass = color === 'rose'
    ? "text-rose-700 dark:text-rose-300"
    : "text-emerald-700 dark:text-emerald-300";

  const keyColorClass = color === 'rose'
    ? "text-rose-900/70 dark:text-rose-200/50"
    : "text-emerald-900/70 dark:text-emerald-200/50";

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-muted-foreground/50 italic text-[11px] bg-background/50 px-2 py-0.5 rounded-md">Lista vacía</span>;
    return (
      <ul className="space-y-2 mt-1">
        {data.map((item, index) => (
          <li key={index} className={`pl-3 border-l-2 ${color === 'rose' ? 'border-rose-500/20' : 'border-emerald-500/20'}`}>
            <PayloadViewer data={item} color={color} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2 w-full bg-background/30 p-3 rounded-xl border border-white/5">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-border/10 last:border-0 pb-2 last:pb-0">
          <span className={`text-[10px] font-black uppercase tracking-widest ${keyColorClass} sm:w-1/3 shrink-0 pt-0.5`}>
            {key.replace(/_/g, ' ')}
          </span>
          <div className={`text-[13px] font-medium ${colorClass} wrap-break-words flex-1`}>
            <PayloadViewer data={value} color={color} />
          </div>
        </div>
      ))}
    </div>
  );
};

const BitacoraPage: React.FC = () => {
  const {
    logs,
    modulos,
    pagination,
    isLoading,
    modulo,
    accion,
    username,
    setPage,
    setLimit,
    setModulo,
    setAccion,
    setUsername
  } = useBitacora();

  const [selectedLog, setSelectedLog] = useState<BitacoraLog | null>(null);
  const navigate = useNavigate();

  const filteredLogs = React.useMemo(() => {
    if (!username) return logs;
    const term = username.toLowerCase();
    return logs.filter(log =>
      log.username_log.toLowerCase().includes(term) ||
      log.modulo.toLowerCase().includes(term) ||
      log.accion.toLowerCase().includes(term)
    );
  }, [logs, username]);


  const getActionColor = (accion: string) => {
    switch (accion.toUpperCase()) {
      case 'CREAR': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'ACTUALIZAR': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      case 'ELIMINAR': return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      case 'INICIO_SESION': return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'CIERRE_SESION': return 'text-muted-foreground bg-muted border-border';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const filterType = [
    { id: 1, value: "ACTUALIZAR", nombre: "Actualizar" },
    { id: 2, value: "CREAR", nombre: "Crear" },
    { id: 3, value: "ELIMINAR", nombre: "Eliminar" },
    { id: 4, value: "INICIO_SESION", nombre: "Login" },
    { id: 4, value: "CIERRE_SESION", nombre: "Logout" }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              title="volver"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shrink-0"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text break-words">
              Bitácora de Movimientos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium pl-9 sm:pl-12">
            Auditoría detallada de acciones y eventos del sistema de forma granular.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10 w-full sm:w-auto min-w-0">
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger
                title="Filtrar por Módulo"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden shrink-0"
              >
                <Database className={`size-4 ${modulo !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Módulo" />
                </span>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-w-[calc(100vw-2rem)] sm:max-w-xs">
                <SelectItem value="all" className='cursor-pointer' >Todos los Módulos</SelectItem>
                {modulos.map(m => <SelectItem key={m} value={m} className='cursor-pointer'>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={accion} onValueChange={setAccion}>
              <SelectTrigger
                title="Filtrar por Acción"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden shrink-0"
              >
                <Filter className={`size-4 ${accion !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only">
                  <SelectValue placeholder="Acción" />
                </span>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} align="start" className="glass-effect border-border max-w-[calc(100vw-2rem)] sm:max-w-xs">
                <SelectItem value="all">Todas las Acciones</SelectItem>
                {filterType.map((t) => <SelectItem key={t.id} value={t.value}>{t.nombre}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block shrink-0" />

            <div className="flex-1 min-w-0 w-full sm:w-64 lg:w-80">
              <SearchInput
                placeholder="Buscar usuario..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onClear={() => setUsername('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
        {/* Vista Móvil / Tarjetas (lg:hidden) */}
        <div className="divide-y divide-border/50 lg:hidden">
          {isLoading && filteredLogs.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center space-y-3 opacity-40">
              <Terminal className="size-10 mx-auto" />
              <p className="text-sm font-medium italic">No se encontraron registros de auditoría</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-4 hover:bg-primary/5 active:bg-muted/40 transition-all duration-200 cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-foreground text-sm block break-words whitespace-normal">
                        {log.username_log}
                      </span>
                      {log.empleados && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block break-words">
                          {log.empleados.nombre} {log.empleados.apellido}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Ver Histórico"
                    onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                    className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 shrink-0 cursor-pointer"
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-foreground border border-border shrink-0">
                    <Database className="size-3 text-muted-foreground" />
                    <span>{log.modulo}</span>
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getActionColor(log.accion)} shrink-0`}>
                    <div className="size-1.5 rounded-full bg-current animate-pulse" />
                    {log.accion.replace('_', ' ')}
                  </div>

                  <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                    {new Date(log.fecha).toLocaleDateString()} {new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista Escritorio (hidden lg:block) */}
        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Módulo</TableHead>
                <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Acción</TableHead>
                <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Usuario</TableHead>
                <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right border-none">Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/50">
              {isLoading && filteredLogs.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-none">
                    <TableCell colSpan={5} className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[400px] text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <Terminal className="size-12" />
                      <p className="text-sm font-medium italic">No se encontraron registros de auditoría</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="group hover:bg-primary/5 transition-all duration-300 border-none"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">
                          {new Date(log.fecha).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(log.fecha).toLocaleTimeString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-muted flex items-center justify-center border border-border transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary/50 shadow-inner">
                          <Database className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                        </div>
                        <span className="text-foreground font-bold group-hover:translate-x-1 transition-transform">{log.modulo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getActionColor(log.accion)} shadow-sm`}>
                        <div className="size-1.5 rounded-full bg-current animate-pulse" />
                        {log.accion.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                          <UserIcon className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground block group-hover:translate-x-1 transition-transform">{log.username_log}</span>
                          {log.empleados && (
                            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-semibold">
                              {log.empleados.nombre} {log.empleados.apellido}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title='Ver Historico'
                        onClick={() => setSelectedLog(log)}
                        className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-all group-hover:scale-110 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 sm:px-6 sm:py-4 border-t border-border bg-muted/20">
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
      </div>


      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl max-h-[min(92vh,50rem)] overflow-hidden flex flex-col p-0 border-none shadow-2xl glass-effect">
          {selectedLog && (
            <div className="flex flex-col h-full overflow-hidden animate-in zoom-in-95 duration-300">
              <DialogHeader className="p-4 sm:p-6 pr-12 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="size-11 sm:size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-primary/10 shrink-0">
                    <HistoryIcon className="size-6 sm:size-8 text-white" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <DialogTitle className="text-lg sm:text-2xl font-black tracking-tight italic uppercase leading-none truncate">
                      Auditoría de Movimiento
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold flex flex-wrap items-center gap-2">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] tracking-widest">{selectedLog.modulo}</span>
                      <span className="opacity-50 hidden sm:inline">•</span>
                      <span className="text-xs uppercase tracking-tighter">{new Date(selectedLog.fecha).toLocaleString()}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 custom-scrollbar bg-card/10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em]">Estado Anterior</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 dark:bg-zinc-950 border border-border p-4 sm:p-5 rounded-2xl min-h-[180px] sm:min-h-[250px] overflow-auto custom-scrollbar shadow-inner ring-1 ring-white/5 group transition-all hover:border-rose-500/30">
                      {selectedLog.payload_previo ? (
                        <div className="w-full">
                          <PayloadViewer data={selectedLog.payload_previo} color="rose" />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs gap-2 py-8">
                          <Terminal className="size-6 opacity-20" />
                          Sin datos previos
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Nuevo Estado</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 dark:bg-zinc-950 border border-border p-4 sm:p-5 rounded-2xl min-h-[180px] sm:min-h-[250px] overflow-auto custom-scrollbar shadow-inner ring-1 ring-white/5 group transition-all hover:border-emerald-500/30">
                      {selectedLog.payload_nuevo ? (
                        <div className="w-full">
                          <PayloadViewer data={selectedLog.payload_nuevo} color="emerald" />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs gap-2 py-8">
                          <Terminal className="size-6 opacity-20" />
                          Evento sin persistencia dinámica
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                <div className="bg-muted/40 border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-3 h-3 text-primary" /> Usuario Responsable
                      </span>
                      <p className="text-foreground font-bold text-base sm:text-lg leading-none break-words">{selectedLog.username_log}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-500" /> ID Transacción
                      </span>
                      <p className="text-foreground font-mono text-base sm:text-lg leading-none">#{selectedLog.id}</p>
                    </div>
                    {selectedLog.empleados && (
                      <div className="space-y-1 sm:col-span-2 md:col-span-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3 h-3 text-emerald-500" /> Funcionario
                        </span>
                        <p className="text-foreground font-bold text-base sm:text-lg leading-none break-words">
                          {selectedLog.empleados.nombre} {selectedLog.empleados.apellido}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-3 sm:p-4 bg-muted/40 border-t border-border flex items-center justify-end w-full shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="font-black text-xs uppercase tracking-widest px-6 h-10 sm:h-11 rounded-xl transition-all cursor-pointer hover:bg-primary hover:text-white border-primary/20 text-primary w-full sm:w-auto"
                >
                  Cerrar Auditoría
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BitacoraPage;
