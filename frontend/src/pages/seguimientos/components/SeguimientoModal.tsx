import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Loader2,
  Calendar,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  Building2,
  Search,
} from 'lucide-react';
import { useInspecciones } from '@/hooks/use-inspecciones';
import { isEligibleSeguimiento } from '@/pages/inspecciones/components/InspeccionTable';
import type { Seguimiento, CreateSeguimientoDTO, UpdateSeguimientoDTO } from '@/types/seguimientos';

interface SeguimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  seguimiento?: Seguimiento | null;
  preselectedInspeccionId?: number | null;
  onSave: (data: any) => Promise<void>;
}

export function SeguimientoModal({
  isOpen,
  onClose,
  seguimiento,
  preselectedInspeccionId,
  onSave,
}: SeguimientoModalProps) {
  const isEditing = !!seguimiento;
  const { inspecciones } = useInspecciones(100);

  const [inspeccionId, setInspeccionId] = useState<string>('');
  const [inspSearch, setInspSearch] = useState<string>('');
  const [fechaSeguimiento, setFechaSeguimiento] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [hallazgos, setHallazgos] = useState<string>('');
  const [recomendacionesCumplidas, setRecomendacionesCumplidas] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('EN_PROCESO');
  const [fotosFiles, setFotosFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setInspSearch('');
      if (seguimiento) {
        setInspeccionId(seguimiento.inspeccion_id ? String(seguimiento.inspeccion_id) : '');
        setFechaSeguimiento(
          seguimiento.fecha_seguimiento
            ? new Date(seguimiento.fecha_seguimiento).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        );
        setHallazgos(seguimiento.hallazgos_seguimiento || '');
        setRecomendacionesCumplidas(!!seguimiento.recomendaciones_cumplidas);
        setStatus(seguimiento.status || 'EN_PROCESO');
        setFotosFiles([]);
      } else {
        setInspeccionId(preselectedInspeccionId ? String(preselectedInspeccionId) : '');
        setFechaSeguimiento(new Date().toISOString().split('T')[0]);
        setHallazgos('');
        setRecomendacionesCumplidas(false);
        setStatus('EN_PROCESO');
        setFotosFiles([]);
      }
    }
  }, [isOpen, seguimiento, preselectedInspeccionId]);

  const filteredInspecciones = inspecciones.filter((insp) => {
    // Filtrar solo inspecciones con estados coherentes para seguimiento
    const isEligible = isEligibleSeguimiento(insp) || String(insp.id) === inspeccionId;
    if (!isEligible) return false;

    if (!inspSearch.trim()) return true;
    const tokens = inspSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const nControl = (insp.n_control || '').toLowerCase();
    const prop = (insp.planificaciones?.solicitudes?.propiedades?.nombre || '').toLowerCase();
    const cliente = (insp.planificaciones?.solicitudes?.clientes?.nombre || '').toLowerCase();
    const st = (insp.status || '').toLowerCase();

    return tokens.every(
      (token) =>
        nControl.includes(token) ||
        prop.includes(token) ||
        cliente.includes(token) ||
        st.includes(token)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotosFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspeccionId && !seguimiento?.inspeccion_id) {
      return;
    }
    if (!hallazgos.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && seguimiento) {
        const dto: UpdateSeguimientoDTO = {
          fecha_seguimiento: fechaSeguimiento,
          hallazgos_seguimiento: hallazgos,
          recomendaciones_cumplidas: recomendacionesCumplidas,
          status,
          fotos: fotosFiles.length > 0 ? fotosFiles : undefined,
        };
        await onSave(dto);
      } else {
        const dto: CreateSeguimientoDTO = {
          inspeccion_id: Number(inspeccionId),
          fecha_seguimiento: fechaSeguimiento,
          hallazgos_seguimiento: hallazgos,
          recomendaciones_cumplidas: recomendacionesCumplidas,
          status,
          fotos: fotosFiles,
        };
        await onSave(dto);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInspeccionObj = inspecciones.find((i) => String(i.id) === inspeccionId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl border-none shadow-2xl glass-effect p-0 custom-scrollbar max-h-[92vh] overflow-y-auto">
        <DialogHeader className="p-6 pb-4 bg-muted/40 border-b border-border/50 top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center shrink-0">
              <Activity className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-wide">
                {isEditing ? 'Editar Registro de Seguimiento' : 'Nuevo Registro de Seguimiento'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? 'Modifique los hallazgos o estado de la visita de seguimiento.'
                  : 'Registre la inspección de control y verificación de recomendaciones.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCheck className="size-3.5 text-primary" />
              Inspección de Origen <span className="text-rose-500">*</span>
            </label>
            {isEditing ? (
              <div className="p-3.5 bg-muted/30 rounded-xl border border-border text-sm font-bold flex items-center justify-between">
                <div>
                  <span className="text-primary">{seguimiento?.inspecciones?.n_control || `Inspección #${seguimiento?.inspeccion_id}`}</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    {seguimiento?.inspecciones?.planificaciones?.solicitudes?.propiedades?.nombre || 'Propiedad asociada'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por N° Control, propiedad o productor..."
                    value={inspSearch}
                    onChange={(e) => setInspSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/80 rounded-xl"
                  />
                </div>

                <Select value={inspeccionId} onValueChange={setInspeccionId}>
                  <SelectTrigger className="h-11 bg-background/80 border-border rounded-xl font-medium cursor-pointer">
                    <SelectValue placeholder="Seleccione Inspección a realizar seguimiento..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-60 border-border">
                    {filteredInspecciones.length === 0 ? (
                      <div className="p-4 text-xs text-center text-muted-foreground italic">
                        {inspSearch.trim()
                          ? `No se encontraron inspecciones elegibles que coincidan con "${inspSearch}"`
                          : 'No existen inspecciones en estado elegible para seguimiento (FINALIZADA, NO APROBADA, SEGUIMIENTO, CUARENTENA)'}
                      </div>
                    ) : (
                      filteredInspecciones.map((insp) => (
                        <SelectItem key={insp.id} value={String(insp.id)} className="cursor-pointer">
                          <div className="flex flex-col text-left py-0.5">
                            <span className="font-bold text-xs">{insp.n_control} — {insp.status}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {insp.planificaciones?.solicitudes?.propiedades?.nombre || 'Sin propiedad'} • {insp.planificaciones?.solicitudes?.clientes?.nombre || 'Sin productor'} ({insp.fecha_inspeccion ? new Date(insp.fecha_inspeccion).toLocaleDateString() : ''})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedInspeccionObj && (
              <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs space-y-1">
                <p className="font-bold text-primary flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {selectedInspeccionObj.planificaciones?.solicitudes?.propiedades?.nombre || 'Propiedad asociada'}
                </p>
                <p className="text-muted-foreground italic">
                  Aspectos constatados originalmente: {selectedInspeccionObj.aspectos_constatados || 'Sin registros'}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-indigo-500" />
                Fecha del Seguimiento <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={fechaSeguimiento}
                onChange={(e) => setFechaSeguimiento(e.target.value)}
                required
                className="h-11 bg-background/80 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-3.5 text-emerald-500" />
                Resultado / Estado Sanitario
              </label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-11 bg-background/80 border-border rounded-xl font-bold cursor-pointer">
                  <SelectValue placeholder="Estatus" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border">
                  <SelectItem value="EN_PROCESO" className="cursor-pointer text-indigo-600 font-bold">EN PROCESO / EN SEGUIMIENTO</SelectItem>
                  <SelectItem value="CUMPLIDO" className="cursor-pointer text-emerald-600 font-bold">CUMPLIDO / APROBADO</SelectItem>
                  <SelectItem value="CUARENTENA" className="cursor-pointer text-amber-600 font-bold">EN CUARENTENA (ANOMALÍAS)</SelectItem>
                  <SelectItem value="NO_CUMPLIDO" className="cursor-pointer text-rose-600 font-bold">NO CUMPLIDO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
            <div className="space-y-0.5">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className={`size-4 ${recomendacionesCumplidas ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                ¿Recomendaciones Cumplidas al 100%?
              </label>
              <p className="text-xs text-muted-foreground">
                Active este control si el productor subsanó todas las observaciones sanitarias.
              </p>
            </div>
            <Switch
              checked={recomendacionesCumplidas}
              onCheckedChange={(checked) => {
                setRecomendacionesCumplidas(checked);
                if (checked && status === 'EN_PROCESO') {
                  setStatus('CUMPLIDO');
                }
              }}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hallazgos de la Visita de Seguimiento <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="Describa detalladamente lo constatado durante la visita de seguimiento (condiciones de cultivo, salud animal, medidas aplicadas)..."
              value={hallazgos}
              onChange={(e) => setHallazgos(e.target.value)}
              rows={4}
              required
              className="bg-background/80 rounded-xl resize-none p-3.5 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UploadCloud className="size-3.5 text-blue-500" />
              Evidencias Fotográficas (Opcional)
            </label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="h-11 bg-background/80 rounded-xl cursor-pointer file:cursor-pointer text-xs"
            />
            {fotosFiles.length > 0 && (
              <p className="text-xs text-emerald-600 font-bold">
                {fotosFiles.length} foto(s) seleccionada(s) para cargar.
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 gap-6 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              title="Cancelar"
              className="cursor-pointer font-bold rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              title='Confirmar'
              disabled={isSubmitting || (!inspeccionId && !seguimiento?.inspeccion_id) || !hallazgos.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Activity className="size-4" />
                  {isEditing ? 'Guardar Cambios' : 'Registrar Seguimiento'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
