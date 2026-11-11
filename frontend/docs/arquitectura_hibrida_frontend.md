# Conectividad Híbrida y Resolución Dinámica de API — Frontend SICIZ-INSAI v2.0

Este documento describe cómo la capa frontend de **SICIZ-INSAI v2.0** (React + TypeScript + Vite + Capacitor + PWA) se conecta e interactúa de manera transparente con servidores locales expuestos mediante túneles Cloudflare Zero Trust o servidores alojados directamente en la nube.

---

## 1. Desacoplamiento y Entorno Dinámico

La interfaz web y móvil está diseñada para no depender de una dirección IP o dominio rígido. Puede ejecutarse:
* **En desarrollo local:** Conectándose a `http://localhost:4000/api`.
* **En producción web (Vercel / Cloudflare Pages):** Conectándose a través del túnel seguro de Cloudflare (`https://sicic-backend.zymtaxis.com/api`).
* **En la App Nativa de Android (Capacitor) y PWA:** Apuntando a la URL pública segura configurada en las variables de entorno.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENTS                                │
│   [Navegador Desktop]    [PWA en Teléfono]    [App Android / Capacitor]│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         getApiBaseUrl() & Axios
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CONFIGURACIÓN DINÁMICA (.env)                        │
│   VITE_API_URL="https://sicic-backend.zymtaxis.com/api"                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE ZERO TRUST                           │
│   Túnel seguro encriptado -> Servidor Físico INSAI (http://localhost:4000)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Utilidad Central de Enrutamiento Multimedia: `media-url.ts`

El módulo [`media-url.ts`](../src/lib/media-url.ts) resuelve de forma inteligente las rutas de imágenes, fotos de inspección, actas y marcas de hierros ganaderos:

```typescript
export function getApiBaseUrl(): string {
  // En desarrollo local en navegador, utiliza rutas relativas
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return '';
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/api\/?$/, '');
  }
  return '';
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return '';
  let trimmed = String(url).trim();
  if (!trimmed) return '';

  const apiBase = getApiBaseUrl();

  // Si la URL guardada en base de datos contiene /uploads/, 
  // garantiza que apunte al host actual configurado en VITE_API_URL
  if (trimmed.includes('/uploads/')) {
    const uploadRelative = trimmed.slice(trimmed.indexOf('/uploads/'));
    return apiBase ? `${apiBase}${uploadRelative}` : uploadRelative;
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) return `${apiBase}${trimmed}`;
  return `${apiBase}/${trimmed}`;
}
```

### ¿Por qué es fundamental esta lógica?
* **Evita Enlaces Rotos por Migración:** Si en la base de datos se almacenó una imagen como `http://localhost:4000/uploads/...` y luego el sistema se abre desde un teléfono móvil fuera de la red local, `resolveMediaUrl()` reescribe automáticamente la raíz al dominio público de Cloudflare (`https://sicic-backend.zymtaxis.com/uploads/...`).
* **Soporte Offline y Data URLs:** Respeta sin alterar las imágenes temporales en formato Base64 (`data:image/...`) y Blob URLs generadas en el dispositivo móvil antes de ser subidas al servidor.

---

## 3. Configuración de Variables de Entorno en el Frontend

En `frontend/.env`:

```env
# Modo Desarrollo Local Directo
# VITE_API_URL="http://localhost:4000/api"

# Modo Producción / Servidor Local vía Túnel Cloudflare
VITE_API_URL="https://sicic-backend.zymtaxis.com/api"

# Modo Producción Nube Completa
# VITE_API_URL="https://api-siciz.insai.gob.ve/api"
```

---

## 4. Interacción con PWA y Capacitor

* **En la PWA:** Los recursos estáticos (HTML, JS, CSS, iconos) se almacenan en el Service Worker. Las peticiones a `/api/...` viajan por red hacia el backend configurado.
* **En el APK de Capacitor:** El WebView de Android consume la URL remota definida en `VITE_API_URL`, permitiendo a los inspectores en campo registrar inspecciones directamente en el servidor central o local a través de Internet móvil (3G/4G/5G).

