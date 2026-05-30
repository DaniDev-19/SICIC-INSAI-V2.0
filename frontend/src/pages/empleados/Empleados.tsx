import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    Users,
    AlertTriangle,
    Download,
    Filter,
    Trash2,
    X
} from 'lucide-react';
import type { Empleado } from '@/types/empleados';
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
import { useEmpleados } from '@/hooks/use-empleados';
import Can from '@/components/auth/Can';
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import { EmpleadosTable } from './components/EmpleadosTable';
import { EmpleadoModal } from './components/EmpleadoModal';
import { EmpleadoDetalles } from './components/EmpleadoDetalles';

const Empleados: React.FC = () => {
    const navigate = useNavigate();
    const {
        empleados,
        pagination,
        catalogos,
        isLoading,
        search,
        departamentoId,
        statusLaboral,
        setPage,
        setLimit,
        setSearch,
        setDepartamentoId,
        setStatusLaboral,
        deleteEmpleado,
        exportEmpleados,
        exportEmpleadosPdf,
        isExporting,
        isDeleting
    } = useEmpleados();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
    const [selectedEmpleadoForDetails, setSelectedEmpleadoForDetails] = useState<Empleado | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    const handleOpenCreate = () => {
        setSelectedEmpleado(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (empleado: Empleado) => {
        setSelectedEmpleado(empleado);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteEmpleado(deleteId);
            setSelectedIds(prev => prev.filter(id => id !== deleteId));
            if (selectedEmpleadoForDetails?.id === deleteId) {
                setSelectedEmpleadoForDetails(null);
            }
            setDeleteId(null);
        }
    };

    const handleBulkDelete = async () => {
        try {
            // Por ahora eliminamos uno a uno hasta implementar el endpoint masivo en empleados
            for (const id of selectedIds) {
                await deleteEmpleado(id);
            }
            setSelectedIds([]);
            setIsBulkDeleteOpen(false);
        } catch (error) {
            console.error(error);
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
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Nómina de Empleados
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium pl-12">
                        Gestión centralizada del talento humano y personal operativo del INSAI.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
                        {/* Filtro por Departamento */}
                        <Select value={departamentoId} onValueChange={setDepartamentoId}>
                            <SelectTrigger
                                title="Filtrar por Departamento"
                                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
                            >
                                <Filter className={`size-4 ${departamentoId !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="sr-only">
                                    <SelectValue placeholder="Depto" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border rounded-xl top-9 right-15">
                                <SelectItem value="all" className="cursor-pointer font-bold">TODOS LOS DEPTOS</SelectItem>
                                {catalogos.departamentos.map(d => (
                                    <SelectItem key={d.id} value={d.id.toString()} className="cursor-pointer">
                                        {d.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Filtro por Estatus */}
                        <Select value={statusLaboral} onValueChange={setStatusLaboral}>
                            <SelectTrigger
                                title="Filtrar por Estatus"
                                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
                            >
                                <Users className={`size-4 ${statusLaboral !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="sr-only">
                                    <SelectValue placeholder="Estatus" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="glass-effect border-border rounded-xl top-9 right-15">
                                <SelectItem value="all" className="cursor-pointer font-bold">CUALQUIER ESTATUS</SelectItem>
                                <SelectItem value="ACTIVO" className="cursor-pointer text-emerald-600 font-bold">ACTIVO</SelectItem>
                                <SelectItem value="VACACIONES" className="cursor-pointer">VACACIONES</SelectItem>
                                <SelectItem value="REPOSO" className="cursor-pointer">REPOSO</SelectItem>
                                <SelectItem value="RETIRADO" className="cursor-pointer text-rose-600 font-bold">RETIRADO</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                        <div className="w-48 lg:w-64">
                            <SearchInput
                                placeholder="Buscar empleado..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClear={() => setSearch('')}
                                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                            />
                        </div>

                        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                        <ModuleToolbarActions
                            screen="empleados"
                            onExport={exportEmpleados}
                            onExportPdf={exportEmpleadosPdf}
                            exportTitle="Exportar en excel"
                            exportPdfTitle="Exportar en PDF"
                            onCreate={handleOpenCreate}
                            createLabel="Nuevo Registro"
                            createTitle="Inscribir nuevo empleado"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden glass-effect relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card/30 rounded-2xl border border-dashed m-6">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                            <Loader2 className="size-10 text-primary animate-spin" />
                        </div>
                        <p className="text-muted-foreground font-medium animate-pulse">Consultando base de datos...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                            <EmpleadosTable
                                empleados={empleados}
                                onEdit={handleOpenEdit}
                                onDelete={(id) => setDeleteId(id)}
                                onSelect={(empleado) => setSelectedEmpleadoForDetails(empleado.id === selectedEmpleadoForDetails?.id ? null : empleado)}
                                selectedId={selectedEmpleadoForDetails?.id}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                            />
                        </div>

                        <div className="px-6 py-5 border-t border-border bg-muted/20">
                            <Pagination
                                pagination={pagination}
                                onPageChange={setPage}
                                onLimitChange={setLimit}
                            />
                        </div>
                    </>
                )}
            </div>

            {selectedEmpleadoForDetails && (
                <EmpleadoDetalles
                    empleadoId={selectedEmpleadoForDetails.id}
                    empleadoNombre={selectedEmpleadoForDetails.nombre}
                />
            )}

            <EmpleadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                empleado={selectedEmpleado}
            />

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

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md rounded-3xl">
                    <AlertDialogHeader>
                        <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <AlertTriangle className="size-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
                            ¿Eliminar Registro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Esta acción borrará permanentemente la ficha del empleado y todas sus relaciones históricas en el sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-6">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer rounded-xl h-11">Conservar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20 rounded-xl h-11"
                        >
                            Eliminar Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk delete confirmation */}
            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md rounded-3xl">
                    <AlertDialogHeader>
                        <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                            <AlertTriangle className="size-8 text-rose-500" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
                            ¿Eliminar {selectedIds.length} Empleados?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center font-medium px-4">
                            Se eliminarán permanentemente las fichas de los empleados seleccionados y todas sus relaciones históricas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
                        <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Abortar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20 cursor-pointer"
                        >
                            {isDeleting ? <Loader2 className="animate-spin size-4" /> : 'Confirmar Purga'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Empleados;
