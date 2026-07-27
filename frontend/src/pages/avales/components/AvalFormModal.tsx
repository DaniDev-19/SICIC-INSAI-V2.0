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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileCheck,
  Loader2,
  Building2,
  Stethoscope,
  UserCheck,
  Syringe,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useInspecciones } from '@/hooks/use-inspecciones';
import { useEmpleados } from '@/hooks/use-empleados';
import { useInventario } from '@/hooks/use-inventario';
import { useOficinas } from '@/hooks/use-oficinas';
import { useAnimales } from '@/hooks/use-animales';
import type {
  AvalSanitario,
  CreateAvalDTO,
  AvalHallazgosBovBuf,
  AvalHallazgosOtras,
} from '@/types/avales';

interface AvalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  aval: AvalSanitario | null;
  initialInspeccionId?: number | null;
  onSave: (dto: CreateAvalDTO) => Promise<void>;
  isSaving?: boolean;
}

const STATUSES_AVAL = ['FINALIZADA', 'SEGUIMIENTO', 'CUARENTENA'];
const AREA_ANIMAL = 'Salud Animal Integral';

export function AvalFormModal({
  isOpen,
  onClose,
  aval,
  initialInspeccionId,
  onSave,
  isSaving = false,
}: AvalFormModalProps) {
  const { inspecciones } = useInspecciones();
  const { empleados } = useEmpleados();
  const { insumos } = useInventario();
  const { oficinas } = useOficinas();
  const { tipos: tiposAnimales } = useAnimales();

  const [activeTab, setActiveTab] = useState('generales');

  const [numeroAval, setNumeroAval] = useState('');
  const [codigoPredio, setCodigoPredio] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [certificadoVacunacionN, setCertificadoVacunacionN] = useState('');
  const [inspeccionId, setInspeccionId] = useState<string>('none');
  const [medicoResponsableId, setMedicoResponsableId] = useState<string>('none');
  const [jefeOsaId, setJefeOsaId] = useState<string>('none');
  const [observaciones, setObservaciones] = useState('');

  const [bovBuf, setBovBuf] = useState<AvalHallazgosBovBuf>({
    t_toros: 0,
    t_vacas: 0,
    t_novillos: 0,
    t_novillas: 0,
    t_mautes_m: 0,
    t_mautes_h: 0,
    t_becerros: 0,
    t_becerras: 0,
    t_bufalos: 0,
    t_bufalas: 0,
    t_buvillos: 0,
    t_buvillas: 0,
    t_bumautes_m: 0,
    t_bumautes_h: 0,
    t_bucerros: 0,
    t_bucerras: 0,
  });

  const [otrasEspecies, setOtrasEspecies] = useState<AvalHallazgosOtras[]>([]);

  const [biologicos, setBiologicos] = useState<
    {
      insumo_id: number;
      oficina_id: number;
      cantidad: number;
      lote?: string;
      fecha_vacunacion?: string;
      pruebas_diagnosticas?: string;
    }[]
  >([]);

  const [hierros, setHierros] = useState<File[]>([]);
  const [hierroPreviews, setHierroPreviews] = useState<string[]>([]);

  const inspeccionesElegibles = inspecciones.filter((insp) => {
    const isSelected = initialInspeccionId === insp.id || aval?.inspeccion_id === insp.id;
    if (isSelected) return true;
    if (!insp.status || !STATUSES_AVAL.includes(insp.status)) return false;
    if (!insp.areas_inspeccion || !Array.isArray(insp.areas_inspeccion)) return false;
    return insp.areas_inspeccion.includes(AREA_ANIMAL);
  });

  useEffect(() => {
    if (isOpen) {
      if (aval) {
        setNumeroAval(aval.numero_aval);
        setCodigoPredio(aval.codigo_predio || '');
        setFechaEmision(aval.fecha_emision ? aval.fecha_emision.substring(0, 10) : '');
        setFechaVencimiento(aval.fecha_vencimiento ? aval.fecha_vencimiento.substring(0, 10) : '');
        setCertificadoVacunacionN(aval.certificado_vacunacion_n || '');
        setInspeccionId(aval.inspeccion_id ? String(aval.inspeccion_id) : 'none');
        setMedicoResponsableId(aval.medico_responsable_id ? String(aval.medico_responsable_id) : 'none');
        setJefeOsaId(aval.jefe_osa_id ? String(aval.jefe_osa_id) : 'none');
        setObservaciones(aval.observaciones || '');

        if (aval.aval_hallazgos_bov_buf?.[0]) {
          setBovBuf(aval.aval_hallazgos_bov_buf[0]);
        }

        if (aval.aval_hallazgos_otras) {
          setOtrasEspecies(
            aval.aval_hallazgos_otras.map((o) => ({
              tipo_animal_id: o.tipo_animal_id,
              machos: o.machos,
              hembras: o.hembras,
              crias: o.crias,
            }))
          );
        }

        if (aval.aval_biologicos) {
          setBiologicos(
            aval.aval_biologicos.map((b) => ({
              insumo_id: b.insumo_id,
              oficina_id: b.oficina_id || oficinas[0]?.id || 1,
              cantidad: b.cantidad || 1,
              lote: b.lote || '',
              fecha_vacunacion: b.fecha_vacunacion ? b.fecha_vacunacion.substring(0, 10) : '',
              pruebas_diagnosticas: b.pruebas_diagnosticas || '',
            }))
          );
        }
      } else {
        const randomNum = String(Math.floor(1000 + Math.random() * 9000));
        setNumeroAval(`AVAL-${new Date().getFullYear()}-${randomNum}`);
        setCodigoPredio('');
        setFechaEmision(new Date().toISOString().substring(0, 10));
        const defaultExp = new Date();
        defaultExp.setDate(defaultExp.getDate() + 180); // 6 meses por defecto
        setFechaVencimiento(defaultExp.toISOString().substring(0, 10));
        setCertificadoVacunacionN('');
        setInspeccionId(initialInspeccionId ? String(initialInspeccionId) : 'none');
        setMedicoResponsableId('none');
        setJefeOsaId('none');
        setObservaciones('');

        setBovBuf({
          t_toros: 0,
          t_vacas: 0,
          t_novillos: 0,
          t_novillas: 0,
          t_mautes_m: 0,
          t_mautes_h: 0,
          t_becerros: 0,
          t_becerras: 0,
          t_bufalos: 0,
          t_bufalas: 0,
          t_buvillos: 0,
          t_buvillas: 0,
          t_bumautes_m: 0,
          t_bumautes_h: 0,
          t_bucerros: 0,
          t_bucerras: 0,
        });
        setOtrasEspecies([]);
        setBiologicos([]);
        setHierros([]);
        setHierroPreviews([]);
      }
      setActiveTab('generales');
    }
  }, [isOpen, aval, initialInspeccionId]);

  const handleBovBufChange = (field: keyof AvalHallazgosBovBuf, value: string) => {
    setBovBuf((prev) => ({
      ...prev,
      [field]: Number(value) >= 0 ? Number(value) : 0,
    }));
  };

  const totalBovBuf = Object.values(bovBuf).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);

  const handleAddOtrasEspecies = () => {
    if (tiposAnimales.length > 0) {
      setOtrasEspecies((prev) => [
        ...prev,
        { tipo_animal_id: tiposAnimales[0].id, machos: 0, hembras: 0, crias: 0 },
      ]);
    }
  };

  const handleRemoveOtrasEspecies = (index: number) => {
    setOtrasEspecies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBiologico = () => {
    if (insumos.length > 0 && oficinas.length > 0) {
      setBiologicos((prev) => [
        ...prev,
        {
          insumo_id: insumos[0].id,
          oficina_id: oficinas[0].id,
          cantidad: 1,
          fecha_vacunacion: new Date().toISOString().substring(0, 10),
          pruebas_diagnosticas: '',
        },
      ]);
    }
  };

  const handleRemoveBiologico = (index: number) => {
    setBiologicos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHierrosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setHierros((prev) => [...prev, ...selectedFiles]);

      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setHierroPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveHierro = (index: number) => {
    setHierros((prev) => prev.filter((_, i) => i !== index));
    setHierroPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedInspId = inspeccionId && inspeccionId !== 'none' ? Number(inspeccionId) : null;
    const selectedMedId = medicoResponsableId && medicoResponsableId !== 'none' ? Number(medicoResponsableId) : null;
    const selectedJefeId = jefeOsaId && jefeOsaId !== 'none' ? Number(jefeOsaId) : null;

    await onSave({
      numero_aval: numeroAval.trim(),
      codigo_predio: codigoPredio.trim() || undefined,
      fecha_emision: fechaEmision || undefined,
      fecha_vencimiento: fechaVencimiento || undefined,
      certificado_vacunacion_n: certificadoVacunacionN.trim() || undefined,
      inspeccion_id: selectedInspId,
      medico_responsable_id: selectedMedId,
      jefe_osa_id: selectedJefeId,
      observaciones: observaciones.trim() || undefined,
      hallazgos_bov_buf: totalBovBuf > 0 ? bovBuf : undefined,
      hallazgos_otras: otrasEspecies.length > 0 ? otrasEspecies : undefined,
      biologicos: biologicos.length > 0 ? biologicos : undefined,
      hierros: hierros.length > 0 ? hierros : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl mx-auto bg-background/95 backdrop-blur-xl border-border rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="border-b border-border pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
              <FileCheck className="size-8" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                {aval ? 'Editar Aval Sanitario' : 'Emitir Nuevo Aval Sanitario'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                Diligencie los datos de la certificación zoosanitaria, inspección de rebaño y vacunas aplicadas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full bg-muted/60 p-1.5 rounded-2xl h-14 text-xs font-bold">
              <TabsTrigger value="generales" className="rounded-xl py-2.5 font-bold tracking-wide">
                1. Generales
              </TabsTrigger>
              <TabsTrigger value="rebaño" className="rounded-xl py-2.5 font-bold tracking-wide flex items-center justify-center gap-2">
                2. Rebaño <Badge className="bg-amber-500 text-white font-black px-2 py-0.5 text-[11px] rounded-full">{totalBovBuf}</Badge>
              </TabsTrigger>
              <TabsTrigger value="especies" className="rounded-xl py-2.5 font-bold tracking-wide">
                3. Otras Especies
              </TabsTrigger>
              <TabsTrigger value="biologicos" className="rounded-xl py-2.5 font-bold tracking-wide">
                4. Biológicos
              </TabsTrigger>
              <TabsTrigger value="hierros" className="rounded-xl py-2.5 font-bold tracking-wide">
                5. Hierros / Marcas
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DATOS GENERALES */}
            <TabsContent value="generales" className="space-y-5 pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Número de Aval *</label>
                  <Input
                    required
                    value={numeroAval}
                    onChange={(e) => setNumeroAval(e.target.value)}
                    placeholder="Ej. AVAL-2026-0001"
                    className="h-12 rounded-xl font-mono font-bold text-sm bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="size-4 text-emerald-500" />
                    Código de Predio / Finca
                  </label>
                  <Input
                    value={codigoPredio}
                    onChange={(e) => setCodigoPredio(e.target.value)}
                    placeholder="Ej. FINCA-LA-ESPERANZA-01"
                    className="h-12 rounded-xl font-mono text-sm bg-card border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Fecha de Emisión</label>
                  <Input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="h-12 rounded-xl text-sm bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Fecha de Vencimiento</label>
                  <Input
                    type="date"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                    className="h-12 rounded-xl text-sm bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">N° Certificado Vacunación</label>
                  <Input
                    value={certificadoVacunacionN}
                    onChange={(e) => setCertificadoVacunacionN(e.target.value)}
                    placeholder="Ej. CERT-VAC-984"
                    className="h-12 rounded-xl font-mono text-sm bg-card border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Inspección de Origen (Solo Aprobadas / Seguimiento / Cuarentena)
                  </label>
                  <Select value={inspeccionId} onValueChange={setInspeccionId}>
                    <SelectTrigger className="h-12 rounded-xl text-xs bg-card border-border">
                      <SelectValue placeholder="Seleccione Inspección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin inspección vinculada (Directo)</SelectItem>
                      {inspeccionesElegibles.map((insp) => (
                        <SelectItem key={insp.id} value={String(insp.id)}>
                          Inspección #{insp.n_control} ({insp.status}) - {new Date(insp.fecha_inspeccion).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="size-4 text-blue-500" /> Médico Veterinario
                  </label>
                  <Select value={medicoResponsableId} onValueChange={setMedicoResponsableId}>
                    <SelectTrigger className="h-12 rounded-xl text-xs bg-card border-border">
                      <SelectValue placeholder="Seleccione Médico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No asignado</SelectItem>
                      {empleados.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.nombre} {emp.apellido} (C.I. {emp.cedula})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="size-4 text-purple-500" /> Inspector Jefe (OSA)
                  </label>
                  <Select value={jefeOsaId} onValueChange={setJefeOsaId}>
                    <SelectTrigger className="h-12 rounded-xl text-xs bg-card border-border">
                      <SelectValue placeholder="Seleccione Jefe OSA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No asignado</SelectItem>
                      {empleados.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.nombre} {emp.apellido} (C.I. {emp.cedula})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Observaciones Generales</label>
                <Textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escriba aquí observaciones del estado zoosanitario, recomendaciones o detalles del predio..."
                  className="rounded-2xl min-h-[100px] text-xs p-4 bg-card border-border"
                />
              </div>
            </TabsContent>

            {/* TAB 2: REBAÑO BOVINO Y BUFALINO */}
            <TabsContent value="rebaño" className="space-y-6 pt-5">
              <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" /> Matriz Epidemiológica de Rebaño Auditado
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total de cabezas registradas según la clasificación zoosanitaria oficial.
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-base px-4 py-1.5 rounded-xl">
                  TOTAL: {totalBovBuf} Cabezas
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> 1. Especie Bovino (Vacuno)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Toros</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_toros || 0}
                      onChange={(e) => handleBovBufChange('t_toros', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Vacas</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_vacas || 0}
                      onChange={(e) => handleBovBufChange('t_vacas', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Novillos</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_novillos || 0}
                      onChange={(e) => handleBovBufChange('t_novillos', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Novillas</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_novillas || 0}
                      onChange={(e) => handleBovBufChange('t_novillas', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Mautes (Machos)</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_mautes_m || 0}
                      onChange={(e) => handleBovBufChange('t_mautes_m', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Mautes (Hembras)</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_mautes_h || 0}
                      onChange={(e) => handleBovBufChange('t_mautes_h', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Becerros</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_becerros || 0}
                      onChange={(e) => handleBovBufChange('t_becerros', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Becerras</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_becerras || 0}
                      onChange={(e) => handleBovBufChange('t_becerras', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-extrabold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> 2. Especie Bufalino (Búfalos)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Búfalos</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bufalos || 0}
                      onChange={(e) => handleBovBufChange('t_bufalos', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Búfalas</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bufalas || 0}
                      onChange={(e) => handleBovBufChange('t_bufalas', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Buvillos</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_buvillos || 0}
                      onChange={(e) => handleBovBufChange('t_buvillos', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Buvillas</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_buvillas || 0}
                      onChange={(e) => handleBovBufChange('t_buvillas', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Bumautes (Machos)</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bumautes_m || 0}
                      onChange={(e) => handleBovBufChange('t_bumautes_m', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Bumautes (Hembras)</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bumautes_h || 0}
                      onChange={(e) => handleBovBufChange('t_bumautes_h', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Bucerros</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bucerros || 0}
                      onChange={(e) => handleBovBufChange('t_bucerros', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 bg-card p-3 rounded-2xl border border-border">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Bucerras</label>
                    <Input
                      type="number"
                      min="0"
                      value={bovBuf.t_bucerras || 0}
                      onChange={(e) => handleBovBufChange('t_bucerras', e.target.value)}
                      className="h-11 rounded-xl text-center font-black text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: OTRAS ESPECIES */}
            <TabsContent value="especies" className="space-y-5 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Desglose de Otras Especies (Porcina, Equina, Avícola, Caprina, etc.)
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddOtrasEspecies}
                  className="rounded-xl h-10 px-4 text-xs font-bold cursor-pointer border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                >
                  <Plus className="size-4 mr-1.5" /> Añadir Especie
                </Button>
              </div>

              {otrasEspecies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-2xl bg-card">
                  No hay otras especies registradas. Haga clic en "Añadir Especie" para agregar porcinos, equinos, etc.
                </div>
              ) : (
                <div className="space-y-3">
                  {otrasEspecies.map((esp, i) => (
                    <div key={i} className="p-4 border border-border rounded-2xl bg-card grid grid-cols-1 sm:grid-cols-5 gap-4 items-center shadow-sm">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Tipo de Animal</label>
                        <Select
                          value={String(esp.tipo_animal_id)}
                          onValueChange={(val) => {
                            const copy = [...otrasEspecies];
                            copy[i].tipo_animal_id = Number(val);
                            setOtrasEspecies(copy);
                          }}
                        >
                          <SelectTrigger className="h-11 text-xs rounded-xl">
                            <SelectValue placeholder="Seleccione Especie" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposAnimales.map((t) => (
                              <SelectItem key={t.id} value={String(t.id)}>
                                {t.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Machos</label>
                        <Input
                          type="number"
                          min="0"
                          value={esp.machos}
                          onChange={(e) => {
                            const copy = [...otrasEspecies];
                            copy[i].machos = Number(e.target.value);
                            setOtrasEspecies(copy);
                          }}
                          className="h-11 text-xs rounded-xl text-center font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Hembras</label>
                        <Input
                          type="number"
                          min="0"
                          value={esp.hembras}
                          onChange={(e) => {
                            const copy = [...otrasEspecies];
                            copy[i].hembras = Number(e.target.value);
                            setOtrasEspecies(copy);
                          }}
                          className="h-11 text-xs rounded-xl text-center font-bold"
                        />
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Crías</label>
                          <Input
                            type="number"
                            min="0"
                            value={esp.crias}
                            onChange={(e) => {
                              const copy = [...otrasEspecies];
                              copy[i].crias = Number(e.target.value);
                              setOtrasEspecies(copy);
                            }}
                            className="h-11 text-xs rounded-xl text-center font-bold"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOtrasEspecies(i)}
                          className="size-11 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: BIOLÓGICOS Y VACUNACIÓN */}
            <TabsContent value="biologicos" className="space-y-5 pt-5">
              <div className="flex items-center justify-between bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 shadow-sm">
                <div>
                  <p className="text-xs font-black text-blue-500 flex items-center gap-2 uppercase tracking-wide">
                    <Syringe className="size-5" /> Inmunización y Vacunación de Ganado
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Los biológicos despachados descontarán existencias reales del Kardex de la sede seleccionada.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddBiologico}
                  className="rounded-xl h-10 px-4 text-xs font-bold cursor-pointer border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                >
                  <Plus className="size-4 mr-1.5" /> Añadir Vacuna
                </Button>
              </div>

              {biologicos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-2xl bg-card">
                  No se han aplicado vacunas o biológicos en este aval. Haga clic en "Añadir Vacuna".
                </div>
              ) : (
                <div className="space-y-4">
                  {biologicos.map((bio, i) => (
                    <div key={i} className="p-4 border border-border rounded-2xl bg-card space-y-4 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Insumo / Biológico</label>
                          <Select
                            value={String(bio.insumo_id)}
                            onValueChange={(val) => {
                              const copy = [...biologicos];
                              copy[i].insumo_id = Number(val);
                              setBiologicos(copy);
                            }}
                          >
                            <SelectTrigger className="h-11 text-xs rounded-xl">
                              <SelectValue placeholder="Seleccione Vacuna" />
                            </SelectTrigger>
                            <SelectContent>
                              {insumos.map((ins) => (
                                <SelectItem key={ins.id} value={String(ins.id)}>
                                  {ins.nombre} ({ins.codigo || 'Sin código'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Sede / Oficina de Inventario</label>
                          <Select
                            value={String(bio.oficina_id)}
                            onValueChange={(val) => {
                              const copy = [...biologicos];
                              copy[i].oficina_id = Number(val);
                              setBiologicos(copy);
                            }}
                          >
                            <SelectTrigger className="h-11 text-xs rounded-xl">
                              <SelectValue placeholder="Seleccione Oficina" />
                            </SelectTrigger>
                            <SelectContent>
                              {oficinas.map((of) => (
                                <SelectItem key={of.id} value={String(of.id)}>
                                  {of.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Cantidad Aplicada</label>
                          <Input
                            type="number"
                            min="1"
                            value={bio.cantidad}
                            onChange={(e) => {
                              const copy = [...biologicos];
                              copy[i].cantidad = Number(e.target.value);
                              setBiologicos(copy);
                            }}
                            className="h-11 text-xs rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Lote N°</label>
                          <Input
                            value={bio.lote || ''}
                            onChange={(e) => {
                              const copy = [...biologicos];
                              copy[i].lote = e.target.value;
                              setBiologicos(copy);
                            }}
                            placeholder="Ej. LOT-2026-X"
                            className="h-11 text-xs rounded-xl font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">Fecha Vacunación</label>
                          <Input
                            type="date"
                            value={bio.fecha_vacunacion || ''}
                            onChange={(e) => {
                              const copy = [...biologicos];
                              copy[i].fecha_vacunacion = e.target.value;
                              setBiologicos(copy);
                            }}
                            className="h-11 text-xs rounded-xl"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="space-y-1.5 flex-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">Pruebas Diagnósticas</label>
                            <Input
                              value={bio.pruebas_diagnosticas || ''}
                              onChange={(e) => {
                                const copy = [...biologicos];
                                copy[i].pruebas_diagnosticas = e.target.value;
                                setBiologicos(copy);
                              }}
                              placeholder="Ej. Brucelosis Negativo"
                              className="h-11 text-xs rounded-xl"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveBiologico(i)}
                            className="size-11 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer mt-6"
                          >
                            <Trash2 className="size-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 5: HIERROS Y MARCAS */}
            <TabsContent value="hierros" className="space-y-5 pt-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Upload className="size-4 text-emerald-500" /> Carga de Marcas y Hierros Registrados
                </label>
                <div className="border-2 border-dashed border-border hover:border-emerald-500/50 p-8 rounded-2xl text-center bg-card transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleHierrosChange}
                    className="hidden"
                    id="hierro-file-input"
                  />
                  <label
                    htmlFor="hierro-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                      <Upload className="size-8" />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      Haga clic para subir fotografías de Hierros o Marcas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Formatos soportados: PNG, JPG, WEBP. Puede seleccionar múltiples imágenes.
                    </span>
                  </label>
                </div>
              </div>

              {hierroPreviews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Imágenes listadas para registrar ({hierroPreviews.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {hierroPreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative size-32 rounded-2xl border border-border overflow-hidden group bg-muted/20"
                      >
                        <img src={src} alt="Hierro preview" className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveHierro(i)}
                          className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-6 border-t border-border gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-12 px-6 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl h-12 px-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Guardando Aval...
                </>
              ) : (
                'Emitir Aval Sanitario'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
