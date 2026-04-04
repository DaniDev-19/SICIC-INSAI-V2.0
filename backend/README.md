# 🛡️ SICIC-INSAI V2.0 - Backend Core

Motor de servicios backend para el Sistema Integral de Control de Insumos y Certificaciones (SICIC) del INSAI. Implementado con una arquitectura **Multi-Tenant dinámica** y **PostgreSQL**.

## 🏗️ Arquitectura
El sistema utiliza un enfoque de **Base de Datos Maestro** para la gestión de acceso y **Bases de Datos Operativas** independientes para cada instancia o período de tiempo. Esto permite una escalabilidad horizontal masiva sin comprometer la integridad de los datos.

### Tecnologías Principales
*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js
*   **ORM:** Prisma (Dual Schema)
*   **Seguridad:** JWT (JSON Web Token), bcrypt, Helmet, CORS
*   **Validación:** Zod

## 🚀 Inicio Rápido

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar Entorno:**
    Crea un archivo `.env` basado en la sección de seguridad de la documentación.
3.  **Generar Clientes Prisma:**
    ```bash
    npm run prisma:generate
    ```
4.  **Correr en Desarrollo:**
    ```bash
    npm run dev
    ```

## 📂 Estructura de Carpetas
*   `/src/config`: Configuraciones globales y fábrica de Prisma.
*   `/src/controllers`: Lógica de negocio por módulo.
*   `/src/middlewares`: Capas de seguridad y manejo de errores.
*   `/src/routes`: Definición de endpoints de la API.
*   `/src/schemas`: Esquemas de validación de datos (Zod).
*   `/prisma`: Definiciones de esquemas para Master y Operativa.

---
Para más detalles técnicos, consulta la [WIKI de Backend](./WIKI.md).
