import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Loader2,
  AlertTriangle,
  Download,
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
import { useClientes } from '@/hooks/use-clientes';
import type { Cliente } from '@/types/clientes';
import { ProducerTable } from './components/ProducerTable';
import { ProducerWizard } from './components/ProducerWizard';
import { ProducerModal } from './components/ProducerModal';

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const {
    clientes,
    pagination,
    isLoading,
    search,
    setPage,
    setLimit,
    setSearch,
    deleteCliente,
    exportClientes,
  } = useClientes();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleEdit = (cliente: Cliente) => {
    setEditingProducer(cliente);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteCliente(deleteId);
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
              Productores
            </h1>
          </div>
          <p className="text-muted-foreground font-medium pl-12">
            Base de datos nacional de productores y clientes institucionales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-nowrap gap-2 bg-muted/30 p-2 rounded-2xl border border-border backdrop-blur-sm shadow-xl ring-1 ring-white/10">
            <div className="w-full sm:w-[18rem] lg:w-[22rem]">
              <SearchInput
                placeholder="Nombre, Cédula o RIF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClear={() => setSearch('')}
                className="h-10 rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
              />
            </div>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <Button title='Exportar en excel' variant="ghost" size="icon" onClick={exportClientes} className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer">
              <Download className="size-5" />
            </Button>
          </div>

          <Button onClick={() => setIsWizardOpen(true)} title="Inscribir nuevo productor" variant="primary">
            <Plus className="size-5 text-white" /> <span className="text-white">Inscribir Productor</span>
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
            <p className="text-muted-foreground font-medium animate-pulse italic uppercase tracking-widest text-xs">Cargando base de datos...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <ProducerTable
                clientes={clientes}
                onEdit={handleEdit}
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

      <ProducerWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      <ProducerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProducer(null);
        }}
        producer={editingProducer}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-effect border-rose-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertTriangle className="size-8 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center italic uppercase leading-tight">
              ¿ELIMINAR PRODUCTOR?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium px-4">
              Esta acción borrará al productor de la base de datos. Si tiene predios asociados, el sistema bloqueará la eliminación para preservar la integridad histórica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-4">
            <AlertDialogCancel className="font-bold border-none bg-muted/50 hover:bg-muted cursor-pointer">Mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clientes;
