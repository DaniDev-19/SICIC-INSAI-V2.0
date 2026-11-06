import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  FileText,
  Loader2,
} from 'lucide-react';
import Can from '@/components/auth/Can';
import type { Seguimiento } from '@/types/seguimientos';

interface SeguimientoTableProps {
  seguimientos: Seguimiento[];
  onViewTimeline: (seguimiento: Seguimiento) => void;
  onEdit: (seguimiento: Seguimiento) => void;
  onDelete: (id: number) => void;
  onGenerateReport?: (id: number) => void;
  generatingReportId?: number | null;
}

export function SeguimientoTable({
  seguimientos,
  onViewTimeline,
  onEdit,
  onDelete,
  onGenerateReport,
  generatingReportId,
}: SeguimientoTableProps) {
  if (seguimientos.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={6} className="px-6 py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <Activity className="size-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-bold italic">
                  No se encontraron registros de seguimiento
                </p>
                <p className="text-xs text-muted-foreground">
                  Los registros de visitas de control epidemiológico aparecerán aquí.
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      {/* ── Vista Móvil / Tablet (< lg): Tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {seguimientos.map((seg) => {
          const insp = seg.inspecciones;
          const solic = insp?.planificaciones?.solicitudes;
          const propName = solic?.propiedades?.nombre || 'Propiedad no especificada';
          const prodName = solic?.clientes?.nombre || 'Productor no especificado';

          return (
            <article
              key={seg.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5 min-w-0 max-w-full overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="size-11 shrink-0 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Activity className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm sm:text-base truncate">
                      {insp?.n_control || `Inspección #${seg.inspeccion_id}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span className="text-primary font-bold truncate max-w-35 sm:max-w-none">
                        {propName}
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-30 sm:max-w-none">
                        {prodName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border">
                    {seg.status || 'EN_PROCESO'}
                  </span>
                  {seg.recomendaciones_cumplidas ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <CheckCircle2 className="size-2.5" />
                      CUMPLIDO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      <AlertTriangle className="size-2.5" />
                      PENDIENTE
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Calendar className="size-3.5 text-indigo-500 shrink-0" />
                  <span>
                    Fecha: {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString() : '—'}
                  </span>
                </div>

                {seg.seguimiento_fotos && seg.seguimiento_fotos.length > 0 && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ImageIcon className="size-3.5 text-indigo-600 shrink-0" />
                    <span className="font-bold text-indigo-600">
                      {seg.seguimiento_fotos.length} fotos adjuntas
                    </span>
                  </div>
                )}

                {seg.hallazgos_seguimiento && (
                  <p className="text-xs text-muted-foreground/90 italic font-medium col-span-1 sm:col-span-2 line-clamp-2 pt-0.5">
                    "{seg.hallazgos_seguimiento}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                {onGenerateReport && (
                  <Can screen="seguimientos" action="see">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={generatingReportId === seg.id}
                      onClick={() => onGenerateReport(seg.id)}
                      title="Generar Informe Técnico (PDF)"
                      className="size-8 rounded-lg cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 text-emerald-600/80"
                    >
                      {generatingReportId === seg.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                    </Button>
                  </Can>
                )}

                <Can screen="seguimientos" action="see">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewTimeline(seg)}
                    title="Ver Línea de Tiempo"
                    className="size-8 rounded-lg cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600"
                  >
                    <Eye className="size-4" />
                  </Button>
                </Can>

                <Can screen="seguimientos" action="update">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(seg)}
                    title="Editar Seguimiento"
                    className="size-8 rounded-lg cursor-pointer hover:bg-amber-500/10 hover:text-amber-600"
                  >
                    <Edit className="size-4" />
                  </Button>
                </Can>

                <Can screen="seguimientos" action="delete">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(seg.id)}
                    title="Eliminar Registro"
                    className="size-8 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </Can>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Vista Escritorio (>= lg): Tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Inspección / Propiedad
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Fecha Visita
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Hallazgos y Avances
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Recomendaciones
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Estatus Sanitario
              </TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-border/50">
            {seguimientos.map((seg) => {
              const insp = seg.inspecciones;
              const solic = insp?.planificaciones?.solicitudes;
              const propName = solic?.propiedades?.nombre || 'Propiedad no especificada';
              const prodName = solic?.clientes?.nombre || 'Productor no especificado';

              return (
                <TableRow
                  key={seg.id}
                  className="group hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                >
                  <TableCell className="px-6 py-5 max-w-70">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                        <Activity className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5 flex-1">
                        <span className="font-bold text-foreground block text-sm wrap-break-words whitespace-normal leading-tight" title={insp?.n_control || `Inspección #${seg.inspeccion_id}`}>
                          {insp?.n_control || `Inspección #${seg.inspeccion_id}`}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1 text-primary font-bold wrap-break-words whitespace-normal">
                            <Building2 className="size-3 shrink-0" />
                            {propName}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 wrap-break-words whitespace-normal">
                            <User className="size-3 shrink-0" />
                            {prodName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Calendar className="size-3.5 text-indigo-500" />
                      {seg.fecha_seguimiento
                        ? new Date(seg.fecha_seguimiento).toLocaleDateString()
                        : '-'}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 max-w-xs">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium">
                        {seg.hallazgos_seguimiento || 'Sin anotaciones adicionales.'}
                      </p>
                      {seg.seguimiento_fotos && seg.seguimiento_fotos.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          <ImageIcon className="size-3" />
                          {seg.seguimiento_fotos.length} fotos
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    {seg.recomendaciones_cumplidas ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="size-3.5" />
                        CUMPLIDAS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <AlertTriangle className="size-3.5" />
                        PENDIENTES
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border">
                      {seg.status || 'EN_PROCESO'}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onGenerateReport && (
                        <Can screen="seguimientos" action="see">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={generatingReportId === seg.id}
                            onClick={() => onGenerateReport(seg.id)}
                            title="Generar Informe Técnico (PDF)"
                            className="size-8 rounded-lg cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-600 text-emerald-600/80"
                          >
                            {generatingReportId === seg.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <FileText className="size-4" />
                            )}
                          </Button>
                        </Can>
                      )}

                      <Can screen="seguimientos" action="see">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onViewTimeline(seg)}
                          title="Ver Línea de Tiempo"
                          className="size-8 rounded-lg cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </Can>

                      <Can screen="seguimientos" action="update">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(seg)}
                          title="Editar Seguimiento"
                          className="size-8 rounded-lg cursor-pointer hover:bg-amber-500/10 hover:text-amber-600"
                        >
                          <Edit className="size-4" />
                        </Button>
                      </Can>

                      <Can screen="seguimientos" action="delete">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(seg.id)}
                          title="Eliminar Registro"
                          className="size-8 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </Can>
                    </div>
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
