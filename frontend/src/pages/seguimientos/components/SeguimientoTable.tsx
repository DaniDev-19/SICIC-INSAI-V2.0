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
} from 'lucide-react';
import Can from '@/components/auth/Can';
import type { Seguimiento } from '@/types/seguimientos';

interface SeguimientoTableProps {
  seguimientos: Seguimiento[];
  onViewTimeline: (seguimiento: Seguimiento) => void;
  onEdit: (seguimiento: Seguimiento) => void;
  onDelete: (id: number) => void;
}

export function SeguimientoTable({
  seguimientos,
  onViewTimeline,
  onEdit,
  onDelete,
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
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                    <Activity className="size-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-bold text-foreground block text-sm truncate">
                      {insp?.n_control || `Inspección #${seg.inspeccion_id}`}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1 text-primary font-bold">
                        <Building2 className="size-3" />
                        {propName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
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
  );
}
