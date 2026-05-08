import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    Database,
    AlertTriangle
} from 'lucide-react';
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
import { useCultivos } from '@/hooks/use-cultivos';

import { CultivosTable } from './components/CultivosTable';
import { CultivoModal } from './components/CultivoModal';

const Cultivos: React.FC = () => {
    const navigate = useNavigate();
    const {
        cultivos,
        tipos,
        pagination,
        isLoading,
        search,
        tipoId,
        setPage,
        setLimit,
        setSearch,
        setTipoId,
        deleteCultivo,
        createTipo,
        updateTipo,
        deleteTipo,
    } = useCultivos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCultivo, setSelectedCultivo] = useState<typeof cultivos[0] | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleOpenCreate = () => {
        setSelectedCultivo(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cultivo: typeof cultivos[0]) => {
        setSelectedCultivo(cultivo);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteCultivo(deleteId);
            setDeleteId(null);
        }
    };



    return (
        <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/home')}
                            className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                        >
                            <ChevronLeft className="size-5" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                            Catálogo de Cultivos
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-12">
                        Administra los tipos de cultivos disponibles para las inspecciones y avales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
                        <Select value={tipoId} onValueChange={setTipoId}>
                            <SelectTrigger
                                title="Filtrar por Tipo"
                                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm focus:ring-primary/20 transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
                            >
                                <Database className={`size-4 ${tipoId !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="sr-only">
                                    <SelectValue placeholder="Tipo" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border top-9 right-15">
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
                                placeholder="Buscar cultivo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClear={() => setSearch('')}
                                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                            />
                        </div>
                    </div>

                    <Button onClick={handleOpenCreate} title='crea un nuevo cultivo' variant={"primary"}>
                        <Plus className="size-5 text-white" /> <span className="text-white">Nuevo cultivo</span>
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
                        <p className="text-muted-foreground font-medium animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                                <CultivosTable
                                    cultivos={cultivos}
                                    onEdit={handleOpenEdit}
                                    onDelete={setDeleteId}
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

            <CultivoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cultivo={selectedCultivo}
                tipos={tipos}
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
                            ¿ELIMINAR CULTIVO?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Esta acción borrará permanentemente este cultivo. Los datos asociados podrían verse afectados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
                        >
                            Destruir Cultivo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Cultivos;