import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Programa, TipoPrograma, CreateProgramaDto } from '@/types/programas';
import { Loader2, Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface ProgramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  programa?: Programa | null;
  tipos: TipoPrograma[];
  isLoading?: boolean;
  onCreateTipo?: (nombre: string) => Promise<any>;
  onUpdateTipo?: (args: { id: number; nombre: string }) => Promise<any>;
  onDeleteTipo?: (id: number) => Promise<any>;
}

export function ProgramaModal({
  isOpen,
  onClose,
  onSave,
  programa,
  tipos,
  isLoading,
  onCreateTipo,
  onUpdateTipo,
  onDeleteTipo
}: ProgramaModalProps) {
  const [formData, setFormData] = useState<CreateProgramaDto>({
    nombre: '',
    descripcion: '',
    tipo_programa_id: undefined,
  });

  const [showNewTipo, setShowNewTipo] = useState(false);
  const [newTipoNombre, setNewTipoNombre] = useState('');
  const [creatingTipo, setCreatingTipo] = useState(false);

  const [editingTipoId, setEditingTipoId] = useState<number | null>(null);
  const [editingTipoNombre, setEditingTipoNombre] = useState('');
  const [updatingTipoId, setUpdatingTipoId] = useState<number | null>(null);
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);

  useEffect(() => {
    if (programa) {
      setFormData({
        nombre: programa.nombre,
        descripcion: programa.descripcion || '',
        tipo_programa_id: programa.tipo_programa_id,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo_programa_id: undefined,
      });
    }
    setShowNewTipo(false);
    setEditingTipoId(null);
  }, [programa, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const handleCreateTipo = async () => {
    if (!newTipoNombre.trim() || !onCreateTipo) return;
    setCreatingTipo(true);
    try {
      await onCreateTipo(newTipoNombre.trim());
      setNewTipoNombre('');
      setShowNewTipo(false);
    } finally {
      setCreatingTipo(false);
    }
  };

  const handleUpdateTipo = async (id: number) => {
    if (!editingTipoNombre.trim() || !onUpdateTipo) return;
    setUpdatingTipoId(id);
    try {
      await onUpdateTipo({ id, nombre: editingTipoNombre.trim() });
      setEditingTipoId(null);
      setEditingTipoNombre('');
    } catch { /* error handled by hook */ } finally {
      setUpdatingTipoId(null);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    if (!onDeleteTipo) return;
    setDeletingTipoId(id);
    try {
      await onDeleteTipo(id);
    } catch { /* error handled by hook */ } finally {
      setDeletingTipoId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] glass-effect border-border shadow-2xl rounded-3xl overflow-hidden p-0">
        <form onSubmit={handleSubmit}>
          <div className="bg-primary/5 p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {programa ? 'Editar Programa' : 'Nuevo Programa'}
              </DialogTitle>
              <p className="text-muted-foreground text-sm font-medium">
                {programa ? 'Actualiza los datos del programa existente.' : 'Define un nuevo programa para el control fitosanitario.'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80 ml-1">
                Nombre del Programa
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Control de Plagas en Maíz"
                className="h-12 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80 ml-1">
                Tipo de Programa
              </Label>

              {showNewTipo && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Input
                    value={newTipoNombre}
                    onChange={(e) => setNewTipoNombre(e.target.value)}
                    placeholder="Nombre del nuevo tipo..."
                    className="h-9 rounded-lg text-sm border-primary/30 focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTipo())}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    disabled={creatingTipo || !newTipoNombre.trim()}
                    onClick={handleCreateTipo}
                    className="size-9 shrink-0 rounded-lg bg-primary text-white hover:bg-primary/90 cursor-pointer"
                  >
                    {creatingTipo ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setShowNewTipo(false); setNewTipoNombre(''); }}
                    className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              {editingTipoId !== null && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Input
                    value={editingTipoNombre}
                    onChange={(e) => setEditingTipoNombre(e.target.value)}
                    placeholder="Nuevo nombre del tipo..."
                    className="h-9 rounded-lg text-sm border-blue-500/30 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleUpdateTipo(editingTipoId); }
                      if (e.key === 'Escape') { setEditingTipoId(null); }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    disabled={!editingTipoNombre.trim() || updatingTipoId === editingTipoId}
                    onClick={() => handleUpdateTipo(editingTipoId)}
                    className="size-9 shrink-0 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                  >
                    {updatingTipoId === editingTipoId ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingTipoId(null); setEditingTipoNombre(''); }}
                    className="size-9 shrink-0 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Select
                  value={formData.tipo_programa_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, tipo_programa_id: parseInt(value) })}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-border rounded-2xl shadow-2xl max-h-[250px] min-w-var(--radix-select-trigger-width)" position="popper" sideOffset={2}>
                    {tipos.map((tipo) => (
                      <div key={tipo.id} className="group relative flex items-center">
                        <SelectItem value={tipo.id.toString()} className="rounded-xl cursor-pointer flex-1 pr-20">
                          {tipo.nombre}
                        </SelectItem>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 z-10">
                          <button
                            type="button"
                            disabled={deletingTipoId === tipo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTipoId(tipo.id);
                              setEditingTipoNombre(tipo.nombre);
                              setShowNewTipo(false);
                            }}
                            className="p-1 rounded hover:bg-blue-500/10 text-blue-500 cursor-pointer disabled:opacity-50"
                            title="Editar tipo"
                          >
                            <Pencil className="size-3" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingTipoId === tipo.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTipo(tipo.id);
                            }}
                            className="p-1 rounded hover:bg-rose-500/10 text-rose-500 cursor-pointer disabled:opacity-50"
                            title="Eliminar tipo"
                          >
                            {deletingTipoId === tipo.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {tipos.length === 0 && (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No hay tipos registrados. Usa el botón <strong>+</strong> para crear uno.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setShowNewTipo(!showNewTipo); setEditingTipoId(null); }}
                  className="size-12 shrink-0 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                  title="Crear nuevo tipo"
                >
                  <Plus className="size-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion" className="text-sm font-bold tracking-wide uppercase text-muted-foreground/80 ml-1">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalla los objetivos y alcance del programa..."
                className="min-h-[120px] rounded-2xl border-border bg-background/50 focus:bg-background transition-all shadow-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter className="bg-muted/30 p-6 border-t border-border/50 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl h-12 px-6 font-bold hover:bg-background transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl h-12 px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isLoading ? 'Guardando...' : programa ? 'Guardar Cambios' : 'Crear Programa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
