import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    Database
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
import { useCultivos } from '@/hooks/use-cultivos';
import { CultivosTable } from './components/CultivosTable';
import { CultivoModal } from './components/CultivoModal';
import type { Cultivo } from '@/types/cultivos';

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
        createCultivo,
        updateCultivo,
        deleteCultivo,
        isCreating,
        isUpdating
    } = useCultivos();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);

    const handleOpenCreate = () => {
        setSelectedCultivo(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cultivo: Cultivo) => {
        setSelectedCultivo(cultivo);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: any) => {
        if (selectedCultivo) {
            await updateCultivo({ id: selectedCultivo.id, data });
        } else {
            await createCultivo(data);
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
                                onDelete={deleteCultivo}
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
                onSubmit={handleSubmit}
                cultivo={selectedCultivo}
                tipos={tipos}
                isLoading={isCreating || isUpdating}
            />
        </div>
    );
};

export default Cultivos;