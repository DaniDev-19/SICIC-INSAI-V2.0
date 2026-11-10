import { useState, useEffect, useCallback } from 'react';

// Tipado para el evento de instalación BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar si la app ya está corriendo en modo standalone (instalada)
  const checkIfInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    return isStandalone;
  }, []);

  useEffect(() => {
    // 1. Si ya está instalada, no es necesario mostrar el banner
    if (checkIfInstalled()) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // 2. Verificar si el usuario ya descartó el banner en esta sesión
    const dismissedSession = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissedSession === 'true') {
      setIsDismissed(true);
    }

    // 3. Escuchar evento `beforeinstallprompt` (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir el banner por defecto del navegador para usar el banner institucional personalizado
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    // Detectar si es dispositivo móvil (Android, iOS, tablet) para siempre ofrecer la instalación PWA
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    if (isMobile && !checkIfInstalled() && dismissedSession !== 'true') {
      setIsInstallable(true);
    }

    // 4. Escuchar evento `appinstalled` cuando el usuario completa la instalación
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      sessionStorage.removeItem('pwa_banner_dismissed');
    };

    // 5. Escuchar cambios en modo de visualización (por si se instala mientras la página está abierta)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setIsInstallable(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, [checkIfInstalled]);

  // Función para activar el prompt de instalación nativo
  const installApp = async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      return choice.outcome;
    } catch (err) {
      console.error('[PWA] Error durante el proceso de instalación:', err);
      return 'dismissed';
    }
  };

  // Descartar el banner temporalmente
  const dismissBanner = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return {
    isInstallable: isInstallable && !isInstalled && !isDismissed,
    isInstalled,
    isDismissed,
    installApp,
    dismissBanner,
  };
}
