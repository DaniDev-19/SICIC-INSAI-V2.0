/**
 * Registro de Service Worker para capacidades PWA e instalabilidad en navegadores móviles/escritorio.
 * Incluye auto-actualización automática cuando se despliega una nueva versión.
 */
export function registerPWA() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const doRegister = () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado con éxito. Scope:', registration.scope);

        // Comprobar actualizaciones periódicamente y cuando la app vuelve a estar activa
        setInterval(() => {
          registration.update().catch(() => {});
        }, 1000 * 60 * 30); // Cada 30 minutos

        window.addEventListener('focus', () => {
          registration.update().catch(() => {});
        });

        // Detectar si hay una versión nueva disponible
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nueva versión detectada. Activando actualización automática...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[PWA] Error registrando Service Worker:', error);
      });

    // Cuando el nuevo Service Worker toma el control, recargar suavemente para aplicar la nueva versión
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  };

  if (document.readyState === 'complete') {
    doRegister();
  } else {
    window.addEventListener('load', doRegister);
  }
}
