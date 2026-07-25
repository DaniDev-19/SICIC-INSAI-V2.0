import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropiedadInventario } from '@/hooks/use-propiedades-inventario';
import { useCultivos } from '@/hooks/use-cultivos';
import { useAnimales } from '@/hooks/use-animales';
import apiClient from '@/lib/api-client';
import { Leaf, PawPrint, Trash2, Plus, Loader2, Shield, FileText, Activity, Calendar, CheckCircle2, AlertTriangle, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
  tipo: string;
}

interface PropiedadInventarioProps {
  propiedadId: number;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function PropiedadInventario({ propiedadId }: PropiedadInventarioProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cultivos' | 'animales' | 'hierros' | 'solicitudes' | 'historial'>('cultivos');
  const [expandedInspId, setExpandedInspId] = useState<number | null>(null);

  const { inventario, isLoading, addCultivo, removeCultivo, addAnimal, removeAnimal, addHierro, removeHierro, isAddingCultivo, isAddingAnimal, isAddingHierro } = usePropiedadInventario(propiedadId);
  const { cultivos, setLimit: setCultivosLimit } = useCultivos();
  const { animales, setLimit: setAnimalesLimit } = useAnimales();

  const [solicitudesPropiedad, setSolicitudesPropiedad] = useState<any[]>([]);
  const [isLoadingSolicitudes, setIsLoadingSolicitudes] = useState(false);

  const [inspeccionesPropiedad, setInspeccionesPropiedad] = useState<any[]>([]);
  const [isLoadingInspecciones, setIsLoadingInspecciones] = useState(false);

  useEffect(() => {
    if (activeTab === 'solicitudes') {
      setIsLoadingSolicitudes(true);
      apiClient.get(`/solicitudes?propiedad_id=${propiedadId}&limit=100`)
        .then(res => {
          setSolicitudesPropiedad(res.data?.data || []);
        })
        .catch(err => {
          console.error("Error loading property requests:", err);
        })
        .finally(() => {
          setIsLoadingSolicitudes(false);
        });
    }

    if (activeTab === 'historial') {
      setIsLoadingInspecciones(true);
      apiClient.get(`/inspecciones?limit=100`)
        .then(res => {
          const all: any[] = res.data?.data || [];
          const filtered = all.filter(
            (i: any) => i.planificaciones?.solicitudes?.propiedades?.id === propiedadId || i.planificaciones?.solicitudes?.propiedad_id === propiedadId
          );
          setInspeccionesPropiedad(filtered);
        })
        .catch(err => {
          console.error("Error loading property inspections:", err);
        })
        .finally(() => {
          setIsLoadingInspecciones(false);
        });
    }
  }, [activeTab, propiedadId]);

  const [unidades, setUnidades] = useState<Unidad[]>([]);
  useEffect(() => {
    setCultivosLimit(100);
    setAnimalesLimit(100);
    apiClient.get('/t_unidades?limit=100').then(res => setUnidades(res.data?.data || []));
  }, []);

  const unidadesSuperficie = unidades.length > 0 ? unidades : [];
  const unidadesAnimales = unidades.length > 0 ? unidades : [];

  // Form states - Cultivo
  const [selectedCultivo, setSelectedCultivo] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [superficieUnidad, setSuperficieUnidad] = useState('');

  // Form states - Animales
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [cantidadAnimal, setCantidadAnimal] = useState('');
  const [animalUnidad, setAnimalUnidad] = useState('');
  const [observacionesAnimal, setObservacionesAnimal] = useState('');

  // Form states - Hierros
  const [numRegHierro, setNumRegHierro] = useState('');
  const [numRegGanadero, setNumRegGanadero] = useState('');
  const [hierroImgFile, setHierroImgFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleAddCultivo = async () => {
    if (!selectedCultivo) return;
    await addCultivo({
      cultivo_id: parseInt(selectedCultivo),
      superficie: superficie || null,
      superficie_unidad_id: superficieUnidad ? parseInt(superficieUnidad) : null,
    });
    setSelectedCultivo('');
    setSuperficie('');
  };

  const handleAddAnimal = async () => {
    if (!selectedAnimal || !cantidadAnimal) return;
    await addAnimal({
      animal_id: parseInt(selectedAnimal),
      cantidad: parseFloat(cantidadAnimal),
      cantidad_unidad_id: animalUnidad ? parseInt(animalUnidad) : (unidadesAnimales[0]?.id || null),
      observaciones: observacionesAnimal || null
    });
    setSelectedAnimal('');
    setCantidadAnimal('');
    setAnimalUnidad('');
    setObservacionesAnimal('');
  };

  const handleAddHierro = async () => {
    if (!numRegHierro && !numRegGanadero && !hierroImgFile) return;
    await addHierro({
      num_reg_hierro: numRegHierro,
      num_reg_ganadero: numRegGanadero,
      hierro_img: hierroImgFile || undefined
    });
    setNumRegHierro('');
    setNumRegGanadero('');
    setHierroImgFile(null);
    setFileInputKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/10 rounded-b-lg border-t border-border/50">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card border-x border-b border-border/50 shadow-inner rounded-b-xl overflow-hidden animate-in slide-in-from-top-2">
      {/* Tabs Header */}
      <div className="flex items-center gap-1 p-2 bg-muted/20 border-b border-border/50">
        <button
          title="Cultivos de la propiedad"
          onClick={() => setActiveTab('cultivos')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'cultivos'
            ? 'bg-emerald-500/10 text-emerald-600 shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
        >
          <Leaf className="size-4" />
          Cultivos ({inventario.cultivos?.length || 0})
        </button>
        <button
          title="Animales de la propiedad"
          onClick={() => setActiveTab('animales')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'animales'
            ? 'bg-amber-500/10 text-amber-600 shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
        >
          <PawPrint className="size-4" />
          Animales ({inventario.animales?.length || 0})
        </button>
        <button
          title="Hierros de la propiedad"
          onClick={() => setActiveTab('hierros')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'hierros'
            ? 'bg-blue-500/10 text-blue-600 shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
        >
          <Shield className="size-4" />
          Hierros ({inventario.hierros?.length || 0})
        </button>
        <button
          title="Trámites y solicitudes de la propiedad"
          onClick={() => setActiveTab('solicitudes')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'solicitudes'
            ? 'bg-indigo-500/10 text-indigo-600 shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
        >
          <FileText className="size-4" />
          Solicitudes
        </button>
        <button
          title="Historial de Inspecciones y Seguimientos de la propiedad"
          onClick={() => setActiveTab('historial')}
          className={`flex cursor-pointer items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'historial'
            ? 'bg-rose-500/10 text-rose-600 shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
        >
          <Activity className="size-4" />
          Inspecciones y Seguimientos
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">

        {/* ── CULTIVOS ── */}
        {activeTab === 'cultivos' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Especie Vegetal</label>
                <Select value={selectedCultivo} onValueChange={setSelectedCultivo}>
                  <SelectTrigger className="w-full bg-background rounded-xl border-border focus:bg-background transition-all cursor-pointer">
                    <SelectValue placeholder="Seleccione cultivo..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border rounded-2xl shadow-2xl max-h-[250px]" position="popper" sideOffset={2}>
                    {cultivos.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl cursor-pointer">
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-60 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Superficie</label>
                <Input type="number" step="0.01" placeholder="Ej: 10" value={superficie} onChange={e => setSuperficie(e.target.value)} className="bg-background w-full" />
              </div>
              <div className="w-48 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Unidad</label>
                <Select value={superficieUnidad} onValueChange={setSuperficieUnidad}>
                  <SelectTrigger className="bg-background w-full cursor-pointer">
                    <SelectValue placeholder="Seleccione unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesSuperficie.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()} className="cursor-pointer">{u.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!selectedCultivo || isAddingCultivo} onClick={handleAddCultivo} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 cursor-pointer">
                {isAddingCultivo ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Añadir
              </Button>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-bold">Cultivo</TableHead>
                      <TableHead className="font-bold">Familia / Tipo</TableHead>
                      <TableHead className="font-bold text-right">Superficie Sembrada</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!inventario.cultivos || inventario.cultivos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                          No hay cultivos registrados en esta propiedad
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventario.cultivos.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-foreground">{item.cultivo?.nombre}</TableCell>
                          <TableCell className="text-muted-foreground">{item.cultivo?.t_cultivo?.nombre || 'N/A'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.superficie ? `${item.superficie} ${item.superficie_unidad?.abreviatura || 'U'}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeCultivo(item.id)} className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANIMALES ── */}
        {activeTab === 'animales' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex items-end gap-4">
              <div className="w-1/4 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Especie / Tipo Animal</label>
                <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
                  <SelectTrigger className="bg-background w-full rounded-xl border-border focus:bg-background transition-all cursor-pointer">
                    <SelectValue placeholder="Seleccione animal..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border rounded-2xl shadow-2xl max-h-[250px]" position="popper" sideOffset={2}>
                    {animales.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()} className="rounded-xl cursor-pointer">
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Cantidad</label>
                <Input type="number" placeholder="Ej: 50" value={cantidadAnimal} onChange={e => setCantidadAnimal(e.target.value)} className="bg-background w-full" />
              </div>
              <div className="w-48 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Unidad</label>
                <Select value={animalUnidad} onValueChange={setAnimalUnidad}>
                  <SelectTrigger className="bg-background w-full cursor-pointer">
                    <SelectValue placeholder="Seleccione Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesAnimales.map(u => (
                      <SelectItem key={u.id} value={u.id.toString()} className="cursor-pointer">{u.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Observaciones</label>
                <Input placeholder="Lote, estado de salud..." value={observacionesAnimal} onChange={e => setObservacionesAnimal(e.target.value)} className="bg-background w-full" />
              </div>
              <Button disabled={!selectedAnimal || !cantidadAnimal || isAddingAnimal} onClick={handleAddAnimal} className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
                {isAddingAnimal ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Añadir
              </Button>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-bold">Especie Animal</TableHead>
                      <TableHead className="font-bold">Propósito / Dieta</TableHead>
                      <TableHead className="font-bold">Observaciones</TableHead>
                      <TableHead className="font-bold text-right">Cantidad</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!inventario.animales || inventario.animales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                          No hay animales registrados en esta propiedad
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventario.animales.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-foreground">{item.animal?.nombre}</TableCell>
                          <TableCell className="text-muted-foreground">{item.animal?.dieta || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{item.observaciones || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.cantidad} {item.cantidad_unidad?.abreviatura || ''}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeAnimal(item.id)} className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* ── HIERROS ── */}
        {activeTab === 'hierros' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-muted/10 border border-border/50 rounded-xl p-4 flex items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">N° Registro Hierro</label>
                <Input placeholder="Ej: HR-12345" value={numRegHierro} onChange={e => setNumRegHierro(e.target.value)} className="bg-background w-full" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">N° Registro Ganadero</label>
                <Input placeholder="Ej: RG-98765" value={numRegGanadero} onChange={e => setNumRegGanadero(e.target.value)} className="bg-background w-full" />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">Imagen del Hierro</label>
                <Input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={e => setHierroImgFile(e.target.files?.[0] || null)}
                  className="bg-background w-full cursor-pointer file:cursor-pointer"
                />
              </div>
              <Button
                disabled={(!numRegHierro && !numRegGanadero && !hierroImgFile) || isAddingHierro}
                onClick={handleAddHierro}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
              >
                {isAddingHierro ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Añadir
              </Button>
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="font-bold w-[80px]">Imagen</TableHead>
                      <TableHead className="font-bold">N° Reg. Hierro</TableHead>
                      <TableHead className="font-bold">N° Reg. Ganadero</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!inventario.hierros || inventario.hierros.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                          No hay hierros registrados en esta propiedad
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventario.hierros.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.hierro_img_url ? (
                              <img
                                src={resolveImageUrl(item.hierro_img_url)}
                                alt="Hierro"
                                onError={(e) => {
                                  console.error('Imagen no cargada. URL intentada:', (e.target as HTMLImageElement).src);
                                }}
                                className="h-10 w-10 object-contain rounded-md border border-border bg-muted/50"
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Sin imagen</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{item.num_reg_hierro || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">{item.num_reg_ganadero || 'N/A'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeHierro(item.id)} className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
        {/* ── SOLICITUDES ── */}
        {activeTab === 'solicitudes' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
              {isLoadingSolicitudes ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">Cargando solicitudes...</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="font-bold">Código</TableHead>
                        <TableHead className="font-bold">Trámite</TableHead>
                        <TableHead className="font-bold">Fecha</TableHead>
                        <TableHead className="font-bold">Prioridad</TableHead>
                        <TableHead className="font-bold">Estatus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudesPropiedad.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                            No hay solicitudes registradas para esta propiedad
                          </TableCell>
                        </TableRow>
                      ) : (
                        solicitudesPropiedad.map((item: any) => (
                          <TableRow key={item.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-bold text-primary text-xs">{item.codigo}</TableCell>
                            <TableCell className="font-medium text-foreground text-xs">{item.t_solicitud?.nombre || 'General'}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.prioridad === 'URGENTE' ? 'bg-rose-100 text-rose-700' :
                                  item.prioridad === 'ALTA' ? 'bg-amber-100 text-amber-700' :
                                    item.prioridad === 'MEDIA' ? 'bg-blue-100 text-blue-700' :
                                      'bg-slate-100 text-slate-700'
                                }`}>
                                {item.prioridad}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${['FINALIZADA', 'APROBADA'].includes(item.estatus) ? 'bg-emerald-100 text-emerald-700' :
                                  ['NO_APROBADA', 'RECHAZADA', 'CANCELADA'].includes(item.estatus) ? 'bg-rose-100 text-rose-700' :
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
              )}
            </div>
          </div>
        )}

        {/* ── HISTORIAL DE INSPECCIONES Y SEGUIMIENTOS ── */}
        {activeTab === 'historial' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
              {isLoadingInspecciones ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="size-6 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">Cargando historial sanitario de la propiedad...</p>
                </div>
              ) : (
                <div className="max-h-87.5 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader className="bg-muted/30 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead className="font-bold text-xs">N° Control</TableHead>
                        <TableHead className="font-bold text-xs">Fecha Inspección</TableHead>
                        <TableHead className="font-bold text-xs">Áreas Eval.</TableHead>
                        <TableHead className="font-bold text-xs">Estatus Inspección</TableHead>
                        <TableHead className="font-bold text-xs text-center">Visitas Seguimiento</TableHead>
                        <TableHead className="font-bold text-xs text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspeccionesPropiedad.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground italic">
                            No existen inspecciones registradas para esta propiedad
                          </TableCell>
                        </TableRow>
                      ) : (
                        inspeccionesPropiedad.map((insp: any) => {
                          const segs = insp.seguimiento_inspecciones || [];
                          const segsCount = segs.length;
                          const isExpanded = expandedInspId === insp.id;

                          return (
                            <React.Fragment key={insp.id}>
                              <TableRow
                                onClick={() => setExpandedInspId(isExpanded ? null : insp.id)}
                                className="hover:bg-muted/10 transition-colors cursor-pointer"
                              >
                                <TableCell className="w-10">
                                  {segsCount > 0 && (
                                    <Button variant="ghost" size="icon" className="size-6 p-0">
                                      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                    </Button>
                                  )}
                                </TableCell>
                                <TableCell className="font-bold text-primary text-xs">{insp.n_control}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {insp.fecha_inspeccion ? new Date(insp.fecha_inspeccion).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell className="text-xs max-w-xs truncate">
                                  {Array.isArray(insp.areas_inspeccion)
                                    ? insp.areas_inspeccion.join(', ')
                                    : insp.areas_inspeccion || 'General'}
                                </TableCell>
                                <TableCell className="text-xs">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    insp.status === 'FINALIZADA' ? 'bg-emerald-100 text-emerald-700' :
                                      insp.status === 'CUARENTENA' ? 'bg-rose-100 text-rose-700 font-black' :
                                        insp.status === 'SEGUIMIENTO' ? 'bg-indigo-100 text-indigo-700' :
                                          'bg-amber-100 text-amber-700'
                                    }`}>
                                    {insp.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted font-bold text-foreground border border-border">
                                    <Activity className="size-3 text-indigo-500" />
                                    {segsCount} seguimiento(s)
                                  </span>
                                </TableCell>
                                <TableCell className="text-right text-xs">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/home/seguimientos?inspeccion_id=${insp.id}&openModal=true`);
                                    }}
                                    className="h-7 text-[11px] font-bold gap-1 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer"
                                  >
                                    <Plus className="size-3" />
                                    Seguimiento
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {/* Subtabla de Seguimientos si está expandida */}
                              {isExpanded && (
                                <TableRow className="bg-muted/5 hover:bg-muted/5">
                                  <TableCell colSpan={7} className="p-4 pl-12">
                                    <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase text-indigo-600 flex items-center gap-1.5">
                                          <Activity className="size-3.5" />
                                          Historial de Visitas de Seguimiento para {insp.n_control}
                                        </h4>
                                      </div>

                                      {segs.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                          No hay visitas de seguimiento registradas aún para esta inspección.
                                        </p>
                                      ) : (
                                        <div className="space-y-2">
                                          {segs.map((seg: any) => (
                                            <div
                                              key={seg.id}
                                              className="p-3 bg-muted/20 rounded-lg border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                            >
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-foreground">
                                                    Visita del {seg.fecha_seguimiento ? new Date(seg.fecha_seguimiento).toLocaleDateString() : 'N/A'}
                                                  </span>
                                                  {seg.recomendaciones_cumplidas ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                                      Recomendaciones Cumplidas
                                                    </span>
                                                  ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                                      Recomendaciones Pendientes
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-muted-foreground text-[11px]">
                                                  {seg.hallazgos_seguimiento || 'Sin hallazgos detallados'}
                                                </p>
                                              </div>

                                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-muted text-muted-foreground border shrink-0 self-start sm:self-center">
                                                {seg.status || 'EN_PROCESO'}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
