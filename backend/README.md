# SICIZ-INSAI V2.0 - Backend Core

Motor de servicios backend para el Sistema Integral de Control de Insumos y Certificaciones (SICIZ) del Instituto Nacional de Salud Agrícola Integral (INSAI). Desarrollado con una arquitectura Multi-Tenant dinámica, PostgreSQL y compatibilidad con despliegue híbrido (Servidor Local con Túneles Cloudflare Zero Trust o Nube).

---

## Arquitectura del Sistema

El backend implementa un patrón de Base de Datos Dual:
1. **Base de Datos Master (`db_sicic_insai_master`):** Centraliza la gestión de usuarios globales, autenticación (JWT + MFA/TOTP), bitácora de auditoría, control de acceso basado en roles (RBAC dinámico) y catálogo de sedes territoriales.
2. **Bases de Datos Operativas (`db_insai_operativa`, etc.):** Aisladas por sede o instancia territorial, almacenan la información productiva (solicitudes, predios, productores, inspecciones generales, inspecciones de silos, avales zoosanitarios y kardex de insumos).

### Tecnologías Principales
* **Runtime:** Node.js (v18+) con sintaxis ECMAScript Modules (`"type": "module"`).
* **Framework:** Express.js 5.x.
* **ORM:** Prisma 6.x (Dual Client: MasterClient y OperativeClient).
* **Seguridad:** JWT, bcrypt, Rate Limiting, Helmet, CORS dinámico e Idempotencia.
* **Conectividad:** Cloudflare Zero Trust Tunnels (`cloudflared`).
* **Almacenamiento:** Estrategia dual (Local en `backend/uploads/` o Cloudflare R2 / AWS S3).
* **Reportes Oficiales:** PDFKit y ExcelJS para exportaciones institucionales con firmas y códigos territoriales.

---

## Inicio Rápido

### 1. Instalación de Dependencias
```bash
cd backend
npm install
```

### 2. Configuración del Entorno
Crea un archivo `.env` en `backend/`:
```env
NODE_ENV=development
PORT=4000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
MASTER_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db_sicic_insai_master?schema=public"
JWT_SECRET=super_secret_jwt_key_insai_2026
CORS_ORIGIN=http://localhost:5173,https://sicic-insai-v2-0.vercel.app
STORAGE_MODE=local
```

### 3. Generación de Clientes Prisma
```bash
npm run prisma:generate
```

### 4. Ejecución en Desarrollo
```bash
npm run dev
```

---

## Estructura de Directorios

```bash
backend/
|-- prisma/
|   |-- master.prisma          # Esquema de autenticacion, usuarios, roles y sedes
|   +-- schema.prisma          # Esquema operativo de inspecciones, predios y avales
|-- src/
|   |-- config/                # Prisma Dual Factory, Base de datos y CORS
|   |-- controllers/           # Controladores de logica de negocio por modulo
|   |-- middlewares/           # Autenticacion, RBAC, Idempotencia, Rate-Limits y Errores
|   |-- routes/                # Definicion de rutas REST por modulo
|   |-- schemas/               # Validaciones de entrada estrictas con Zod
|   |-- services/              # Generacion de PDFs, Excel, Notificaciones y Almacenamiento
|   +-- utils/                 # Criptografia, codigos territoriales y formateadores
|-- uploads/                   # Directorio local de almacenamiento de imagenes
+-- docs/                      # Documentacion tecnica exhaustiva
```

---

## Índice de Documentación Técnica (`backend/docs/`)

Para consultar en profundidad los estándares, flujos y arquitectura del backend:

### Arquitectura e Infraestructura
* **[Arquitectura Híbrida: Nube, Servidor Local y Cloudflare](./docs/arquitectura_hibrida_nube_local.md):** Guía completa de configuración de túneles Cloudflare Zero Trust, migración a servidores locales permanentes y estrategia de almacenamiento dual.
* **[Arquitectura y Flujo de Peticiones](./docs/arquitectura_flujo.md):** Ciclo de vida de una petición HTTP desde Express, validación con Zod, autenticación y fábrica de Prisma.
* **[Middleware de Multi-Tenancia Dinámica](./docs/multi-tenancia-middleware.md):** Resolución de conexiones por sede, aislamiento de datos y selección de instancias.
* **[Patrones de Diseño y Buenas Prácticas](./docs/patrones_diseno_arquitectura.md):** Factory pattern, Singleton de conexiones, Service Layer y separación de responsabilidades.
* **[Servicios y Flujos Optimizados](./docs/servicios_y_flujos_optimizados.md):** Optimización de consultas Prisma, índices y transacciones atómicas.
* **[Guía de Comandos y Scripts](./docs/guia_comandos.md):** Comandos de CLI, migraciones, tunnels y utilitarios del backend.
* **[Estrategia de Respaldos y Recuperación](./docs/estrategia_respaldos_y_recuperacion.md):** Metodologías de respaldo lógico con PostgreSQL (`pg_dump`/`pg_restore`), scripts de automatización Windows/Linux, respaldos de archivos multimedia y planes de recuperación ante desastres (Disaster Recovery).

### Seguridad, Autenticación y Permisos
* **[Seguridad y Robustez de la API](./docs/seguridad_y_robustez_api.md):** Hardening de cabeceras, límites de tasa contra ataques de fuerza bruta y sanitización.
* **[Refactorización de Seguridad de la API](./docs/refactorizacion-seguridad-api.md):** Directrices de seguridad implementadas en la versión 2.0.
* **[Autenticación y MFA / TOTP](./docs/autenticacion-mfa-backend.md):** Flujo de inicio de sesión seguro en dos pasos con Google Authenticator y códigos de respaldo.
* **[Control de Acceso Basado en Roles (RBAC)](./docs/flujo-roles-backend.md):** Matriz dinámica de permisos (`see`, `create`, `update`, `delete`, `export`), Inspector Jefe/Encargado de Visita y validación territorial.
* **[Gestión Centralizada en Base de Datos Master](./docs/gestion_centralizada_master.md):** Administración central de instancias, cuentas de usuario y sesiones concurrentes.
* **[Gestión de Perfil de Usuario](./docs/gestion-perfil-usuario-backend.md):** Endpoints de actualización de credenciales, avatar y activación de seguridad personal.

### Módulos Operativos y Lógica de Negocio
* **[Flujo Operativo de Inspecciones y Silos](./docs/flujo_operativo_inspecciones.md):** Proceso de campo desde la solicitud hasta la planificación, vaciado de inspección, firma y actas.
* **[Gestión de Inventario y Kardex Inteligente](./docs/gestion_inventario_inteligente.md):** Control de existencias de insumos por oficina, alertas de stock mínimo y trazabilidad de consumo en avales sanitarios.
* **[Generación de Reportes PDF y Excel](./docs/generacion_reportes_pdf_excel.md):** Generación de documentos oficiales con números de control territoriales, marcas de agua y tablas estadísticas.
* **[Búsqueda Multi-término Estándar](./docs/busqueda_multitermino_estandar.md):** Búsqueda flexible en catálogos y tablas con operadores insensibles a mayúsculas/minúsculas y acentos.
* **[Notificaciones y Correo Electrónico](./docs/notificaciones_y_correo.md):** Integración con Resend / SMTP para alertas de inspección y comunicaciones oficiales.
* **[Bitácora y Auditoría de Acciones](./docs/bitacora-arquitectura-backend.md):** Registro inmutable de eventos críticos para trazabilidad institucional.
* **[Gestión Estandarizada de Errores](./docs/gestion_errores_estandarizada.md):** Manejo centralizado de excepciones y respuestas JSON consistentes.
