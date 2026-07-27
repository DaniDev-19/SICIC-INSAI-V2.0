import { useQuery } from '@tanstack/react-query';
import { clientesService } from '@/services/clientes.service';
import type { Cliente } from '@/types/clientes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, User, Fingerprint, Phone, Mail, MapPin, Building2, ShieldCheck, Home } from 'lucide-react';

interface ProducerDetallesModalProps {
  isOpen: boolean;
  onClose: () => void;
  producerId: number | null;
}

export function ProducerDetallesModal({
  isOpen,
  onClose,
  producerId,
}: ProducerDetallesModalProps) {
  const { data: producerResp, isLoading } = useQuery({
    queryKey: ['cliente-detail', producerId],
    queryFn: () => clientesService.getById(producerId!),
    enabled: !!producerId && isOpen,
  });

  const producer: Cliente | undefined = producerResp?.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl glass-effect border-primary/20 p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="bg-muted/30 p-6 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
              <User className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                Ficha Técnica del Productor
              </DialogTitle>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Detalles de registro e historial del cliente institucional
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
              Cargando información...
            </p>
          </div>
        ) : !producer ? (
          <div className="p-12 text-center text-muted-foreground font-medium">
            No se pudo obtener la información del productor.
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Header del Productor */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 gap-4">
              <div>
                <h3 className="text-lg font-black text-foreground">{producer.nombre}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                    <Fingerprint className="size-3.5" />
                    V/J-{producer.cedula_rif}
                  </span>
                  {producer.codigo_runsai && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      <ShieldCheck className="size-3.5" />
                      RUNSAI: {producer.codigo_runsai}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-500/20 text-xs font-black">
                {producer.propiedades?.length || 0} PREDIOS REGISTRADOS
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" /> Datos de Contacto y Dirección
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Phone className="size-3 text-primary" /> Teléfono Principal
                  </p>
                  <p className="text-sm font-semibold text-foreground">{producer.telefono || 'No registrado'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3 text-primary" /> Correo Electrónico
                  </p>
                  <p className="text-sm font-semibold text-foreground">{producer.email || 'No registrado'}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40 space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-primary" /> Dirección Fiscal
                </p>
                <p className="text-sm font-medium text-foreground">{producer.direccion_fiscal || 'No registrada'}</p>
              </div>
            </div>

            {/* Representante Legal (si aplica) */}
            {(producer.representante_legal || producer.cedula_representante) && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-4 text-primary" /> Representante Legal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Representante</p>
                    <p className="text-sm font-semibold text-foreground">{producer.representante_legal || 'N/A'}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-muted/10 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Cédula Representante</p>
                    <p className="text-sm font-semibold text-foreground">{producer.cedula_representante || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Predios / Propiedades Asociadas */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Home className="size-4 text-primary" /> Predios Asociados ({producer.propiedades?.length || 0})
              </h4>
              {producer.propiedades && producer.propiedades.length > 0 ? (
                <div className="space-y-3">
                  {producer.propiedades.map((p: any) => {
                    const sec = p.propiedad_ubicacion?.[0]?.sectores;
                    const locationStr = [
                      sec?.parroquias?.municipios?.estados?.nombre,
                      sec?.parroquias?.municipios?.nombre,
                      sec?.parroquias?.nombre,
                      sec?.nombre
                    ].filter(Boolean).join(', ') || 'Sin ubicación registrada';

                    const cultivosCount = p.propiedad_cultivo?.length || 0;
                    const animalesCount = p.propiedad_animales?.length || 0;
                    const hierrosCount = p.propiedad_hierro?.length || 0;

                    return (
                      <div key={p.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">{p.nombre}</p>
                            <p className="text-[11px] text-muted-foreground font-medium">INSAI: {p.codigo_insai || 'Sin Código'}</p>
                            <p className="text-[11px] text-muted-foreground/80 mt-0.5">{locationStr}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              {p.hectareas_totales || 0} Ha
                            </span>
                          </div>
                        </div>

                        {/* Badges de Rubros */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30 text-[10px]">
                          <span className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-500/20">
                            {cultivosCount} Cultivo(s)
                          </span>
                          <span className="bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-md font-bold border border-amber-500/20">
                            {animalesCount} Animal(es)
                          </span>
                          <span className="bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-md font-bold border border-blue-500/20">
                            {hierrosCount} Hierro(s)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic bg-muted/10 p-4 rounded-xl text-center">
                  Este productor no tiene predios asociados actualmente.
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
