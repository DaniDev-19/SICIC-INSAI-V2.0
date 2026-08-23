import type { Inspeccion } from '@/types/inspecciones';
import { formatHoraInspeccion } from '@/utils/inspeccion-time';
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  MapPin,
  FileText,
  Loader2,
  ClipboardList,
  Activity,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Can from '@/components/auth/Can';

interface InspeccionTableProps {
  inspecciones: Inspeccion[];
  onEdit: (inspeccion: Inspeccion) => void;
  onDelete: (id: number) => void;
  onView: (inspeccion: Inspeccion) => void;
  onPhotos?: (inspeccion: Inspeccion) => void;
  onPdf: (id: number) => void;
  onSeguimiento?: (inspeccion: Inspeccion) => void;
  onAval?: (inspeccion: Inspeccion) => void;
  onStatusChange?: (id: number, status: string) => void;
  pdfLoadingId?: number | null;
  isUpdatingStatus?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSeguimiento?: boolean;
  canAval?: boolean;
}

const STATUSES_SEGUIMIENTO = ['FINALIZADA', 'NO_APROBADA', 'SEGUIMIENTO', 'CUARENTENA'];
const STATUSES_AVAL = ['FINALIZADA', 'SEGUIMIENTO', 'CUARENTENA'];
const AREA_ANIMAL = 'Salud Animal Integral';

export function isEligibleSeguimiento(inspeccion?: Inspeccion | null): boolean {
  if (!inspeccion?.status) return false;
  return STATUSES_SEGUIMIENTO.includes(inspeccion.status);
}

export function isEligibleAval(inspeccion: Inspeccion): boolean {
  if (!STATUSES_AVAL.includes(inspeccion.status)) return false;
  if (!inspeccion.areas_inspeccion || !Array.isArray(inspeccion.areas_inspeccion)) return false;
  return inspeccion.areas_inspeccion.includes(AREA_ANIMAL);
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: 'PENDIENTE', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' },
  INSPECCIONANDO: { label: 'INSPECCIONANDO', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  FINALIZADA: { label: 'FINALIZADA', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  NO_APROBADA: { label: 'NO APROBADA', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  SEGUIMIENTO: { label: 'SEGUIMIENTO', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  CUARENTENA: { label: 'CUARENTENA', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  NO_ATENDIDA: { label: 'NO ATENDIDA', color: 'bg-stone-500/10 text-stone-600 border-stone-500/20' },
};

function getStatus(inspeccion: Inspeccion) {
  return STATUS_CONFIG[inspeccion.status] || {
    label: inspeccion.status,
    color: 'bg-muted text-muted-foreground border-border',
  };
}

function InspeccionActions({
  inspeccion,
  onView,
  onPhotos,
  onPdf,
  onEdit,
  onDelete,
  onSeguimiento,
  onAval,
  pdfLoadingId,
  canEdit,
  canDelete,
  className,
}: {
  inspeccion: Inspeccion;
  onView: (i: Inspeccion) => void;
  onPhotos?: (i: Inspeccion) => void;
  onPdf: (id: number) => void;
  onEdit: (i: Inspeccion) => void;
  onDelete: (id: number) => void;
  onSeguimiento?: (i: Inspeccion) => void;
  onAval?: (i: Inspeccion) => void;
  pdfLoadingId: number | null;
  canEdit: boolean;
  canDelete: boolean;
  className?: string;
}) {
  const showSeguimiento = isEligibleSeguimiento(inspeccion) && !!onSeguimiento;
  const showAval = isEligibleAval(inspeccion) && !!onAval;
  const photoCount = inspeccion.inspeccion_fotos?.length ?? 0;

  return (
    <div className={cn('flex items-center gap-1 sm:gap-1.5', className)}>
      <Can screen="inspecciones" action="see">
        <Button
          variant="ghost"
          size="icon"
          title="Ver detalles"
          onClick={() => onView(inspeccion)}
          className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
        >
          <Eye className="size-4" />
        </Button>
      </Can>
      {onPhotos && (
        <Can screen="inspecciones" action="see">
          <Button
            variant="ghost"
            size="icon"
            title="Ver / Editar Fotografías"
            onClick={() => onPhotos(inspeccion)}
            className="size-9 rounded-lg hover:bg-purple-500/10 hover:text-purple-600 cursor-pointer relative"
          >
            <ImageIcon className="size-4 text-purple-600" />
            {photoCount > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center border border-background">
                {photoCount}
              </span>
            )}
          </Button>
        </Can>
      )}
      <Can screen="inspecciones" action="see">
        <Button
          variant="ghost"
          size="icon"
          title="Acta PDF"
          disabled={pdfLoadingId !== null}
          onClick={() => onPdf(inspeccion.id)}
          className="size-9 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer disabled:opacity-50"
        >
          {pdfLoadingId === inspeccion.id ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
        </Button>
      </Can>

      {showSeguimiento && (
        <Can screen="seguimientos" action="create">
          <Button
            variant="ghost"
            size="icon"
            title="Crear Seguimiento de Inspección"
            onClick={() => onSeguimiento(inspeccion)}
            className="size-9 rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 cursor-pointer border border-indigo-500/30"
          >
            <Activity className="size-4" />
          </Button>
        </Can>
      )}

      {showAval && (
        <Can screen="avales" action="create">
          <Button
            variant="ghost"
            size="icon"
            title="Emitir Aval Sanitario (Salud Animal)"
            onClick={() => onAval(inspeccion)}
            className="size-9 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 cursor-pointer border border-amber-500/30"
          >
            <ShieldCheck className="size-4" />
          </Button>
        </Can>
      )}

      {canEdit && (
        <Can screen="inspecciones" action="update">
          <Button
            variant="ghost"
            size="icon"
            title={inspeccion.status === 'FINALIZADA' ? 'Inspección finalizada (Cerrada definitivamente - Solo lectura)' : 'Editar'}
            disabled={inspeccion.status === 'FINALIZADA'}
            onClick={() => onEdit(inspeccion)}
            className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Edit className="size-4" />
          </Button>
        </Can>
      )}
      {canDelete && (
        <Can screen="inspecciones" action="delete">
          <Button
            variant="ghost"
            size="icon"
            title={inspeccion.status === 'FINALIZADA' ? 'No se puede eliminar una inspección finalizada y cerrada' : 'Eliminar'}
            disabled={inspeccion.status === 'FINALIZADA'}
            onClick={() => onDelete(inspeccion.id)}
            className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="size-4" />
          </Button>
        </Can>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 sm:size-20 rounded-2xl bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <ClipboardList className="size-8 sm:size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-bold text-foreground text-base sm:text-lg">
          No se encontraron inspecciones registradas
        </p>
        <p className="text-sm text-muted-foreground">
          Registra la primera inspección con el botón «Nueva Inspección» o ajusta los filtros de búsqueda.
        </p>
      </div>
    </div>
  );
}

export function InspeccionTable({
  inspecciones,
  onEdit,
  onDelete,
  onView,
  onPhotos,
  onPdf,
  onSeguimiento,
  onAval,
  onStatusChange,
  pdfLoadingId = null,
  isUpdatingStatus = false,
  canEdit = false,
  canDelete = false,
}: InspeccionTableProps) {
  if (inspecciones.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {inspecciones.map((inspeccion) => {
          const status = getStatus(inspeccion);
          const solic = inspeccion.planificaciones?.solicitudes;
          const eligibleSeguimiento = isEligibleSeguimiento(inspeccion);
          const eligibleAval = isEligibleAval(inspeccion);

          return (
            <article
              key={inspeccion.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Eye className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">{inspeccion.n_control}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                      Form: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {canEdit && onStatusChange && inspeccion.status !== 'FINALIZADA' ? (
                    <Select
                      value={inspeccion.status}
                      onValueChange={(val) => onStatusChange(inspeccion.id, val)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-auto py-0.5 px-2 rounded-lg text-[10px] font-black border cursor-pointer w-auto gap-1 border-primary/20 shadow-2xs hover:opacity-85 transition-opacity',
                          status.color
                        )}
                      >
                        <SelectValue>{status.label}</SelectValue>
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-black uppercase tracking-wider">Cambiar Estatus</SelectLabel>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="text-xs font-bold cursor-pointer">
                              <span className={cn('inline-block size-2 rounded-full mr-1.5', config.color.split(' ')[0])} />
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border',
                        status.color
                      )}
                    >
                      {status.label}
                    </span>
                  )}
                  {eligibleSeguimiento && onSeguimiento && (
                    <Can screen="seguimientos" action="create">
                      <button
                        type="button"
                        onClick={() => onSeguimiento(inspeccion)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer"
                      >
                        <Activity className="size-2.5" /> Seguimiento
                      </button>
                    </Can>
                  )}
                  {eligibleAval && onAval && (
                    <Can screen="avales" action="create">
                      <button
                        type="button"
                        onClick={() => onAval(inspeccion)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer"
                      >
                        <ShieldCheck className="size-2.5" /> Aval Sanitario
                      </button>
                    </Can>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                <div className="flex items-center gap-2 min-w-0 text-foreground font-medium">
                  <User className="size-4 text-primary shrink-0" />
                  <span className="truncate">{solic?.clientes?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{solic?.propiedades?.nombre || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span>{new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-VE')}</span>
                  {inspeccion.hora_inspeccion && (
                    <span className="text-muted-foreground text-xs">
                      · {formatHoraInspeccion(inspeccion.hora_inspeccion)}
                    </span>
                  )}
                </div>
              </div>

              <InspeccionActions
                inspeccion={inspeccion}
                onView={onView}
                onPhotos={onPhotos}
                onPdf={onPdf}
                onEdit={onEdit}
                onDelete={onDelete}
                onSeguimiento={onSeguimiento}
                onAval={onAval}
                pdfLoadingId={pdfLoadingId}
                canEdit={canEdit}
                canDelete={canDelete}
                className="justify-end pt-1 border-t border-border/40"
              />
            </article>
          );
        })}
      </div>

      <div className="hidden lg:block rounded-2xl border border-border/50 bg-background/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Inspección / Control
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Productor y Predio
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Fecha / Hora
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Estatus / Derivaciones
              </TableHead>
              <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {inspecciones.map((inspeccion) => {
              const status = getStatus(inspeccion);
              const solic = inspeccion.planificaciones?.solicitudes;
              const eligibleSeguimiento = isEligibleSeguimiento(inspeccion);
              const eligibleAval = isEligibleAval(inspeccion);

              return (
                <TableRow
                  key={inspeccion.id}
                  className="group transition-colors hover:bg-primary/5"
                >
                  <TableCell className="px-6 py-4 max-w-60">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Eye className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-foreground block wrap-break-words whitespace-normal leading-snug" title={inspeccion.n_control}>
                          {inspeccion.n_control}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest block mt-0.5 break-all whitespace-normal leading-tight" title={inspeccion.t_codigo || '10-00-M00-P00-F01'}>
                          Form: {inspeccion.t_codigo || '10-00-M00-P00-F01'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 max-w-65">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-start gap-1.5 text-xs text-foreground font-bold min-w-0">
                        <User className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="wrap-break-words whitespace-normal leading-snug" title={solic?.clientes?.nombre || ''}>
                          {solic?.clientes?.nombre || '—'}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium min-w-0">
                        <MapPin className="size-3.5 shrink-0 mt-0.5" />
                        <span className="wrap-break-words whitespace-normal leading-snug" title={solic?.propiedades?.nombre || ''}>
                          {solic?.propiedades?.nombre || '—'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <Calendar className="size-3.5 text-primary shrink-0" />
                        <span>{new Date(inspeccion.fecha_inspeccion).toLocaleDateString('es-VE')}</span>
                      </div>
                      {inspeccion.hora_inspeccion && (
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block pl-5">
                          {formatHoraInspeccion(inspeccion.hora_inspeccion)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      {canEdit && onStatusChange && inspeccion.status !== 'FINALIZADA' ? (
                        <Select
                          value={inspeccion.status}
                          onValueChange={(val) => onStatusChange(inspeccion.id, val)}
                          disabled={isUpdatingStatus}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-auto py-1 px-2.5 rounded-lg text-[11px] font-black border cursor-pointer w-auto gap-1.5 border-primary/20 shadow-2xs hover:opacity-85 transition-opacity',
                              status.color
                            )}
                          >
                            <SelectValue>{status.label}</SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black uppercase tracking-wider">Cambiar Estatus</SelectLabel>
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key} className="text-xs font-bold cursor-pointer">
                                  <span className={cn('inline-block size-2 rounded-full mr-2', config.color.split(' ')[0])} />
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border',
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-1">
                        {eligibleSeguimiento && onSeguimiento && (
                          <Can screen="seguimientos" action="create">
                            <button
                              type="button"
                              onClick={() => onSeguimiento(inspeccion)}
                              title="Crear seguimiento de esta inspección"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer shadow-2xs"
                            >
                              <Activity className="size-3" /> +Seguimiento
                            </button>
                          </Can>
                        )}
                        {eligibleAval && onAval && (
                          <Can screen="avales" action="create">
                            <button
                              type="button"
                              onClick={() => onAval(inspeccion)}
                              title="Emitir aval sanitario (Área Salud Animal)"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer shadow-2xs"
                            >
                              <ShieldCheck className="size-3" /> +Aval Sanitario
                            </button>
                          </Can>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <InspeccionActions
                      inspeccion={inspeccion}
                      onView={onView}
                      onPhotos={onPhotos}
                      onPdf={onPdf}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onSeguimiento={onSeguimiento}
                      onAval={onAval}
                      pdfLoadingId={pdfLoadingId}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      className="justify-end"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
