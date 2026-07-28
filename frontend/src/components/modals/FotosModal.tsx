import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveMediaUrl } from '@/lib/media-url';
import { toast } from 'sonner';

export interface FotoItem {
  id: number;
  imagen: string;
  created_at?: string;
}

interface FotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fotos: FotoItem[];
  onUploadPhotos: (newFiles: File[]) => Promise<void>;
  onDeletePhoto: (fotoId: number) => Promise<void>;
  canEdit?: boolean;
}

export function FotosModal({
  isOpen,
  onClose,
  title,
  subtitle,
  fotos = [],
  onUploadPhotos,
  onDeletePhoto,
  canEdit = true,
}: FotosModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset selected index if fotos array length changes
  useEffect(() => {
    if (selectedIndex >= fotos.length) {
      setSelectedIndex(Math.max(0, fotos.length - 1));
    }
  }, [fotos.length, selectedIndex]);

  // Clean up blob URLs when preview state changes
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check photo limits (max 10 total)
    if (fotos.length + selectedFiles.length + files.length > 10) {
      toast.error('El límite total es de 10 fotografías por registro.');
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveUploads = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      await onUploadPhotos(selectedFiles);
      toast.success(`${selectedFiles.length} foto(s) subida(s) con éxito.`);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error: any) {
      toast.error(error.message || 'Error al subir las fotografías');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteExisting = async (fotoId: number) => {
    setDeletingId(fotoId);
    try {
      await onDeletePhoto(fotoId);
      toast.success('Fotografía eliminada correctamente.');
      setConfirmDeleteId(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la fotografía');
    } finally {
      setDeletingId(null);
    }
  };

  const currentFoto = fotos[selectedIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-4xl max-h-[min(94vh,54rem)] overflow-y-auto border-none shadow-2xl glass-effect p-0 custom-scrollbar">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 bg-muted/40 border-b border-border/50 sticky top-0 backdrop-blur-md z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <ImageIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-wide truncate">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {subtitle || `${fotos.length} evidencia(s) fotográfica(s) registrada(s)`}
                </DialogDescription>
              </div>
            </div>

            {canEdit && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="sm"
                  disabled={fotos.length + selectedFiles.length >= 10 || isUploading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer gap-2 text-xs"
                >
                  <Plus className="size-4" />
                  Agregar fotos
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-6">
          {/* New uploads preview queue if user selected files */}
          {selectedFiles.length > 0 && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Upload className="size-4 animate-bounce" />
                  Fotos listas para guardar ({selectedFiles.length})
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      previews.forEach((url) => URL.revokeObjectURL(url));
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    disabled={isUploading}
                    className="h-8 text-xs font-bold text-muted-foreground hover:text-rose-500"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveUploads}
                    disabled={isUploading}
                    className="h-8 text-xs font-black bg-primary hover:bg-primary/90 text-white gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" /> Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" /> Guardar fotos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative size-20 rounded-xl overflow-hidden border border-primary/30 group">
                    <img src={url} alt="Nuevo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      disabled={isUploading}
                      className="absolute top-1 right-1 size-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Photos View */}
          {fotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/10 space-y-3">
              <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground/50" />
              </div>
              <p className="font-bold text-foreground text-sm">No hay evidencias fotográficas cargadas</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {canEdit
                  ? 'Haz clic en «Agregar fotos» arriba para adjuntar evidencias de la inspección.'
                  : 'Este registro no posee imágenes adjuntas.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Main Photo Showcase */}
              {currentFoto && (
                <div className="relative rounded-3xl overflow-hidden bg-black/95 border border-border/40 group min-h-[20rem] max-h-[28rem] flex items-center justify-center shadow-xl">
                  <img
                    src={resolveMediaUrl(currentFoto.imagen)}
                    alt={`Evidencia ${selectedIndex + 1}`}
                    className="max-h-[28rem] w-auto object-contain select-none transition-all duration-300"
                  />

                  {/* Top Bar Actions on Image */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <a
                      href={resolveMediaUrl(currentFoto.imagen)}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir en pestaña nueva"
                      className="size-9 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <ExternalLink className="size-4" />
                    </a>

                    {canEdit && (
                      <Button
                        size="icon"
                        variant="destructive"
                        title="Eliminar esta foto"
                        onClick={() => setConfirmDeleteId(currentFoto.id)}
                        disabled={deletingId === currentFoto.id}
                        className="size-9 rounded-xl shadow-md cursor-pointer"
                      >
                        {deletingId === currentFoto.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Left / Right Carousel Controls */}
                  {fotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : fotos.length - 1))
                        }
                        className="absolute left-3 size-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="size-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIndex((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))
                        }
                        className="absolute right-3 size-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                      >
                        <ChevronRight className="size-6" />
                      </button>
                    </>
                  )}

                  {/* Bottom Counter Badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold tracking-wider">
                    {selectedIndex + 1} de {fotos.length}
                  </div>
                </div>
              )}

              {/* Thumbnails Bar */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {fotos.map((foto, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div key={foto.id} className="relative shrink-0 group">
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                          'relative size-20 sm:size-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer block',
                          isSelected
                            ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-md'
                            : 'border-border/50 opacity-70 hover:opacity-100'
                        )}
                      >
                        <img
                          src={resolveMediaUrl(foto.imagen)}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(foto.id);
                          }}
                          title="Eliminar foto"
                          className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Delete Dialog Overlay */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-rose-500/20 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="size-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="size-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-black text-lg">¿Eliminar esta fotografía?</h4>
                <p className="text-xs text-muted-foreground">
                  Esta acción no se puede deshacer y borrará el archivo de evidencia.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletingId !== null}
                  className="font-bold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteExisting(confirmDeleteId)}
                  disabled={deletingId !== null}
                  className="font-black cursor-pointer shadow-md shadow-rose-500/20 gap-1.5"
                >
                  {deletingId === confirmDeleteId ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
