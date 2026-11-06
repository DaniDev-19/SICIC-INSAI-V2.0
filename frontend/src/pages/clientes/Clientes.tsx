import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
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
import { ModuleToolbarActions } from '@/components/auth/ModuleToolbarActions';
import type { Cliente } from '@/types/clientes';
import { ProducerTable } from './components/ProducerTable';
import { ProducerWizard } from './components/ProducerWizard';
import { ProducerModal } from './components/ProducerModal';
import { ProducerDetallesModal } from './components/ProducerDetallesModal';

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
    exportClientesPdf,
  } = useClientes();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Cliente | null>(null);
  const [viewingProducerId, setViewingProducerId] = useState<number | null>(null);
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
    <div className="p-4 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-28 sm:pb-32 min-w-0 w-full overflow-hidden sm:overflow-visible">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6 border-b border-border/10 pb-4 md:pb-5">
          <div className="space-y-1.5 sm:space-y-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                className="shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Productores
              </h1>
            </div>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm md:text-base pl-2 sm:pl-12">
              Base de datos nacional de productores y clientes institucionales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:shrink-0 min-w-0">
            <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center justify-center md:justify-normal gap-2 bg-muted/30 p-2 sm:p-2.5 rounded-2xl border border-border backdrop-blur-sm shadow-lg ring-1 ring-white/10 min-w-0 w-full">
              <div className="flex-1 min-w-0 basis-full sm:basis-auto sm:min-w-48 lg:min-w-64">
                <SearchInput
                  placeholder="Nombre, Cédula o RIF..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  className="h-10 w-full rounded-xl border-border bg-background/80 shadow-sm transition-all focus-within:bg-background"
                />
              </div>

              <div className="h-6 w-px bg-border hidden sm:block shrink-0" />

              <ModuleToolbarActions
                screen="clientes"
                onExport={exportClientes}
                onExportPdf={exportClientesPdf}
                exportTitle="Exportar en excel"
                exportPdfTitle="Exportar en PDF"
                onCreate={() => setIsWizardOpen(true)}
                createLabel="Inscribir Productor"
                createTitle="Inscribir nuevo productor"
              />
            </div>
          </div>
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
                onView={(cliente) => setViewingProducerId(cliente.id)}
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

      <ProducerDetallesModal
        isOpen={!!viewingProducerId}
        onClose={() => setViewingProducerId(null)}
        producerId={viewingProducerId}
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
