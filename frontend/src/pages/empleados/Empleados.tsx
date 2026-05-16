import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Plus,
    Loader2,
    Users,
    AlertTriangle,
    FileDown,
    Building2,
    Filter
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
import { useEmpleados } from '@/hooks/use-empleados';
import { EmpleadosTable } from './components/EmpleadosTable';
import { EmpleadoModal } from './components/EmpleadoModal';

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
        isExporting
    } = useEmpleados();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
            setDeleteId(null);
        }
    };

    const handleExport = async () => {
        await exportEmpleados();
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
                            <SelectContent className="glass-effect border-border rounded-xl">
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
                            <SelectContent className="glass-effect border-border rounded-xl">
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

                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={handleExport} 
                            disabled={isExporting}
                            title="Exportar a Excel"
                            className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer"
                        >
                            {isExporting ? <Loader2 className="size-5 animate-spin" /> : <FileDown className="size-5" />}
                        </Button>
                    </div>

                    <Button onClick={handleOpenCreate} variant={"primary"} className="rounded-xl shadow-lg shadow-primary/20">
                        <Plus className="size-5 text-white mr-1" /> <span className="text-white">Nuevo Registro</span>
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden glass-effect relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
                
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

            <EmpleadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                empleado={selectedEmpleado}
            />

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
        </div>
    );
};

export default Empleados;
