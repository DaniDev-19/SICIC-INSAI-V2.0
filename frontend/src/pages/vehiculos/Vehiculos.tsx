import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Loader2,
  Car,
  AlertTriangle,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { useVehiculos } from '@/hooks/use-vehiculos';
import { VehiculoTable } from './components/VehiculoTable';
import { VehiculoModal } from './components/VehiculoModal';
import type { Vehiculo } from '@/types/vehiculos';

const Vehiculos: React.FC = () => {
  const navigate = useNavigate();
  const {
    vehiculos,
    pagination,
    isLoading,
    setStatusFilter,
    setTipoFilter,
    setPage,
    setLimit,
    deleteVehiculo,
    deleteManyVehiculos,
  } = useVehiculos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeSelect, setTypeSelect] = useState<string>('all');
  const [statusSelect, setStatusSelect] = useState<string>('all');

  // Client-side search in addition to server-side filtering
  const filteredVehiculos = vehiculos.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.placa.toLowerCase().includes(term) ||
      (v.marca && v.marca.toLowerCase().includes(term)) ||
      (v.modelo && v.modelo.toLowerCase().includes(term)) ||
      (v.color && v.color.toLowerCase().includes(term));
    return matchesSearch;
  });

  const handleOpenCreate = () => {
    setSelectedVehiculo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setIsModalOpen(true);
  };

  const handleStatusChange = (val: string) => {
    setStatusSelect(val);
    setStatusFilter(val === 'all' ? '' : val);
    setPage(1);
  };

  const handleTipoChange = (val: string) => {
    setTypeSelect(val);
    setTipoFilter(val === 'all' ? '' : val);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteVehiculo(deleteId);
        // Clear delete selection if it was checked in the bulk list
        setSelectedIds((prev) => prev.filter((id) => id !== deleteId));
      } catch {
        // Handled by react-query mutation
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      try {
        await deleteManyVehiculos(selectedIds);
      } catch {
        // Handled by react-query mutation
      } finally {
        setSelectedIds([]);
        setIsBulkDeleteOpen(false);
      }
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVehiculos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVehiculos.map((v) => v.id));
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
              <Car className="size-8 text-primary" />
              Gestión de Vehículos
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Administra la flota de vehículos oficiales asignados a las planificaciones e inspecciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            {/* Filter: Tipo */}
            <Select value={typeSelect} onValueChange={handleTipoChange}>
              <SelectTrigger
                title="Filtrar por tipo"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
              >
                <Filter className={`size-4 ${typeSelect !== 'all' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="sr-only"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent className="glass-effect border-border rounded-xl">
                <SelectItem value="all" className="cursor-pointer font-bold">TODOS LOS TIPOS</SelectItem>
                <SelectItem value="CARRO" className="cursor-pointer font-medium">CARROS</SelectItem>
                <SelectItem value="MOTO" className="cursor-pointer font-medium">MOTOS</SelectItem>
                <SelectItem value="CAMIONETA" className="cursor-pointer font-medium">CAMIONETAS</SelectItem>
                <SelectItem value="OTRO" className="cursor-pointer font-medium">OTROS</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter: Estatus */}
            <Select value={statusSelect} onValueChange={handleStatusChange}>
              <SelectTrigger
                title="Filtrar por estatus"
                className="w-10 h-10 p-0 rounded-xl bg-background/80 border-border hover:bg-background hover:shadow-sm transition-all cursor-pointer justify-center [&>svg:last-child]:hidden"
              >
                <div className={`size-2.5 rounded-full ${statusSelect === 'all' ? 'bg-muted-foreground/60' : statusSelect === 'OPERATIVO' ? 'bg-emerald-500' : statusSelect === 'MANTENIMIENTO' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <span className="sr-only"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent className="glass-effect border-border rounded-xl">
                <SelectItem value="all" className="cursor-pointer font-bold">TODOS LOS ESTATUS</SelectItem>
                <SelectItem value="OPERATIVO" className="cursor-pointer text-emerald-600 font-bold">OPERATIVO</SelectItem>
                <SelectItem value="MANTENIMIENTO" className="cursor-pointer text-amber-600 font-bold">MANTENIMIENTO</SelectItem>
                <SelectItem value="INACTIVO" className="cursor-pointer text-rose-600 font-bold">INACTIVO</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="w-[200px] lg:w-[280px]">
              <SearchInput
                placeholder="Buscar por placa, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>
          </div>

          <Button onClick={handleOpenCreate} variant="primary" className="shadow-lg shadow-primary/20">
            <Plus className="size-5 text-white" /> <span className="text-white">Nuevo Vehículo</span>
          </Button>
        </div>
      </div>

      {/* Floating bulk delete bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-foreground text-background dark:bg-card dark:text-foreground px-6 py-4 rounded-2xl shadow-2xl border border-background/10 flex items-center gap-8 glass-effect">
            <div className="flex items-center gap-3 pr-8 border-r border-background/10 dark:border-foreground/10">
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
                className="rounded-full hover:bg-white/10 dark:hover:bg-foreground/10 cursor-pointer text-inherit"
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
            <p className="text-muted-foreground font-medium animate-pulse">Cargando flota de vehículos...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <VehiculoTable
                vehiculos={filteredVehiculos}
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

      <VehiculoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehiculo={selectedVehiculo}
      />

      {/* Alert for individual delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿Eliminar Vehículo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará permanentemente este vehículo. No se podrá eliminar si está actualmente asignado a una planificación de inspección activa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert for bulk delete */}
      <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿Eliminar {selectedIds.length} Vehículos?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Estás a punto de eliminar {selectedIds.length} vehículos de forma permanente. Aquellos vehículos asignados a planificaciones activas serán omitidos automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Abortar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg cursor-pointer shadow-rose-500/20"
            >
              Confirmar Purga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vehiculos;
