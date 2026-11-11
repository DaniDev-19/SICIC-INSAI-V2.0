# SICIZ-INSAI V2.0
### Sistema de Información para el Control de Insumos y Certificaciones

[![Vercel](https://img.shields.io/badge/Production-Live-success?logo=vercel&logoColor=white)](https://sicic-insai-v2-0.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v17+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## Sobre el Proyecto

SICIZ-INSAI V2.0 es la plataforma integral de gestión fitosanitaria y zoosanitaria del Instituto Nacional de Salud Agrícola Integral (INSAI). El sistema centraliza y digitaliza el ciclo operativo de las inspecciones agrícolas y ganaderas en Venezuela, garantizando trazabilidad total de las actividades de campo, control de inventario de biológicos y emisión oficial de avales y actas.

La versión 2.0 unifica el ecosistema bajo una arquitectura Multi-Tenant dinámica, soporte para despliegue híbrido (servidor local seguro con túneles Cloudflare Zero Trust o despliegue completo en la nube) y compatibilidad móvil dual mediante Progressive Web App (PWA) y empaquetado nativo con Capacitor para Android.

---

## Evolución del Sistema

| Versión | Enfoque | Logros Clave |
| :--- | :--- | :--- |
| **V1.0** | Digitalización Inicial | Sentó las bases del modelo de datos fitosanitario y el registro básico de inspecciones. |
| **V2.0 (Actual)** | **Sistema Integral - SICIZ** | Arquitectura Multi-Tenant dinámica, conectividad híbrida con Cloudflare Zero Trust, soporte PWA/Capacitor, control granular de roles y permisos (RBAC), kardex de insumos y reportes PDF/Excel oficiales. |

---

## Arquitectura del Ecosistema

El proyecto se estructura en dos capas principales totalmente desacopladas:

```
SICIC-INSAI-V2.0/
|-- backend/                 # API REST, Logica de Negocio y Multi-Tenancia
|   |-- docs/                # Documentacion tecnica especializada de backend
|   +-- README.md            # Guia y manual de referencia del backend
|-- frontend/                # Aplicacion React, TypeScript, Vite, PWA y Capacitor
|   |-- android/             # Proyecto nativo Android (Gradle / APK)
|   |-- docs/                # Documentacion tecnica especializada de frontend
|   +-- README.md            # Guia y manual de referencia del frontend
+-- README.md                # Indice general del repositorio
```

---

## Modelo de Despliegue Híbrido (Nube y Servidor Local)

El sistema soporta operación flexible según los requerimientos de conectividad e infraestructura de la institución:

1. **Servidor Local con Conector Cloudflare Zero Trust:**
   * El backend y la base de datos PostgreSQL residen en la infraestructura física institucional en la red local (`http://localhost:4000`).
   * El servicio `cloudflared` establece un túnel encriptado saliente hacia la red de Cloudflare sin requerir apertura de puertos en el router, IP pública estática ni configuraciones de firewall complejas.
   * La API se expone al exterior de forma protegida bajo el dominio institucional (por ejemplo, `https://sicic-backend.zymtaxis.com/api`).

2. **Despliegue Completo en la Nube:**
   * El backend puede alojarse en contenedores Docker o plataformas PaaS/VPS (como Render, Railway o AWS).
   * Bases de datos PostgreSQL gestionadas en la nube (Neon, Supabase o RDS).
   * Almacenamiento de archivos mediante Cloudflare R2 o buckets compatibles con S3 (`STORAGE_MODE=r2`).

3. **Frontend Desacoplado:**
   * Alojadable en Vercel, Cloudflare Pages o servido directamente desde el servidor local.
   * La utilidad `media-url.ts` resuelve automáticamente las rutas multimedia adaptándose al entorno de ejecución.

---

## Ecosistema Móvil para Inspectores de Campo

Para facilitar el registro de inspecciones en zonas rurales o de difícil acceso, el frontend cuenta con soporte móvil dual:

1. **Progressive Web App (PWA):**
   * Instalable directamente desde el navegador (Google Chrome, Edge, Safari) con un solo toque mediante el banner institucional.
   * Actualización automática en segundo plano mediante Service Worker sin requerir descargas manuales de nuevos archivos ni intervención técnica.
   * Interfaz optimizada con enfoque Mobile-First y barra de navegación inferior táctil.

2. **Aplicacion Nativa Android (Capacitor):**
   * Empaquetado nativo mediante Capacitor en la carpeta `frontend/android/`.
   * Integración con la cámara del dispositivo para captura de evidencias fotográficas georreferenciadas y soporte de almacenamiento local.
   * Compilable directamente a formato APK mediante Gradle y Android Studio.

---

## Stack Tecnologico Global

### Backend
* **Runtime:** Node.js (v18+) con Express.js 5.x.
* **Bases de Datos:** PostgreSQL con arquitectura dual (Base de Datos Master `db_sicic_insai_master` y Bases Operativas por sede territorial).
* **ORM:** Prisma 6.x con generación dual de clientes.
* **Seguridad:** JWT, bcrypt, Rate Limiting progresivo, Helmet, CORS dinámico y middleware de idempotencia.
* **Validacion:** Zod.
* **Trazabilidad:** Bitácora inmutable de eventos y sistema de notificaciones por correo.

### Frontend
* **Framework:** React 19 con TypeScript.
* **Herramienta de Construccion:** Vite 7.x.
* **Estilos:** Tailwind CSS v4 con diseno Mobile-First y efecto vidrio institucional.
* **Componentes:** Radix UI y Shadcn/ui.
* **Estado y Cache:** TanStack Query v5 (React Query).
* **Móvil:** Capacitor 8.x + Service Worker PWA.
* **Reportes:** Generación de documentos oficiales PDF con `@react-pdf/renderer` y exportaciones tabulares.

---

## Inicio Rapido

### 1. Requisitos Previos
* Node.js (v18 o superior).
* PostgreSQL (v16 o superior).
* Gestor de paquetes npm.
* Android Studio con JDK 17/21 (requerido únicamente si se compilará el APK nativo).

### 2. Clonacion
```bash
git clone https://github.com/DaniDev-19/SICIC-INSAI-V2.0.git
cd SICIC-INSAI-V2.0
```

### 3. Instalacion y Puesta en Marcha
Consulte los manuales específicos de cada componente para instrucciones detalladas:
* **[Manual y Documentacion del Backend](./backend/README.md)**
* **[Manual y Documentacion del Frontend](./frontend/README.md)**

---

## Documentacion Detallada

* **Backend:** Consulte el [Indice de Documentacion de Backend](./backend/README.md#indice-de-documentacion-tecnica-backenddocs) para guías sobre arquitectura, roles, túneles y multi-tenancia.
* **Frontend:** Consulte el [Indice de Documentacion de Frontend](./frontend/README.md#indice-de-documentacion-tecnica-frontenddocs) para guías sobre Capacitor, PWA, interfaz mobile-first y componentes UI.
