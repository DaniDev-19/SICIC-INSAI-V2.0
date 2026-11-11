# SICIZ-INSAI V2.0 - Interfaz de Usuario (Frontend)

Interfaz de usuario moderna, de alto rendimiento y orientada a dispositivos móviles (Mobile-First) para el Sistema Integral de Control de Insumos y Certificaciones (SICIZ) del INSAI. Desarrollada con React 19, TypeScript, Vite, Tailwind CSS v4, soporte móvil completo mediante Capacitor (APK Android) y Progressive Web App (PWA) auto-actualizable.

---

## Capacidades Móviles Nativas y PWA

El frontend de SICIZ-INSAI está preparado para el trabajo de campo de los inspectores mediante dos modalidades complementarias:

### 1. Progressive Web App (PWA) - Sin Instalación Forzada
* **Instalación en 1 Toque:** Al abrir el sistema desde el navegador en un teléfono móvil, se despliega automáticamente el banner institucional para añadir la aplicación a la pantalla de inicio.
* **Auto-actualización Instantánea:** Utiliza un Service Worker dedicado ([`public/sw.js`](./public/sw.js)) y Web App Manifest ([`public/manifest.json`](./public/manifest.json)). Cada vez que se despliega una nueva versión en el servidor, los dispositivos de campo se actualizan al instante sin descargar archivos externos ni perder configuraciones locales.
* **Navegación Móvil Táctil:** Barra inferior flotante ([`BottomNav.tsx`](./src/components/BottomNav.tsx)) adaptada a permisos y pantallas prioritarias para inspectores en terreno.

### 2. Capacitor - APK Nativo para Android
* **Empaquetado Nativo:** Proyecto Android integrado en [`frontend/android/`](./android) mediante Capacitor.
* **Acceso a Hardware:** Cámara para captura de evidencias fotográficas de inspecciones, geolocalización satelital para coordenadas UTM y visor nativo de archivos PDF.
* Consulta la **[Guía Oficial de Capacitor y PWA](./docs/CAPACITOR_PWA_GUIA.md)** para conocer los pasos de compilación con Android Studio y Gradle.

---

## Conectividad Híbrida: Nube y Servidor Local

El frontend se conecta de forma transparente a cualquier arquitectura de backend:
* **Entornos de Red Local / Túneles Cloudflare:** A través del resolvedor dinámico [`media-url.ts`](./src/lib/media-url.ts), el cliente reescribe y normaliza las URLs de imágenes, fotografías de inspecciones y marcas de hierro sin enlaces rotos, sin importar si el backend está en un servidor local expuesto por Cloudflare Zero Trust (`https://sicic-backend.zymtaxis.com/api`) o directamente en la nube.
* Consulta la **[Guía de Conectividad Híbrida Frontend](./docs/arquitectura_hibrida_frontend.md)** para detalles de configuración.

---

## Stack Tecnológico

* **Framework:** React 19 con TypeScript.
* **Build Tool:** Vite 7.x con compilación ultrarrápida.
* **Estilos:** Tailwind CSS v4 con utilidades personalizadas de efecto vidrio (`glass-effect`) y diseño Mobile-First.
* **Componentes UI:** Radix UI y Shadcn/ui para máxima accesibilidad.
* **Gestión de Estado y Servidor:** TanStack Query v5 (React Query) con invalidación optimista de caché.
* **Formularios y Validación:** React Hook Form + Zod.
* **Visualización de Datos:** Recharts para tableros analíticos y KPIs.
* **Generación de Reportes en Cliente:** `@react-pdf/renderer` para actas y fichas técnicas oficiales.

---

## Inicio Rápido

### 1. Instalación de Dependencias
```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en `frontend/`:
```env
# Conexión al backend (Local o Nube / Túnel Cloudflare)
VITE_API_URL="https://sicic-backend.zymtaxis.com/api"
```

### 3. Ejecución en Desarrollo
```bash
npm run dev
```

### 4. Compilación de Producción Web
```bash
npm run build
```

### 5. Compilación y Sincronización para Android (Capacitor)
```bash
# Compila el frontend y sincroniza con el proyecto Android
npm run cap:build

# Abre Android Studio para generar el archivo APK instalable
npm run cap:open
```

---

## Organización de Carpetas

```bash
frontend/
|-- android/                   # Proyecto nativo Android (Gradle, Manifest, Assets)
|-- public/                    # Iconos institucionales, Manifest PWA y Service Worker
|-- src/
|   |-- components/            # Layout, AppSidebar, BottomNav, UI components (Radix)
|   |-- hooks/                 # Hooks personalizados (useAuth, usePermissions, etc.)
|   |-- lib/                   # Utilidades de red, permisos, formateo y media-url
|   |-- pages/                 # Pantallas por modulo (Inspecciones, Avales, Silos, etc.)
|   |-- reports/               # Documentos oficiales imprimibles y plantillas PDF
|   |-- services/              # Clientes Axios y llamadas REST a endpoints
|   |-- types/                 # Interfaces y contratos de datos en TypeScript
|   |-- App.tsx                # Enrutador principal y control de permisos por ruta
|   +-- main.tsx               # Punto de entrada de React y registro de PWA
+-- docs/                      # Documentacion tecnica de la interfaz de usuario
```

---

## Índice de Documentación Técnica (`frontend/docs/`)

Para profundizar en los módulos y la arquitectura del frontend:

### Móvil y Conectividad Híbrida
* **[Guía Oficial de PWA y Generación de APK con Capacitor](./docs/CAPACITOR_PWA_GUIA.md):** Manual paso a paso para compilar el APK con Android Studio, arquitectura de la PWA, Service Worker y Web App Manifest.
* **[Conectividad Híbrida y Resolución Dinámica de API](./docs/arquitectura_hibrida_frontend.md):** Cómo se conecta el frontend con servidores locales a través de Cloudflare Zero Trust y cómo `media-url.ts` resuelve rutas multimedia.

### Autenticación, Seguridad y Roles
* **[Flujo de Autenticación y Sesiones](./docs/flujo-autenticacion.md):** Ciclo de vida del login, almacenamiento seguro del token JWT y selección de sede territorial.
* **[Flujo de Login con MFA (Autenticación en Dos Pasos)](./docs/flujo-mfa-login-frontend.md):** Pantallas de verificación de código TOTP de 6 dígitos y códigos de recuperación.
* **[Módulo de Perfil de Usuario y Gestión de MFA](./docs/modulo-perfil-mfa-frontend.md):** Activación de autenticador, escaneo de código QR y cambio de contraseña.
* **[Sistema de Roles, Permisos y Componente Can](./docs/roles-y-permisos.md):** Matriz dinámica de permisos (`see`, `create`, `update`, `delete`, `export`) y protección granular de botones y pantallas.
* **[Integración de Seguridad en el Frontend](./docs/integracion_seguridad_frontend.md):** Interceptores Axios, manejo centralizado de expiración de sesión y respuestas 401/403.

### Diseño, UI/UX y Navegación
* **[Guía de Modernización UI y Mobile-First](./docs/guia-ui-modernizacion.md):** Principios de diseño para pantallas táctiles, paleta de colores y componentes interactivos.
* **[Modernización de Barra Lateral y Navegación](./docs/modernizacion-sidebar-v2.md):** Sidebar colapsable con soporte de teclado y BottomNav dinámico.

### Módulos Operativos
* **[Módulo de Planificaciones e Inspecciones](./docs/modulo-planificaciones-inspecciones-frontend.md):** Comisión técnica con Inspector Jefe (código territorial y potestad exclusiva de vaciado), acompañantes en solo lectura, inspecciones pecuarias y de silos.
* **[Módulo de Avales Sanitarios](./docs/modulo-avales-sanitarios-frontend.md):** Carga dual de vacunas (inventario o manual), cálculo dinámico de vigencia en días, visor modal multi-especie y marcas de hierro ganadero.
* **[Módulo de Inventario y Kardex](./docs/modulo-inventario-kardex-frontend.md):** Catálogo maestro de insumos, stock por sede, movimientos de almacén y barra flotante de eliminación en lote.
* **[Módulo de Reportes, Métricas y Exportación](./docs/modulo-reportes-y-exportacion.md):** Filtros avanzados, tableros con Recharts y exportaciones PDF/Excel oficiales.
* **[Búsqueda Multi-término en Tablas](./docs/busqueda-multitermino-frontend.md):** Búsqueda reactiva con debounce en tablas y selectores.
* **[Bitácora y Auditoría de Acciones](./docs/bitacora-arquitectura-frontend.md):** Visor estructurado de cargas útiles (payloads) y cambios en datos.
* **[Gestión de Tipos y Archivos TypeScript](./docs/gestion_tipos_y_archivos.md):** Convenciones de tipado, DTOs y modelos de datos.
