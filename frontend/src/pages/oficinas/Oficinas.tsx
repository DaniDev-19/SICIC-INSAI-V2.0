import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    Building2,
    AlertTriangle,
    Trash2,
    X,
    ShieldCheck
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Can from '@/components/auth/Can';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
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
} from "@/components/ui/alert-dialog";
import { useOficinas } from '@/hooks/use-oficinas';
import { OficinasTable } from './components/OficinasTable';
import { OficinaModal } from './components/OficinaModal';
import type { Oficina } from '@/types/oficinas';

const Oficinas: React.FC = () => {
    const navigate = useNavigate();
    const {
        oficinas,
        pagination,
        isLoading,
        search,
        setPage,
        setLimit,
        setSearch,
        deleteOficina,
        deleteManyOficinas,
        isDeleting
    } = useOficinas();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [centroFilter, setCentroFilter] = useState<'all' | 'si' | 'no'>('all');

    const filteredOficinas = oficinas.filter(o => {
        if (centroFilter === 'si') return o.es_centro_validacion === true;
        if (centroFilter === 'no') return o.es_centro_validacion === false;
        return true;
    });

    const handleOpenCreate = () => {
        setSelectedOficina(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (oficina: Oficina) => {
        setSelectedOficina(oficina);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteOficina(deleteId);
            setDeleteId(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length > 0) {
            await deleteManyOficinas(selectedIds);
            setSelectedIds([]);
            setIsBulkDeleteOpen(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredOficinas.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOficinas.map(o => o.id));
        }
    };

    return (
        <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/home')}
                            className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
                            <Building2 className="size-8 text-primary" />
                            Gestión de Oficinas
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-12">
                        Administra las sedes, centros de validación y oficinas administrativas del INSAI.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
                        {/* Filtro: Centro de Validación */}
                        <Select value={centroFilter} onValueChange={(v) => setCentroFilter(v as 'all' | 'si' | 'no')}>
                            <SelectTrigger
                                title="Filtrar por Centro de Validación"
                                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
                            >
                                <ShieldCheck className={`size-4 ${centroFilter !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="sr-only"><SelectValue /></span>
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border rounded-xl top-9 right-15">                             <SelectItem value="all" className="cursor-pointer font-bold">TODAS LAS SEDES</SelectItem>
                                <SelectItem value="si" className="cursor-pointer text-emerald-600 font-bold">C. VALIDACIÓN: SÍ</SelectItem>
                                <SelectItem value="no" className="cursor-pointer">C. VALIDACIÓN: NO</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                        <div className="w-[220px] lg:w-[320px]">
                            <SearchInput
                                placeholder="Buscar por nombre o dirección..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClear={() => setSearch('')}
                                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                            />
                        </div>
                    </div>

                    <Can screen="oficinas" action="create">
                        <Button onClick={handleOpenCreate} variant="primary" className="shadow-lg shadow-primary/20">
                        <Plus className="size-5 text-white" /> <span className="text-white">Nueva Oficina</span>
                    </Button>
                    </Can>
                </div>
            </div>


            {/* Floating bulk delete bar - igual que en Roles */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-card text-card-foreground px-6 py-4 rounded-2xl shadow-2xl border border-border flex items-center gap-8 glass-effect">
                        <div className="flex items-center gap-3 pr-8 border-r border-border">
                            <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-lg shadow-primary/20">
                                {selectedIds.length}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Seleccionados</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                title="Eliminar seleccionados"
                                className="font-bold cursor-pointer hover:bg-rose-500/20 hover:text-rose-500 transition-colors text-inherit"
                                onClick={() => setIsBulkDeleteOpen(true)}
                            >
                                <Trash2 className="size-4 mr-2" /> Eliminar Masivo
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Limpiar selección"
                                className="rounded-full hover:bg-muted dark:hover:bg-foreground/10 cursor-pointer text-inherit"
                                onClick={() => setSelectedIds([])}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                            <Loader2 className="size-10 text-primary animate-spin" />
                        </div>
                        <p className="text-muted-foreground font-medium animate-pulse">Cargando oficinas...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                            <OficinasTable
                                oficinas={filteredOficinas}
                                onEdit={handleOpenEdit}
                                onDelete={setDeleteId}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onToggleSelectAll={toggleSelectAll}
                            />
                        </div>

                        <div className="px-6 py-4 border-t border-border bg-muted/20">
                            <Pagination
                                pagination={pagination}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    </>
                )}
            </div>

            <OficinaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                oficina={selectedOficina}
            />

            {/* Alert para eliminación individual */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
                    <AlertDialogHeader>
                        <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <AlertTriangle className="size-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
                            ¿Eliminar Oficina?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Esta acción borrará permanentemente esta sede. Los empleados asociados a esta oficina podrían perder su vinculación de sede.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
                        >
                            {isDeleting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                            Confirmar Eliminación
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
                    <AlertDialogHeader>
                        <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <AlertTriangle className="size-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
                            ¿Eliminar {selectedIds.length} Oficinas?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Estás a punto de eliminar {selectedIds.length} oficinas de forma permanente. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Abortar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
                        >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : 'Confirmar Purga'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Oficinas;
