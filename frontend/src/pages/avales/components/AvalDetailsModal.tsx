import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  Calendar,
  Building2,
  UserCheck,
  Stethoscope,
  Syringe,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Printer,
  Sparkles,
  Search,
} from 'lucide-react';
import type { AvalSanitario } from '@/types/avales';

interface AvalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aval: AvalSanitario | null;
}

export function AvalDetailsModal({ isOpen, onClose, aval }: AvalDetailsModalProps) {
  if (!aval) return null;

  const isVencido = aval.fecha_vencimiento
    ? new Date(aval.fecha_vencimiento) < new Date()
    : false;

  const bovBuf = aval.aval_hallazgos_bov_buf?.[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl mx-auto bg-background/95 backdrop-blur-xl border-border rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto p-8">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                <FileCheck className="size-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-black tracking-tight">
                    Aval Sanitario #{aval.numero_aval}
                  </DialogTitle>
                  <Badge
                    className={
                      isVencido
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 font-bold'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold'
                    }
                  >
                    {isVencido ? (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> VENCIDO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> VIGENTE
                      </span>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Certificación de Sanidad Animal e Inspección Ganadera
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl h-9 px-3 text-xs font-bold gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            >
              <Printer className="size-3.5" /> Imprimir Ficha
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
  
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/20 border border-border p-4 rounded-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Building2 className="size-3" /> Código de Predio / Finca
              </p>
              <p className="text-sm font-black font-mono mt-0.5 text-foreground">
                {aval.codigo_predio || 'NO REGISTRADO'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" /> Emisión / Vencimiento
              </p>
              <p className="text-xs font-bold mt-0.5">
                {aval.fecha_emision ? new Date(aval.fecha_emision).toLocaleDateString() : '-'}
                {' → '}
                <span className={isVencido ? 'text-rose-500' : 'text-emerald-500'}>
                  {aval.fecha_vencimiento ? new Date(aval.fecha_vencimiento).toLocaleDateString() : 'Sin vencimiento'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText className="size-3" /> Cert. Vacunación N°
              </p>
              <p className="text-sm font-semibold font-mono mt-0.5">
                {aval.certificado_vacunacion_n || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Stethoscope className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Médico Veterinario Responsable
                </p>
                <p className="text-sm font-bold text-foreground">
                  {aval.empleados_avales_sanitarios_medico_responsable_idToempleados
                    ? `${aval.empleados_avales_sanitarios_medico_responsable_idToempleados.nombre} ${aval.empleados_avales_sanitarios_medico_responsable_idToempleados.apellido}`
                    : 'No asignado'}
                </p>
                {aval.empleados_avales_sanitarios_medico_responsable_idToempleados?.cedula && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    C.I.: {aval.empleados_avales_sanitarios_medico_responsable_idToempleados.cedula}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <UserCheck className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Jefe de Oficina Sanitaria (OSA)
                </p>
                <p className="text-sm font-bold text-foreground">
                  {aval.empleados_avales_sanitarios_jefe_osa_idToempleados
                    ? `${aval.empleados_avales_sanitarios_jefe_osa_idToempleados.nombre} ${aval.empleados_avales_sanitarios_jefe_osa_idToempleados.apellido}`
                    : 'No asignado'}
                </p>
                {aval.empleados_avales_sanitarios_jefe_osa_idToempleados?.cedula && (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    C.I.: {aval.empleados_avales_sanitarios_jefe_osa_idToempleados.cedula}
                  </p>
                )}
              </div>
            </div>
          </div>

          {bovBuf && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" /> Inventario de Rebaño Bovino y Bufalino
                </h4>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-xs">
                  TOTAL: {bovBuf.total_bov_buf || 0} Cabezas
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Toros</p>
                  <p className="text-base font-black">{bovBuf.t_toros || 0}</p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Vacas</p>
                  <p className="text-base font-black">{bovBuf.t_vacas || 0}</p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Novillos / Novillas</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_novillos || 0) + (bovBuf.t_novillas || 0)}
                  </p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Becerros / Becerras</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_becerros || 0) + (bovBuf.t_becerras || 0)}
                  </p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Búfalos / Búfalas</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_bufalos || 0) + (bovBuf.t_bufalas || 0)}
                  </p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Buvillos / Buvillas</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_buvillos || 0) + (bovBuf.t_buvillas || 0)}
                  </p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Bumautes M/H</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_bumautes_m || 0) + (bovBuf.t_bumautes_h || 0)}
                  </p>
                </div>
                <div className="bg-card p-2.5 border border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground">Bucerros / Bucerras</p>
                  <p className="text-base font-black">
                    {(bovBuf.t_bucerros || 0) + (bovBuf.t_bucerras || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {aval.aval_hallazgos_otras && aval.aval_hallazgos_otras.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Otras Especies Registradas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aval.aval_hallazgos_otras.map((o, idx) => (
                  <div key={idx} className="bg-card p-3 border border-border rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">
                        {o.t_animales?.nombre || `Especie #${o.tipo_animal_id}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Machos: {o.machos} | Hembras: {o.hembras} | Crías: {o.crias}
                      </p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold">
                      {o.total} total
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aval.aval_biologicos && aval.aval_biologicos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Syringe className="size-3.5 text-blue-500" /> Biológicos y Vacunas Aplicadas
              </h4>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border">
                    <tr>
                      <th className="p-3">Insumo / Vacuna</th>
                      <th className="p-3">Fecha Vacunación</th>
                      <th className="p-3">Pruebas Diagnósticas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {aval.aval_biologicos.map((bio, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-foreground">
                          {bio.insumos?.nombre || `Insumo #${bio.insumo_id}`}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {bio.fecha_vacunacion
                            ? new Date(bio.fecha_vacunacion).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {bio.pruebas_diagnosticas || 'Ninguna'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {aval.aval_hierros && aval.aval_hierros.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Marcas / Hierros Ganaderos
              </h4>
              <div className="flex flex-wrap gap-3">
                {aval.aval_hierros.map((h, i) => (
                  <div
                    key={i}
                    className="size-24 rounded-xl border border-border bg-muted/20 overflow-hidden relative group"
                  >
                    <img
                      src={h.hierro_img_url}
                      alt={`Hierro ${i + 1}`}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <a
                      href={h.hierro_img_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Search className="size-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aval.observaciones && (
            <div className="bg-muted/30 border border-border p-4 rounded-xl text-xs space-y-1">
              <p className="font-bold text-muted-foreground uppercase text-[10px]">Observaciones del Aval</p>
              <p className="text-foreground leading-relaxed">{aval.observaciones}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            title="Cerrar"
            onClick={onClose}
            className="rounded-xl h-10 px-4 text-xs cursor-pointer"
          >
            <X className="size-4 mr-1.5" /> Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
