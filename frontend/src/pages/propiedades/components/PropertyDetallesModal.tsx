import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propiedadesService } from '@/services/propiedades.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Home,
  User,
  MapPin,
  Scale,
  Layers,
  Tag,
  ExternalLink,
  Leaf,
  PawPrint,
  Shield,
  FileText,
  Building2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PropertyDetallesModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number | null;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function PropertyDetallesModal({
  isOpen,
  onClose,
  propertyId,
}: PropertyDetallesModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'cultivos' | 'animales' | 'hierros' | 'solicitudes'>('general');

  const { data: propertyResp, isLoading } = useQuery({
    queryKey: ['propiedad-detail', propertyId],
    queryFn: () => propiedadesService.getById(propertyId!),
    enabled: !!propertyId && isOpen,
  });

  const propiedad: any = propertyResp?.data;

  const ubicacion = propiedad?.propiedad_ubicacion?.[0];
  const sectorObj = ubicacion?.sectores;
  const parroquiaObj = sectorObj?.parroquias;
  const municipioObj = parroquiaObj?.municipios;
  const estadoObj = municipioObj?.estados;

  const cultivos = propiedad?.propiedad_cultivo || [];
  const animales = propiedad?.propiedad_animales || [];
  const hierros = propiedad?.propiedad_hierro || [];
  const solicitudes = propiedad?.solicitudes || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-3xl glass-effect border-primary/20 p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[min(92vh,56rem)]">
        <DialogHeader className="bg-muted/30 p-6 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
                <Home className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                  Ficha Técnica Integral del Predio
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Ubicación geográfica, titularidad, rubros productivos y trámites asociados
                </p>
              </div>
            </div>
            {propiedad && (
              <button
                type="button"
                onClick={() => propiedadesService.openFichaPdf(propiedad.id)}
                className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md cursor-pointer mr-6"
              >
                <FileText className="size-4" /> Ficha PDF
              </button>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
              Cargando expediente completo...
            </p>
          </div>
        ) : !propiedad ? (
          <div className="p-12 text-center text-muted-foreground font-medium">
            No se pudo obtener la información de la propiedad.
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header info fija */}
            <div className="p-6 border-b border-border/40 bg-muted/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-foreground">{propiedad.nombre}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {propiedad.codigo_insai ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                        <Tag className="size-3.5" />
                        INSAI: {propiedad.codigo_insai}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium italic">Sin Código INSAI</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-muted px-2.5 py-0.5 rounded-lg border border-border text-muted-foreground">
                      <Layers className="size-3.5" />
                      {propiedad.t_propiedad?.nombre || 'General'}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase ${propiedad.status === 'ACTIVA' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                  {propiedad.status?.replace(/_/g, ' ') || 'ACTIVA'}
                </div>
              </div>

              {/* Selector de pestañas */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'general' ? 'bg-primary text-white shadow-md' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <Building2 className="size-3.5" /> General y Ubicación
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cultivos')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'cultivos' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  }`}
                >
                  <Leaf className="size-3.5" /> Cultivos ({cultivos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('animales')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'animales' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                  }`}
                >
                  <PawPrint className="size-3.5" /> Animales ({animales.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hierros')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'hierros' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                  }`}
                >
                  <Shield className="size-3.5" /> Hierros ({hierros.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('solicitudes')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'solicitudes' ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'
                  }`}
                >
                  <FileText className="size-3.5" /> Solicitudes ({solicitudes.length})
                </button>
              </div>
            </div>

            {/* Contenido de la Pestaña Activa */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              {/* TAB GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Titular */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="size-4 text-primary" /> Productor / Titular
                    </h4>
                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{propiedad.clientes?.nombre || 'Sin Productor Registrado'}</p>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">Cédula/RIF: V/J-{propiedad.clientes?.cedula_rif || 'N/A'}</p>
                      </div>
                      {propiedad.clientes?.codigo_runsai && (
                        <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-xl border border-primary/20">
                          RUNSAI: {propiedad.clientes.codigo_runsai}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ubicación Geográfica */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="size-4 text-rose-500" /> Ubicación Geográfica Jerárquica
                    </h4>
                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 rounded-xl bg-background/60 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Estado</p>
                          <p className="text-xs font-bold text-foreground">{estadoObj?.nombre || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-background/60 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Municipio</p>
                          <p className="text-xs font-bold text-foreground">{municipioObj?.nombre || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-background/60 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Parroquia</p>
                          <p className="text-xs font-bold text-foreground">{parroquiaObj?.nombre || 'N/A'}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-background/60 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Sector</p>
                          <p className="text-xs font-bold text-foreground">{sectorObj?.nombre || 'N/A'}</p>
                        </div>
                      </div>

                      {propiedad.punto_referencia && (
                        <div className="p-3 rounded-xl bg-background/40 border border-border/30">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Punto de Referencia</p>
                          <p className="text-xs font-medium text-foreground">{propiedad.punto_referencia}</p>
                        </div>
                      )}

                      {ubicacion?.google_maps_url && (
                        <div>
                          <a
                            href={ubicacion.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                          >
                            <ExternalLink className="size-3.5" /> Ver en Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dimensiones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Scale className="size-4 text-emerald-500" /> Dimensiones de la Propiedad
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Hectáreas Totales</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{propiedad.hectareas_totales || 0} Ha</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center">
                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Hectáreas Usables</p>
                        <p className="text-2xl font-black text-indigo-700 mt-1">{propiedad.hectareas_usables || 0} Ha</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CULTIVOS */}
              {activeTab === 'cultivos' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <Leaf className="size-4" /> Inventario Agrícola y Cultivos Sembrados
                    </h4>
                    <span className="text-xs font-bold text-muted-foreground">{cultivos.length} Registros</span>
                  </div>

                  <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-bold text-xs uppercase">Especie Vegetal / Cultivo</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Familia / Tipo</TableHead>
                          <TableHead className="font-bold text-xs uppercase text-right">Superficie Sembrada</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cultivos.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                              No hay cultivos registrados en esta propiedad
                            </TableCell>
                          </TableRow>
                        ) : (
                          cultivos.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-bold text-foreground text-xs">{item.cultivo?.nombre || 'N/A'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.cultivo?.t_cultivo?.nombre || 'General'}</TableCell>
                              <TableCell className="text-right font-black text-emerald-600 text-xs">
                                {item.superficie ? `${item.superficie} ${item.t_unidades_propiedad_cultivo_cantidad_unidad_idTot_unidades?.abreviatura || 'Ha'}` : '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB ANIMALES */}
              {activeTab === 'animales' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                      <PawPrint className="size-4" /> Inventario Pecuario y Ganado
                    </h4>
                    <span className="text-xs font-bold text-muted-foreground">{animales.length} Registros</span>
                  </div>

                  <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-bold text-xs uppercase">Especie Animal</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Dieta / Propósito</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Observaciones</TableHead>
                          <TableHead className="font-bold text-xs uppercase text-right">Cantidad</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {animales.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                              No hay animales registrados en esta propiedad
                            </TableCell>
                          </TableRow>
                        ) : (
                          animales.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-bold text-foreground text-xs">{item.animales?.nombre || 'N/A'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.animales?.dieta || 'N/A'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.observaciones || '-'}</TableCell>
                              <TableCell className="text-right font-black text-amber-600 text-xs">
                                {item.cantidad} {item.t_unidades?.abreviatura || 'Cabezas'}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB HIERROS */}
              {activeTab === 'hierros' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                      <Shield className="size-4" /> Registro de Hierros y Marca de Ganado
                    </h4>
                    <span className="text-xs font-bold text-muted-foreground">{hierros.length} Registros</span>
                  </div>

                  <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-bold text-xs uppercase w-16">Imagen</TableHead>
                          <TableHead className="font-bold text-xs uppercase">N° Reg. Hierro</TableHead>
                          <TableHead className="font-bold text-xs uppercase">N° Reg. Ganadero</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hierros.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">
                              No hay marcas de hierro registradas en esta propiedad
                            </TableCell>
                          </TableRow>
                        ) : (
                          hierros.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.hierro_img_url ? (
                                  <img
                                    src={resolveImageUrl(item.hierro_img_url)}
                                    alt="Hierro"
                                    className="size-10 object-contain rounded-lg border border-border bg-muted/30"
                                  />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">Sin Foto</span>
                                )}
                              </TableCell>
                              <TableCell className="font-bold text-foreground text-xs">{item.num_reg_hierro || 'N/A'}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{item.num_reg_ganadero || 'N/A'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB SOLICITUDES */}
              {activeTab === 'solicitudes' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <FileText className="size-4" /> Histórico de Solicitudes y Trámites
                    </h4>
                    <span className="text-xs font-bold text-muted-foreground">{solicitudes.length} Registros</span>
                  </div>

                  <div className="border border-border/50 rounded-2xl overflow-hidden bg-background">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-bold text-xs uppercase">Código</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Trámite</TableHead>
                          <TableHead className="font-bold text-xs uppercase">Prioridad</TableHead>
                          <TableHead className="font-bold text-xs uppercase text-right">Estatus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {solicitudes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                              No hay trámites registrados para esta propiedad
                            </TableCell>
                          </TableRow>
                        ) : (
                          solicitudes.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-black text-primary text-xs">{item.codigo}</TableCell>
                              <TableCell className="font-medium text-foreground text-xs">{item.t_solicitud?.nombre || 'Trámite General'}</TableCell>
                              <TableCell className="text-xs">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.prioridad === 'URGENTE' ? 'bg-rose-100 text-rose-700' :
                                    item.prioridad === 'ALTA' ? 'bg-amber-100 text-amber-700' :
                                      'bg-blue-100 text-blue-700'
                                }`}>
                                  {item.prioridad}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ['FINALIZADA', 'APROBADA'].includes(item.estatus) ? 'bg-emerald-100 text-emerald-700' :
                                    ['RECHAZADA', 'CANCELADA'].includes(item.estatus) ? 'bg-rose-100 text-rose-700' :
                                      'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.estatus?.replace(/_/g, ' ')}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
