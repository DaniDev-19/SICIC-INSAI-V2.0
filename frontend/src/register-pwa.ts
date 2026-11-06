/**
 * Registro de Service Worker para capacidades PWA e instalabilidad en navegadores móviles/escritorio.
 */
export function registerPWA() {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registrado exitosamente con scope:', registration.scope);
        })
        .catch((error) => {
          console.log('[PWA] Error registrando Service Worker:', error);
        });
    });
  }
}

