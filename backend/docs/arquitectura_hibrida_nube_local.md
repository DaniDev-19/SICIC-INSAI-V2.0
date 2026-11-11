# Arquitectura Híbrida: Despliegue en Nube, Servidor Local y Cloudflare Zero Trust — SICIZ-INSAI v2.0

Este documento detalla la arquitectura de infraestructura híbrida del backend de **SICIZ-INSAI v2.0**, explicando cómo el sistema puede operar de manera versátil: completamente en la nube, en una red local con salida segura a Internet, o en un modelo mixto con túneles encriptados.

---

## 1. Visión General de la Arquitectura Híbrida

El ecosistema está desacoplado y preparado para funcionar bajo tres escenarios de despliegue según los requerimientos de soberanía de datos y disponibilidad institucional:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENTES Y APLICATIVOS                          │
│   (App Móvil Android / Capacitor, PWA de Campo, Navegadores Web)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE EDGE & NETWORK                         │
│       - DNS Seguro: zymtaxis.com                                       │
│       - Cloudflare Zero Trust: Túnel Encriptado Bidireccional          │
│       - Protección DDoS, WAF y SSL Automático                          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
     [Opción A: Servidor Local]           [Opción B: Servidor Nube]
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│ SERVIDOR FÍSICO / INSTITUCIONAL      │ │ CLOUD VPS / INSTANCIA         │
│ - Conector: `cloudflared`            │ │ - Despliegue en Docker/Render │
│ - Backend Core: Node.js (Puerto 4000)│ │ - Backend Core (Puerto 4000)  │
│ - PostgreSQL Local (5432):           │ │ - PostgreSQL Cloud (RDS/Neon) │
│   * db_sicic_insai_master            │ │   * db_sicic_insai_master     │
│   * db_insai_operativa               │ │   * db_insai_operativa        │
│ - Almacenamiento Local:              │ │ - Almacenamiento Nube:        │
│   * backend/uploads/                 │ │   * Cloudflare R2 / AWS S3    │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Despliegue en Servidor Local con Cloudflare Zero Trust (Túneles)

### ¿Cómo funciona el túnel?
A diferencia del reenvío de puertos tradicional (port-forwarding), que requiere abrir puertos en el router (`NAT`), exponer la IP pública del servidor y contratar IPs estáticas:
* El agente de Cloudflare (`cloudflared`) se instala directamente en el servidor local.
* Inicia conexiones **salientes** hacia los centros de datos globales de Cloudflare a través de conexiones seguras y encriptadas.
* Cualquier petición externa dirigida a `https://sicic-backend.zymtaxis.com` llega primero a Cloudflare, pasa por el firewall y viaja a través del túnel seguro hasta el `http://localhost:4000` de la máquina local.

### Reglas críticas de configuración en Cloudflare Zero Trust
Al registrar una aplicación publicada en el panel de Cloudflare Zero Trust:
1. **Subdominio:** Debe ser una etiqueta DNS limpia, alfanumérica y con guiones (ejemplo: `sicic-backend` o `sicic-api`). **Nunca** ingresar barras (`/`) como `sicic-backend/api`.
2. **Dominio:** Seleccionar el dominio validado (ejemplo: `zymtaxis.com`).
3. **Nombre de Host resultante:** `sicic-backend.zymtaxis.com`.
4. **URL del servicio:** `http://localhost:4000` (Protocolo HTTP, Host `localhost`, Puerto 4000).

---

## 3. Guía de Migración al Servidor Local Definitivo

Cuando se traslada el backend desde la máquina de desarrollo a la máquina que quedará como servidor permanente:

### Paso 1: Requisitos de la Máquina Servidor
* Sistema Operativo: Windows Server, Windows 10/11 Pro, o Linux (Ubuntu Server 22.04 LTS+).
* Node.js (v18 o v20 LTS).
* PostgreSQL (v16 o v17).
* Git.

### Paso 2: Instalación de Bases de Datos
1. Crear las dos bases de datos en PostgreSQL:
   ```sql
   CREATE DATABASE db_sicic_insai_master;
   CREATE DATABASE db_insai_operativa;
   ```
2. Restaurar los esquemas y datos iniciales mediante `pg_restore` o migración con Prisma.

### Paso 3: Clonación y Variables de Entorno
1. Clonar el repositorio y acceder a la carpeta `backend/`:
   ```bash
   git clone <URL_REPOSITORIO>
   cd SICIC-INSAI-V2.0/backend
   npm install
   ```
2. Configurar el archivo `.env`:
   ```env
   NODE_ENV=production
   PORT=4000
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_segura
   DB_HOST=localhost
   DB_PORT=5432
   MASTER_DATABASE_URL="postgresql://postgres:tu_contraseña_segura@localhost:5432/db_sicic_insai_master?schema=public"
   JWT_SECRET=tu_jwt_secret_robusto
   CORS_ORIGIN=https://tu-frontend.vercel.app,http://localhost:5173
   ```
3. Generar clientes de Prisma:
   ```bash
   npm run prisma:generate
   ```

### Paso 4: Instalar y Activar el Túnel de Cloudflare como Servicio
En la máquina definitiva, puedes utilizar el mismo conector del túnel existente:
```powershell
# En Windows (PowerShell Administrador)
cloudflared.exe service install <TOKEN_PROPORCIONADO_POR_CLOUDFLARE>
```
* Esto crea un servicio del sistema que se inicia automáticamente con el arranque de la máquina, garantizando disponibilidad 24/7 sin requerir sesiones interactivas de usuario abiertas.

### Paso 5: Gestión de Proceso con PM2 (Opcional pero Recomendado)
```bash
npm install -g pm2
pm2 start src/index.js --name "sicic-backend"
pm2 save
pm2 startup
```

---

## 4. Estrategia Dual de Almacenamiento de Archivos (Local vs R2/S3)

El servicio [`image.service.js`](../src/services/image.service.js) implementa el patrón Estrategia controlado por la variable de entorno `STORAGE_MODE`:

### Modo 1: Almacenamiento Local (`STORAGE_MODE=local`)
* Las imágenes de inspecciones, hierros ganaderos y seguimientos se guardan en el disco local: `backend/uploads/`.
* Son servidas estáticamente a través de la ruta `/uploads/...` en Express.
* **Ventajas:** No genera costos de ancho de banda en la nube, los datos residen en la infraestructura física de la institución.

### Modo 2: Cloudflare R2 / AWS S3 (`STORAGE_MODE=r2`)
* Se conectan credenciales de bucket compatible con S3:
  ```env
  STORAGE_MODE=r2
  R2_ACCOUNT_ID=tu_account_id
  R2_ACCESS_KEY_ID=tu_access_key
  R2_SECRET_ACCESS_KEY=tu_secret_key
  R2_BUCKET_NAME=insai-uploads
  R2_PUBLIC_URL=https://archivos.zymtaxis.com
  ```
* Las fotos se optimizan y suben automáticamente al bucket global de Cloudflare R2 sin tarifas de salida (Zero Egress Fees).

---

## 5. Arquitectura Multi-Tenant Dinámica Dual

El archivo [`prisma.js`](../src/config/prisma.js) maneja dos clientes Prisma en simultáneo:

1. **`masterPrisma` (Cliente Central):**
   * Conectado permanentemente a `db_sicic_insai_master`.
   * Administra usuarios globales, sesiones, auditoría global de bitácora, catálogo de instancias/sedes territoriales y la matriz de roles y permisos.
2. **`tenantPrisma` (Fábrica Dinámica por Sede):**
   * Basado en la instancia seleccionada por el usuario (en el token JWT o cabecera `x-instance-id`), resuelve dinámicamente la base de datos operativa correspondiente (ejemplo: `db_insai_operativa`).
   * Garantiza que los registros de fincas, predios, solicitudes, inspecciones, actas de silos y avales sanitarios de una sede permanezcan aislados.

