import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileCheck,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Calendar,
  User2,
  Search,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Can from '@/components/auth/Can';
import { useAvales } from '@/hooks/use-avales';
import { avalesService } from '@/services/avales.service';
import { AvalDetailsModal } from './components/AvalDetailsModal';
import { AvalFormModal } from './components/AvalFormModal';
import type { AvalSanitario } from '@/types/avales';

const Avales: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    avales,
    pagination,
    isLoading,
    search,
    setSearch,
    setPage,
    setLimit,
    createAval,
    updateAval,
    deleteAval,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAvales();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAval, setEditingAval] = useState<AvalSanitario | null>(null);
  const [initialInspeccionId, setInitialInspeccionId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAval, setSelectedAval] = useState<AvalSanitario | null>(null);
  const [deleteAvalId, setDeleteAvalId] = useState<number | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const inspeccionIdParam = searchParams.get('inspeccion_id');
    const openModalParam = searchParams.get('openModal');
    if (inspeccionIdParam && openModalParam === 'true') {
      setInitialInspeccionId(Number(inspeccionIdParam));
      setEditingAval(null);
      setIsFormModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingAval(null);
    setInitialInspeccionId(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (aval: AvalSanitario) => {
    setEditingAval(aval);
    setIsFormModalOpen(true);
    try {
      const res = await avalesService.getById(aval.id);
      if (res.data) {
        setEditingAval(res.data);
      }
    } catch {
      // keep current fallback
    }
  };

  const handleOpenDetails = async (aval: AvalSanitario) => {
    setSelectedAval(aval);
    setIsDetailsModalOpen(true);
    try {
      const res = await avalesService.getById(aval.id);
      if (res.data) {
        setSelectedAval(res.data);
      }
    } catch {
      // keep current fallback
    }
  };

  const confirmDelete = async () => {
    if (deleteAvalId) {
      await deleteAval(deleteAvalId);
      setDeleteAvalId(null);
    }
  };

  const handleDownloadSinglePdf = async (id: number) => {
    setGeneratingPdfId(id);
    try {
      await avalesService.openPdfReport(id);
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await avalesService.exportExcel({ q: search });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await avalesService.exportPdf({ q: search });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const totalAvales = pagination?.totalCount || avales.length;
  const avalesVigentes = avales.filter(
    (a: AvalSanitario) => !a.fecha_vencimiento || new Date(a.fecha_vencimiento) >= new Date()
  ).length;
  const avalesVencidos = avales.filter(
    (a: AvalSanitario) => a.fecha_vencimiento && new Date(a.fecha_vencimiento) < new Date()
  ).length;
  const totalCabezas = avales.reduce((acc: number, a: AvalSanitario) => {
    const bov = a.aval_hallazgos_bov_buf?.[0]?.total_bov_buf || 0;
    return acc + Number(bov);
  }, 0);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6">

      {/* ─── HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner shrink-0">
            <ShieldCheck className="size-8" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground leading-tight">
              Avales Sanitarios
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Certificaciones Zoosanitarias · Inspecciones de Rebaño · Control de Inmunización
            </p>
          </div>
        </div>

        <Can screen="avales" action="create">
          <Button
            onClick={handleOpenCreate}
            className="rounded-2xl h-12 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/25 cursor-pointer shrink-0 gap-2"
          >
            <Plus className="size-5" />
            Emitir Nuevo Aval
          </Button>
        </Can>
      </div>

      {/* ─── KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-card border border-border glass-effect flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 shrink-0">
            <FileCheck className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Avales</p>
            <p className="text-4xl font-black text-foreground leading-none mt-1">{totalAvales}</p>
            <p className="text-xs text-muted-foreground mt-1">Certificaciones emitidas</p>
          </div>
        </div>

        {/* Vigentes */}
        <div className="p-5 rounded-2xl bg-card border border-border glass-effect flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/15 shrink-0">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vigentes</p>
            <p className="text-4xl font-black text-blue-500 leading-none mt-1">{avalesVigentes}</p>
            <p className="text-xs text-muted-foreground mt-1">Al día</p>
          </div>
        </div>

        {/* Vencidos */}
        <div className="p-5 rounded-2xl bg-card border border-border glass-effect flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/15 shrink-0">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Vencidos</p>
            <p className="text-4xl font-black text-rose-500 leading-none mt-1">{avalesVencidos}</p>
            <p className="text-xs text-muted-foreground mt-1">Expirados</p>
          </div>
        </div>

        {/* Rebaño */}
        <div className="p-5 rounded-2xl bg-card border border-border glass-effect flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/15 shrink-0">
            <Sparkles className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rebaño</p>
            <p className="text-4xl font-black text-amber-500 leading-none mt-1">{totalCabezas}</p>
            <p className="text-xs text-muted-foreground mt-1">Cabezas auditadas</p>
          </div>
        </div>
      </div>

      {/* ─── TOOLBAR ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl glass-effect p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-auto sm:min-w-[340px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por n° aval, predio, médico..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-11 rounded-xl text-sm bg-background/60 border-border"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <p className="text-xs text-muted-foreground font-semibold shrink-0 mr-2 hidden md:block">
            {avales.length} de {pagination?.totalCount ?? avales.length} registros
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel || avales.length === 0}
            className="h-10 px-3.5 rounded-xl font-bold text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer shadow-sm"
          >
            {isExportingExcel ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-3.5" />
            )}
            <span className="hidden sm:inline">Exportar</span> Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={isExportingPdf || avales.length === 0}
            className="h-10 px-3.5 rounded-xl font-bold text-xs gap-1.5 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 cursor-pointer shadow-sm"
          >
            {isExportingPdf ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileText className="size-3.5" />
            )}
            <span className="hidden sm:inline">Exportar</span> PDF
          </Button>
        </div>
      </div>

      {/* ─── TABLE CARD ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl glass-effect overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="size-10 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold">Cargando avales sanitarios...</p>
          </div>
        ) : avales.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="p-5 rounded-3xl bg-muted/40 border border-border">
              <FileCheck className="size-12 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-foreground">No se encontraron avales sanitarios</p>
              <p className="text-sm text-muted-foreground mt-1">
                Intente cambiar los términos de búsqueda o emita un nuevo aval.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">N° Aval</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Código Predio</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Inspección</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Vigencia</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground hidden md:table-cell">Médico</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Emisión</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground hidden lg:table-cell text-center">Rebaño</th>
                    <th className="px-5 py-4 text-xs font-extrabold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {avales.map((aval: AvalSanitario) => {
                    const isVencido = aval.fecha_vencimiento
                      ? new Date(aval.fecha_vencimiento) < new Date()
                      : false;
                    const totalBov = aval.aval_hallazgos_bov_buf?.[0]?.total_bov_buf || 0;
                    const medico = aval.empleados_avales_sanitarios_medico_responsable_idToempleados;

                    return (
                      <tr
                        key={aval.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* N° Aval */}
                        <td className="px-5 py-4">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 font-mono text-xs font-bold px-2.5 py-1">
                            {aval.numero_aval}
                          </Badge>
                        </td>

                        {/* Predio */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-foreground text-sm">
                            {aval.codigo_predio || <span className="text-muted-foreground/50 italic text-xs">—</span>}
                          </span>
                        </td>

                        {/* Inspección */}
                        <td className="px-5 py-4">
                          {aval.inspecciones?.n_control ? (
                            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                              #{aval.inspecciones.n_control}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Directo</span>
                          )}
                        </td>

                        {/* Vigencia */}
                        <td className="px-5 py-4">
                          <Badge
                            className={
                              isVencido
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/25 font-bold text-xs'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 font-bold text-xs'
                            }
                          >
                            {isVencido ? '● VENCIDO' : '● VIGENTE'}
                          </Badge>
                          {aval.fecha_vencimiento && (
                            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="size-2.5" />
                              {new Date(aval.fecha_vencimiento).toLocaleDateString('es-VE')}
                            </p>
                          )}
                        </td>

                        {/* Médico */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          {medico ? (
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <User2 className="size-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {medico.nombre} {medico.apellido}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50 italic">—</span>
                          )}
                        </td>

                        {/* Fecha Emisión */}
                        <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground font-mono">
                          {aval.fecha_emision
                            ? new Date(aval.fecha_emision).toLocaleDateString('es-VE')
                            : <span className="opacity-40">—</span>}
                        </td>

                        {/* Rebaño */}
                        <td className="px-5 py-4 hidden lg:table-cell text-center">
                          <span className="text-lg font-black text-amber-500">{totalBov}</span>
                          <p className="text-[10px] text-muted-foreground">cabezas</p>
                        </td>

                        {/* Acciones */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Can screen="avales" action="see">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={generatingPdfId === aval.id}
                                onClick={() => handleDownloadSinglePdf(aval.id)}
                                title="Descargar Aval Oficial (PDF)"
                                className="size-9 p-0 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600 text-emerald-600/80 cursor-pointer transition-all"
                              >
                                {generatingPdfId === aval.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <FileText className="size-4" />
                                )}
                              </Button>
                            </Can>
                            <Can screen="avales" action="see">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenDetails(aval)}
                                title="Ver Ficha Técnica"
                                className="size-9 p-0 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer transition-all"
                              >
                                <Eye className="size-4" />
                              </Button>
                            </Can>
                            <Can screen="avales" action="update">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenEdit(aval)}
                                title="Editar Aval"
                                className="size-9 p-0 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 cursor-pointer transition-all"
                              >
                                <Edit className="size-4" />
                              </Button>
                            </Can>
                            <Can screen="avales" action="delete">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteAvalId(aval.id)}
                                title="Eliminar Aval"
                                className="size-9 p-0 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-all"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </Can>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination — siempre visible cuando no carga, igual que los demás módulos */}
        {!isLoading && pagination && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <Pagination
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </div>

      {/* ─── MODALES ───────────────────────────────────────────────── */}
      <AvalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        aval={selectedAval}
      />

      <AvalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        aval={editingAval}
        initialInspeccionId={initialInspeccionId}
        isSaving={isCreating || isUpdating}
        onSave={async (dto) => {
          if (editingAval) {
            await updateAval({ id: editingAval.id, dto });
          } else {
            await createAval(dto);
          }
        }}
      />

      {/* ─── CONFIRM DELETE ────────────────────────────────────────── */}
      <AlertDialog
        open={Boolean(deleteAvalId)}
        onOpenChange={(open) => !open && setDeleteAvalId(null)}
      >
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md rounded-3xl">
          <AlertDialogHeader>
            <div className="size-20 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-10 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center uppercase leading-tight">
              ¿Eliminar Aval Sanitario?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium px-4 text-muted-foreground">
              Esta acción eliminará el aval zoosanitario y{' '}
              <strong>restaurará automáticamente el stock</strong> de insumos y vacunas descontados en el inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:justify-center pt-4">
            <AlertDialogCancel className="rounded-xl h-12 px-6 text-sm font-bold cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="rounded-xl h-12 px-6 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-lg shadow-rose-600/20"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, Eliminar y Restaurar Stock'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Avales;
