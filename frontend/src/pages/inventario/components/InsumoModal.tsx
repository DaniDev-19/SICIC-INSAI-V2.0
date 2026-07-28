import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Loader2, Barcode, Tag, Ruler } from 'lucide-react';
import type { Insumo, CategoriaInsumo, UnidadMedida, CreateInsumoDTO } from '@/types/inventario';

interface InsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumo?: Insumo | null;
  categorias: CategoriaInsumo[];
  unidades: UnidadMedida[];
  onSave: (data: CreateInsumoDTO) => Promise<void>;
}

export function InsumoModal({
  isOpen,
  onClose,
  insumo,
  categorias,
  unidades,
  onSave,
}: InsumoModalProps) {
  const isEditing = Boolean(insumo);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [unidadMedidaId, setUnidadMedidaId] = useState<string>('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (insumo) {
        setCodigo(insumo.codigo || '');
        setNombre(insumo.nombre || '');
        setMarca(insumo.marca || '');
        setCategoriaId(insumo.categoria_id ? String(insumo.categoria_id) : '');
        setUnidadMedidaId(insumo.unidad_medida_id ? String(insumo.unidad_medida_id) : '');
        setDescripcion(insumo.descripcion || '');
      } else {
        setCodigo('');
        setNombre('');
        setMarca('');
        setCategoriaId('');
        setUnidadMedidaId('');
        setDescripcion('');
      }
    }
  }, [isOpen, insumo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        codigo: codigo.trim() || undefined,
        nombre: nombre.trim(),
        marca: marca.trim() || undefined,
        categoria_id: categoriaId ? Number(categoriaId) : null,
        unidad_medida_id: unidadMedidaId ? Number(unidadMedidaId) : null,
        descripcion: descripcion.trim() || undefined,
      });
      onClose();
    } catch (error) {
      // Handled by hook error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[750px] max-w-4xl bg-background/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col max-h-[min(92vh,48rem)]">
        <DialogHeader className="space-y-2 p-6 pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Package className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {isEditing ? 'Editar Insumo Maestro' : 'Nuevo Insumo de Inventario'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {isEditing
                  ? 'Modifique los datos del producto o insumo registrado.'
                  : 'Complete los datos para agregar un nuevo insumo al catálogo global.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Código */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <Barcode className="size-3.5" />
                  Código SKU / Ref
                </label>
                <Input
                  placeholder="Ej. VAC-001"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="h-10 bg-background/80 rounded-xl"
                />
              </div>

              {/* Marca */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <Tag className="size-3.5" />
                  Marca / Fabricante
                </label>
                <Input
                  placeholder="Ej. Pfizer / AgroInsai"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="h-10 bg-background/80 rounded-xl"
                />
              </div>
            </div>

            {/* Nombre Insumo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Nombre del Insumo <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                placeholder="Ej. Vacuna Aftosa Trivalente 50ml"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="h-10 bg-background/80 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Categoría */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Categoría</label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger className="h-10 bg-background/80 rounded-xl font-medium">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-52">
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unidad de Medida */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                  <Ruler className="size-3.5" />
                  Unidad de Medida
                </label>
                <Select value={unidadMedidaId} onValueChange={setUnidadMedidaId}>
                  <SelectTrigger className="h-10 bg-background/80 rounded-xl font-medium">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="glass-effect max-h-52">
                    {unidades.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.nombre} {u.abreviatura ? `(${u.abreviatura})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Descripción / Especificaciones</label>
              <Textarea
                placeholder="Detalles sobre temperatura de conservación, principios activos o dosis recomendada..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="bg-background/80 rounded-xl resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/30 bg-muted/10 shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl h-10 px-4 text-xs cursor-pointer font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nombre.trim()}
              className="rounded-xl h-10 px-5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 cursor-pointer font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar Cambios'
              ) : (
                'Registrar Insumo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
