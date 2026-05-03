import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    ClipboardList,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { useProgramas } from '@/hooks/use-programas';
import { ProgramasTable } from './components/ProgramasTable';
import { ProgramaModal } from './components/ProgramaModal';
import { ProgramaAsociaciones } from './components/ProgramaAsociaciones';
import type { Programa } from '@/types/programas';

const Programas: React.FC = () => {
    const navigate = useNavigate();
    const {
        programas,
        tipos,
        pagination,
        isLoading,
        search,
        tipoId,
        setPage,
        setLimit,
        setSearch,
        setTipoId,
        createPrograma,
        updatePrograma,
        deletePrograma,
        createTipo,
        updateTipo,
        deleteTipo,
        isCreating,
        isUpdating
    } = useProgramas();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
    const [selectedProgramaForDetails, setSelectedProgramaForDetails] = useState<Programa | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleOpenCreate = () => {
        setSelectedPrograma(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (programa: Programa) => {
        setSelectedPrograma(programa);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        if (selectedPrograma) {
            await updatePrograma({ id: selectedPrograma.id, data });
        } else {
            await createPrograma(data);
        }
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deletePrograma(deleteId);
            setDeleteId(null);
            if (selectedProgramaForDetails?.id === deleteId) {
                setSelectedProgramaForDetails(null);
            }
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
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
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                            Programas de Control
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-12">
                        Gestiona los programas de vigilancia y control fitosanitario del sistema.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
                        <Select value={tipoId} onValueChange={setTipoId}>
                            <SelectTrigger
                                title="Filtrar por Tipo"
                                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
                            >
                                <ClipboardList className={`size-4 ${tipoId !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="sr-only">
                                    <SelectValue placeholder="Tipo" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border">
                                <SelectItem value="all" className="cursor-pointer">Todos los Tipos</SelectItem>
                                {tipos.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()} className="cursor-pointer">
                                        {t.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                        <div className="w-[200px] lg:w-[280px]">
                            <SearchInput
                                placeholder="Buscar programa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClear={() => setSearch('')}
                                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                            />
                        </div>
                    </div>

                    <Button onClick={handleOpenCreate} title='crea un nuevo programa' variant={"primary"}>
                        <Plus className="size-5 text-white" /> <span className="text-white">Nuevo Programa</span>
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden glass-effect">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-4">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                            <Loader2 className="size-10 text-primary animate-spin" />
                        </div>
                        <p className="text-muted-foreground font-medium animate-pulse">Cargando programas...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                            <ProgramasTable
                                programas={programas}
                                onEdit={handleOpenEdit}
                                onDelete={(id) => setDeleteId(id)}
                                onSelect={(prog) => setSelectedProgramaForDetails(prog.id === selectedProgramaForDetails?.id ? null : prog)}
                                selectedId={selectedProgramaForDetails?.id}
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

            {selectedProgramaForDetails && (
                <ProgramaAsociaciones
                    programaId={selectedProgramaForDetails.id}
                    programaNombre={selectedProgramaForDetails.nombre}
                />
            )}

            <ProgramaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                programa={selectedPrograma}
                tipos={tipos}
                isLoading={isCreating || isUpdating}
                onCreateTipo={createTipo}
                onUpdateTipo={updateTipo}
                onDeleteTipo={deleteTipo}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
                    <AlertDialogHeader>
                        <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <AlertTriangle className="size-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
                            ¿Eliminar Programa?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Esta acción borrará permanentemente este programa y desvinculará todas sus asociaciones estratégicas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
                        >
                            Destruir Programa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Programas;
