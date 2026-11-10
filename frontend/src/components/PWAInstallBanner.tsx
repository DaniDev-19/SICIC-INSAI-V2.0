import { useState } from 'react';
import { Smartphone, X, Sparkles, CheckCircle2, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { toast } from 'sonner';

export function PWAInstallBanner() {
  const { isInstallable, installApp, dismissBanner } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // Si no es instalable (ya está instalada, ya se descartó, o no aplica), no renderizar nada
  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    const result = await installApp();
    setIsInstalling(false);

    if (result === 'unsupported') {
      // Si el navegador no soporta el prompt directo (por ejemplo iOS Safari o HTTP en red local)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        setShowIOSGuide(true);
      } else {
        setShowAndroidGuide(true);
      }
    } else if (result === 'accepted') {
      toast.success('¡Aplicación instalada exitosamente en tu dispositivo!');
    }
  };

  return (
    <>
      {/* ── BANNER PRINCIPAL FLOTANTE ADAPTADO A LA UI (MOBILE FIRST) ── */}
      <aside
        aria-label="Aviso de instalación de la aplicación PWA"
        className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-500"
      >
        <div className="relative rounded-3xl border border-emerald-500/30 bg-background/95 dark:bg-card/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-emerald-500/10 space-y-3.5">
          {/* Botón Cerrar / Descartar */}
          <button
            onClick={dismissBanner}
            className="absolute top-3.5 right-3.5 size-7 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar aviso"
          >
            <X className="size-3.5" />
            <span className="sr-only">Cerrar aviso</span>
          </button>

          {/* Cabecera con Logo Institucional y Títulos */}
          <div className="flex items-start gap-3.5 pr-6">
            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/icon-192.png"
                alt="Logo SICIZ-INSAI"
                className="size-full object-contain"
                onError={(e) => {
                  // Fallback a icon2.ico si icon-192 tarda en cargar
                  (e.target as HTMLImageElement).src = '/icon2.ico';
                }}
              />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider">
                  PWA Instalable
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-500" />
                  Auto-actualizable
                </span>
              </div>

              <h4 className="text-sm font-black text-foreground tracking-tight leading-tight">
                Instalar Aplicación SICIZ-INSAI
              </h4>

              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                Instala la App en tu dispositivo para navegar a pantalla completa, sin descargas manuales y con actualización automática instantánea.
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 pt-0.5">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 cursor-pointer gap-2 transition-all hover:scale-[1.01]"
            >
              <Smartphone className="size-4 shrink-0" />
              <span>Instalar en el dispositivo</span>
            </Button>

            <Button
              onClick={dismissBanner}
              variant="ghost"
              className="h-10 px-3 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Ahora no
            </Button>
          </div>
        </div>
      </aside>

      {/* ── MODAL DE GUÍA PARA DISPOSITIVOS ANDROID (CHROME) ── */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-background p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Smartphone className="size-4 text-emerald-500" />
                Instalar en tu teléfono (Android)
              </h5>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="size-7 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Toca el menú de tres puntos (<strong>⋮</strong>) arriba a la derecha en <strong>Google Chrome</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Selecciona <strong>"Instalar y crear acceso directo"</strong> o <strong>"Crear acceso directo"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Toca <strong>Crear</strong>. La app se agregará a tu pantalla principal con el icono oficial y abrirá directamente en el Login.
                </span>
              </li>
            </ol>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-400">
              💡 <em>En servidores con HTTPS / SSL activo, la instalación se realiza automáticamente en 1 toque.</em>
            </div>

            <Button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full h-10 rounded-xl bg-primary text-white font-bold text-xs cursor-pointer"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Entendido
            </Button>
          </div>
        </div>
      )}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/80 bg-background p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Smartphone className="size-4 text-emerald-500" />
                Cómo instalar en iPhone / iPad
              </h5>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="size-7 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  Presiona el botón <strong>Compartir</strong> <Share className="inline size-3.5 text-blue-500 mx-1" /> en la barra inferior de Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  Desplázate hacia abajo y selecciona <strong>"Agregar a la pantalla de inicio"</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span>
                  Toca <strong>Agregar</strong> arriba a la derecha. ¡Listo!
                </span>
              </li>
            </ol>

            <Button
              onClick={() => setShowIOSGuide(false)}
              className="w-full h-10 rounded-xl bg-primary text-white font-bold text-xs"
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Entendido
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
