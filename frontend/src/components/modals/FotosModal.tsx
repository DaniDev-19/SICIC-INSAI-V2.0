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
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-4xl max-h-[92vh] flex flex-col p-0 border border-border/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden bg-background gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 bg-muted/40 border-b border-border/50 shrink-0 pr-12 sm:pr-14">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="size-9 sm:size-11 shrink-0 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <ImageIcon className="size-4 sm:size-5" />
              </div>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-[10px] sm:text-lg font-black uppercase tracking-wide">
                  {title}
                </DialogTitle>
                <DialogDescription className="wrap-break-words text-[10px] sm:text-xs text-muted-foreground">
                  {subtitle || `${fotos.length} evidencia(s) fotográfica(s) registrada(s)`}
                </DialogDescription>
              </div>
            </div>

            {canEdit && (
              <div className="shrink-0">
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
                  size="xs"
                  title='Agregar Nueva Evidencia'
                  disabled={fotos.length + selectedFiles.length >= 10 || isUploading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer gap-1 sm:gap-2 text-[11px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl"
                >
                  <Plus className="size-3.5 sm:size-4" />
                  <span className="hidden sm:inline">Agregar</span>
                  <span className="sm:hidden">Evidencia</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="p-3 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* New uploads preview queue if user selected files */}
          {selectedFiles.length > 0 && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Upload className="size-3.5 sm:size-4 animate-bounce" />
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
                    className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold text-muted-foreground hover:text-rose-500 px-2 sm:px-3"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveUploads}
                    disabled={isUploading}
                    className="h-7 sm:h-8 text-[11px] sm:text-xs font-black bg-primary hover:bg-primary/90 text-white gap-1 sm:gap-1.5 px-2.5 sm:px-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3 sm:size-3.5 animate-spin" /> Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3 sm:size-3.5" /> Guardar fotos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative size-16 sm:size-20 rounded-xl overflow-hidden border border-primary/30 group bg-black/40">
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
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center border-2 border-dashed border-border/60 rounded-2xl sm:rounded-3xl bg-muted/10 space-y-3">
              <div className="size-12 sm:size-16 rounded-xl sm:rounded-2xl bg-muted/30 flex items-center justify-center">
                <ImageIcon className="size-6 sm:size-8 text-muted-foreground/50" />
              </div>
              <p className="font-bold text-foreground text-xs sm:text-sm">No hay evidencias fotográficas cargadas</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground max-w-xs px-2">
                {canEdit
                  ? 'Haz clic en «Agregar fotos» arriba para adjuntar evidencias de la inspección.'
                  : 'Este registro no posee imágenes adjuntas.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 mx-auto">
              {/* Main Photo Showcase */}
              {currentFoto && (
                <div className="relative rounded-2xl sm:rounded-2xl overflow-hidden bg-black/90 border border-border/40 group h-60 xs:h-72 sm:h-96 md:h-100 flex items-center justify-center shadow-xl">
                  <img
                    src={resolveMediaUrl(currentFoto.imagen)}
                    title={`Evidencia número ${selectedIndex + 1}`}
                    alt={`Evidencia ${selectedIndex + 1}`}
                    className="cursor-pointer w-full h-full object-contain select-none transition-all duration-300"
                    onClick={() => {
                      if (currentFoto.id) {
                        const url = resolveMediaUrl(currentFoto.imagen);
                        window.open(url, '_blank', 'noopener noreferrer');
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.img-error-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />

                  {/* Fallback de error si la imagen no carga */}
                  <div className="img-error-fallback hidden flex-col items-center justify-center p-6 text-center text-muted-foreground gap-2">
                    <AlertTriangle className="size-8 text-amber-500 animate-pulse" />
                    <p className="text-xs font-bold text-white">No se pudo cargar la imagen</p>
                    <a
                      href={resolveMediaUrl(currentFoto.imagen)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary hover:underline underline-offset-2 flex items-center gap-1 mt-1"
                    >
                      Abrir enlace directo <ExternalLink className="size-3" />
                    </a>
                  </div>

                  {/* Top Bar Actions on Image */}
                  <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex items-center gap-1.5 sm:gap-2 opacity-95 group-hover:opacity-100 transition-opacity z-10">
                    <a
                      href={resolveMediaUrl(currentFoto.imagen)}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir en pestaña nueva"
                      className="size-8 sm:size-9 rounded-lg sm:rounded-xl bg-black/70 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors shadow-md"
                    >
                      <ExternalLink className="size-3.5 sm:size-4" />
                    </a>

                    {canEdit && (
                      <Button
                        size="icon"
                        variant="destructive"
                        title="Eliminar esta foto"
                        onClick={() => setConfirmDeleteId(currentFoto.id)}
                        disabled={deletingId === currentFoto.id}
                        className="size-8 sm:size-9 rounded-lg sm:rounded-xl shadow-md cursor-pointer"
                      >
                        {deletingId === currentFoto.id ? (
                          <Loader2 className="size-3.5 sm:size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5 sm:size-4" />
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
                        className="absolute left-2 size-8 sm:size-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-md z-10 active:scale-95"
                      >
                        <ChevronLeft className="size-5 sm:size-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIndex((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))
                        }
                        className="absolute right-2 size-8 sm:size-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-md z-10 active:scale-95"
                      >
                        <ChevronRight className="size-5 sm:size-6" />
                      </button>
                    </>
                  )}

                  {/* Bottom Counter Badge */}
                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[12px] sm:text-xs font-bold tracking-wider z-10">
                    {selectedIndex + 1} de {fotos.length}
                  </div>
                </div>
              )}

              {/* Thumbnails Bar */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                {fotos.map((foto, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div key={foto.id} className="relative shrink-0 group p-1 mx-2">
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                          'relative size-16 sm:size-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer block bg-black/40',
                          isSelected
                            ? 'border-primary ring-3 ring-primary/30 scale-105 shadow-md'
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
                          className="absolute -top-1 -right-1 size-5 sm:size-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                        >
                          <X className="size-3 sm:size-3.5" />
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
