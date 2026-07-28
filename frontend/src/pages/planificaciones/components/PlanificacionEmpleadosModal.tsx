import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlanificaciones } from '@/hooks/use-planificaciones';
import { useEmpleados } from '@/hooks/use-empleados';
import type { Planificacion } from '@/types/planificaciones';
import { Users, UserPlus, Check, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanificacionEmpleadosModalProps {
  isOpen: boolean;
  onClose: () => void;
  planificacion: Planificacion | null;
}

export const PlanificacionEmpleadosModal: React.FC<PlanificacionEmpleadosModalProps> = ({
  isOpen,
  onClose,
  planificacion,
}) => {
  const { patchPlanificacionEmpleados, isPatchingEmpleados } = usePlanificaciones();
  const { empleados, setLimit: setEmpleadosLimit } = useEmpleados();
  const [selectedEmpleados, setSelectedEmpleados] = useState<number[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmpleadosLimit(100);
      if (planificacion?.planificacion_empleados) {
        setSelectedEmpleados(planificacion.planificacion_empleados.map((pe) => pe.empleado_id));
      } else {
        setSelectedEmpleados([]);
      }
      setSearchFilter('');
    }
  }, [isOpen, planificacion, setEmpleadosLimit]);

  const toggleEmpleado = (empId: number) => {
    setSelectedEmpleados((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSave = async () => {
    if (!planificacion) return;
    if (selectedEmpleados.length === 0) {
      return;
    }
    try {
      await patchPlanificacionEmpleados({
        id: planificacion.id,
        empleados: selectedEmpleados,
      });
      onClose();
    } catch {
      // Error is handled by mutation toast
    }
  };

  const filteredEmpleados = empleados.filter((emp: any) => {
    const fullName = `${emp.nombre || ''} ${emp.apellido || ''} ${emp.cedula || ''}`.toLowerCase();
    return fullName.includes(searchFilter.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPatchingEmpleados && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        <DialogHeader className="p-6 pb-4 bg-muted/40 dark:bg-muted/20 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-inner">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Editar Equipo de Inspectores
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Modifique la nómina de inspectores asignados a la planificación {planificacion?.codigo}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar inspector por nombre, apellido o cédula..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/20 border-border text-xs"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5 text-indigo-400" /> Selección de Técnicos
            </span>
            <span className="text-xs font-extrabold bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {selectedEmpleados.length} Seleccionado(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {filteredEmpleados.length === 0 ? (
              <p className="text-xs text-muted-foreground italic col-span-2 text-center py-6">
                No se encontraron empleados con ese filtro.
              </p>
            ) : (
              filteredEmpleados.map((emp: any) => {
                const isSelected = selectedEmpleados.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmpleado(emp.id)}
                    className={cn(
                      'p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : 'border-border/60 hover:border-indigo-500/40 hover:bg-muted/20'
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground">
                        {emp.nombre} {emp.apellido}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {emp.cargos?.nombre || 'Inspector Técnico'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'size-5 rounded-full border flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-border bg-background'
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border/50 bg-background/95 backdrop-blur-md sticky bottom-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPatchingEmpleados}
            className="h-10 px-4 rounded-xl text-xs font-bold cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPatchingEmpleados || selectedEmpleados.length === 0}
            className="h-10 px-6 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            {isPatchingEmpleados ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" /> Guardando...
              </>
            ) : (
              'Guardar Cambios (PATCH)'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
