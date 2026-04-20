import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Eye,
  Database,
  User as UserIcon,
  ChevronLeft,
  Users,
  Terminal
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

const BitacoraPage: React.FC = () => {
  const {
    logs,
    modulos,
    pagination,
    isLoading,
    limit,
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

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              title="volver"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
              Bitácora de Movimientos
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Auditoría detallada de acciones y eventos del sistema de forma granular.
          </p>
        </div>

        <div className="flex items-center gap-3 pl-0 md:pl-12">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="w-[140px] lg:w-[180px] bg-background/80 border-border h-10 rounded-xl focus:ring-primary/20 text-xs transition-all hover:bg-background hover:shadow-sm">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-border">
                <SelectItem value="all">Todos los módulos</SelectItem>
                {modulos.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={accion} onValueChange={setAccion}>
              <SelectTrigger className="w-[140px] lg:w-[180px] bg-background/80 border-border h-10 rounded-xl focus:ring-primary/20 text-xs transition-all hover:bg-background hover:shadow-sm">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent className="glass-effect border-border">
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="CREAR">CREAR</SelectItem>
                <SelectItem value="ACTUALIZAR">ACTUALIZAR</SelectItem>
                <SelectItem value="ELIMINAR">ELIMINAR</SelectItem>
                <SelectItem value="INICIO_SESION">INICIO SESIÓN</SelectItem>
                <SelectItem value="CIERRE_SESION">CIERRE SESIÓN</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="w-[200px] lg:w-[300px]">
              <SearchInput
                placeholder="Filtrar vista actual..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onClear={() => setUsername('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xl overflow-x-auto custom-scrollbar glass-effect min-h-[400px]">
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

        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
      </div>


      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl glass-effect">
          {selectedLog && (
            <div className="flex flex-col h-full overflow-hidden animate-in zoom-in-95 duration-300">
              <DialogHeader className="p-8 pb-6 bg-muted/40 dark:bg-muted/20 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-primary/10">
                    <HistoryIcon className="size-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black tracking-tight italic uppercase leading-none">
                      Auditoría de Movimiento
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold flex items-center gap-2">
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md text-[10px] tracking-widest">{selectedLog.modulo}</span>
                      <span className="opacity-50">•</span>
                      <span className="text-xs uppercase tracking-tighter">{new Date(selectedLog.fecha).toLocaleString()}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-card/10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em]">Estado Anterior</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 dark:bg-zinc-950 border border-border p-5 rounded-2xl min-h-[250px] overflow-auto custom-scrollbar shadow-inner ring-1 ring-white/5 group transition-all hover:border-rose-500/30">
                      {selectedLog.payload_previo ? (
                        <pre className="text-[12px] text-rose-700 dark:text-rose-300/80 whitespace-pre-wrap font-mono leading-relaxed transition-colors">
                          {JSON.stringify(selectedLog.payload_previo, null, 2)}
                        </pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs gap-2 py-10">
                          <Terminal className="size-6 opacity-20" />
                          Sin datos previos
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Nuevo Estado</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 dark:bg-zinc-950 border border-border p-5 rounded-2xl min-h-[250px] overflow-auto custom-scrollbar shadow-inner ring-1 ring-white/5 group transition-all hover:border-emerald-500/30">
                      {selectedLog.payload_nuevo ? (
                        <pre className="text-[12px] text-emerald-700 dark:text-emerald-300/80 whitespace-pre-wrap font-mono leading-relaxed transition-colors">
                          {JSON.stringify(selectedLog.payload_nuevo, null, 2)}
                        </pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs gap-2 py-10">
                          <Terminal className="size-6 opacity-20" />
                          Evento sin persistencia dinámica
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                <div className="bg-muted/40 border border-border p-6 rounded-3xl shadow-xl backdrop-blur-md">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <UserIcon className="w-3 h-3 text-primary" /> Usuario Responsable
                      </span>
                      <p className="text-foreground font-bold text-lg leading-none">{selectedLog.username_log}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3 h-3 text-blue-500" /> ID Transacción
                      </span>
                      <p className="text-foreground font-mono text-lg leading-none">#{selectedLog.id}</p>
                    </div>
                    {selectedLog.empleados && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3 h-3 text-emerald-500" /> Funcionario
                        </span>
                        <p className="text-foreground font-bold text-lg leading-none">
                          {selectedLog.empleados.nombre} {selectedLog.empleados.apellido}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-muted/40 border-t border-border flex items-center justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="font-black text-xs uppercase tracking-widest px-8 h-12 rounded-xl transition-all cursor-pointer hover:bg-primary hover:text-white border-primary/20 text-primary"
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
