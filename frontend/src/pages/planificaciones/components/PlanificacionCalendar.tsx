import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Planificacion } from '@/types/planificaciones';
import { cn } from '@/lib/utils';

interface PlanificacionCalendarProps {
  planificaciones: Planificacion[];
  onViewDetails: (id: number) => void;
  onAddVisit: (dateStr: string) => void;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const PlanificacionCalendar: React.FC<PlanificacionCalendarProps> = ({
  planificaciones,
  onViewDetails,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();


  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const calendarCells: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  for (let i = adjustedFirstDayIndex - 1; i >= 0; i--) {
    const prevDay = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, prevDay);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarCells.push({
      dayNumber: prevDay,
      dateStr,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const localDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dayNumber: d,
      dateStr: localDateStr,
      isCurrentMonth: true,
    });
  }


  const totalCellsSoFar = calendarCells.length;
  const remainingCells = 42 - totalCellsSoFar;
  for (let n = 1; n <= remainingCells; n++) {
    const nextMonthDate = new Date(year, month + 1, n);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    calendarCells.push({
      dayNumber: n,
      dateStr,
      isCurrentMonth: false,
    });
  }

  const getPlansForDate = (dateStr: string) => {
    return planificaciones.filter(p => {
      const pDate = p.fecha_programada.substring(0, 10);
      return pDate === dateStr;
    });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const formatTime = (isoTimeStr: string | null) => {
    if (!isoTimeStr) return '';
    try {
      let t = isoTimeStr;
      if (isoTimeStr.includes('T')) {
        t = isoTimeStr.split('T')[1];
      }
      const [hoursStr, minutesStr] = t.split(':');
      return `${hoursStr.padStart(2, '0')}:${minutesStr.padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const formatSelectedDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const selectedDatePlans = selectedDate ? getPlansForDate(selectedDate) : [];

  const getPriorityTextClass = (priority: string) => {
    switch (priority) {
      case 'URGENTE': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'ALTA': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'MEDIA': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-6 text-primary" />
          <h2 className="text-xl font-black uppercase italic tracking-wider">
            {MONTHS[month]} <span className="text-primary font-bold not-italic">{year}</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs font-bold rounded-lg border-border hover:bg-muted/50 cursor-pointer"
          >
            Hoy
          </Button>
          <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="size-8 rounded-none hover:bg-muted/50 border-r border-border cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="size-8 rounded-none hover:bg-muted/50 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-7 gap-1.5 text-center">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-xs font-black uppercase text-muted-foreground tracking-widest py-2 bg-muted/5 rounded-lg border border-border/20">
            {d}
          </div>
        ))}
      </div>


      <div className="grid grid-cols-7 gap-1.5 border border-border/30 rounded-2xl p-1.5 bg-muted/5 shadow-inner">
        {calendarCells.map((cell, idx) => {
          const dayPlans = getPlansForDate(cell.dateStr);
          const cellIsToday = isToday(cell.dateStr);

          return (
            <div
              key={idx}
              onClick={() => {
                if (dayPlans.length > 0) {
                  setSelectedDate(cell.dateStr);
                }
              }}
              className={cn(
                "min-h-32.5 p-2 rounded-xl flex flex-col justify-between transition-all relative border group border-border/20 select-none",
                dayPlans.length > 0 ? "cursor-pointer hover:border-primary/40 hover:shadow-md hover:bg-primary/1" : "cursor-default",
                cell.isCurrentMonth ? "bg-background" : "bg-muted/10 opacity-40",
                cellIsToday && "ring-2 ring-primary/40 border-primary/40"
              )}
            >

              <div className="flex items-center justify-between pointer-events-none mb-1">
                <span
                  className={cn(
                    "text-xs font-extrabold text-muted-foreground flex items-center justify-center size-5 rounded-full transition-all",
                    cellIsToday && "bg-primary text-white text-[10px] font-black"
                  )}
                >
                  {cell.dayNumber}
                </span>

                {dayPlans.length > 0 && (
                  <span className="text-4.5 font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 size-4.5 rounded-full flex items-center justify-center">
                    {dayPlans.length}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1 overflow-hidden pointer-events-none mt-1">
                {dayPlans.slice(0, 3).map(plan => {
                  const isUrgent = plan.prioridad === 'URGENTE';
                  const isHigh = plan.prioridad === 'ALTA';
                  const isMedium = plan.prioridad === 'MEDIA';
                  const isFinished = plan.status === 'FINALIZADA';

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded border truncate",
                        isFinished
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : isUrgent
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : isHigh
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : isMedium
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      )}
                    >
                      {formatTime(plan.hora_inicio)} {plan.solicitudes?.propiedades?.nombre || plan.actividad}
                    </div>
                  );
                })}

                {dayPlans.length > 3 && (
                  <div className="text-[8px] font-extrabold text-indigo-500 bg-indigo-500/10 rounded border border-indigo-500/20 px-1 py-0.5 text-center uppercase">
                    + {dayPlans.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl lg:max-w-4xl max-h-[min(90vh,52rem)] overflow-hidden border-none shadow-2xl glass-effect p-0 custom-scrollbar flex flex-col">
          <DialogHeader className="shrink-0 p-6 sm:p-8 bg-muted/40 border-b border-border/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <CalendarIcon className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
                  Inspecciones del Día
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground capitalize mt-1 font-medium">
                  {formatSelectedDate(selectedDate)}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col p-6 sm:p-8 space-y-5">
            {selectedDatePlans.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <p className="text-sm text-muted-foreground font-semibold">
                  Se encontraron <span className="text-indigo-400 font-extrabold">{selectedDatePlans.length}</span> visitas planificadas para esta fecha:
                </p>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[min(58vh,28rem)]">
                  {selectedDatePlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedDate(null);
                        onViewDetails(plan.id);
                      }}
                      className="group cursor-pointer p-5 sm:p-6 bg-muted/20 border border-border/40 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all flex items-start sm:items-center justify-between gap-4 sm:gap-6"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] sm:text-xs font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                            {plan.codigo}
                          </span>
                          <span className={cn("text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded border uppercase", getPriorityTextClass(plan.prioridad))}>
                            {plan.prioridad}
                          </span>
                          <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded border uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            {plan.status}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                          {plan.actividad}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-sm text-muted-foreground font-medium pt-0.5">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <Clock className="size-4" />
                            {plan.hora_inicio ? formatTime(plan.hora_inicio) : 'Sin hora'}
                          </span>
                          <span className="hidden sm:inline text-border">•</span>
                          <span className="min-w-0">
                            Finca:{' '}
                            <span className="font-semibold text-foreground/80 wrap-break-word">
                              {plan.solicitudes?.propiedades?.nombre || 'General'}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 shrink-0 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-all cursor-pointer"
                        title="Ver detalles"
                      >
                        <Eye className="size-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4 text-center border border-dashed border-border rounded-2xl bg-muted/5">
                <AlertTriangle className="size-10 text-muted-foreground/60" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">No hay visitas planificadas</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    No se programó ninguna inspección oficial de campo para este día.
                  </p>
                </div>
              </div>
            )}

            <div className="flex shrink-0 items-center justify-end pt-4 border-t border-border/50">
              <Button
                onClick={() => setSelectedDate(null)}
                variant="ghost"
                className="h-10 px-5 text-sm font-bold cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
