# Manual Técnico: Flujo de Datos y Seguridad (Backend)

Este documento describe el funcionamiento interno del motor de roles y permisos del servidor SICIC-INSAI, detallando la interacción entre la base de datos, el ORM y los middlewares de seguridad.

## 1. Ciclo de Vida de una Petición (Roles API)

Cada petición al módulo de roles sigue una ruta crítica de validación antes de tocar la base de datos:

1.  **Capa de Ruta (`router`)**: Define el endpoint (ej. `POST /api/roles`).
2.  **Middleware `requireAuth`**: Valida el JWT del usuario y recupera su perfil global.
3.  **Middleware `checkPermission`**: Es el motor de RBAC. Compara los privilegios del rol del usuario (almacenados en la sesión) contra la acción requerida.
4.  **Controlador (`role.controller.js`)**: Ejecuta la lógica de negocio (validaciones de unicidad, formateo de JSON).
5.  **ORM (`Prisma`)**: Realiza la persistencia final en PostgreSQL.

## 2. Persistencia y Esquema (`Master Database`)

El sistema utiliza una arquitectura multi-propósito donde los roles se almacenan en la base de datos **Master** (`insai_master`).

### Estructura del Objeto de Rol
- **`permisos` (JSONB)**: Este es el campo más crítico. Almacena un mapa de objetos donde la clave es la pantalla y el valor es un array de acciones permitidas. Prisma lo entrega como un objeto nativo de JavaScript tras la consulta.
- **`status` (Boolean)**: Controla la disponibilidad del rol sin romper relaciones históricas. Un rol `status: false` sigue existiendo pero es filtrado o rechazado durante el proceso de login/asignación.

## 3. Motor de Validación de Permisos

El middleware en `src/middlewares/permission.middleware.js` funciona mediante una lógica de "Círculos de Confianza":

- **Nivel 0 (Bypass)**: Si detecta `{ all: ['*'] }`, el usuario tiene acceso total (Super Admin).
- **Nivel 1 (Seccional)**: Si la pantalla tiene `['*']`, se omiten las verificaciones de acciones individuales para esa sección.
- **Nivel 2 (Granular)**: Realiza una búsqueda mediante `.includes(action)` dentro del array de la pantalla solicitada.

## 4. Sincronización del Cliente Prisma

Dado que el servidor utiliza tipos generados, la ejecución de `npx prisma generate` es el paso que "enseña" al código las nuevas columnas de la base de datos. Sin este paso, el motor de Prisma filtrará los campos nuevos (como `status`) antes de enviarlos al controlador, provocando inconsistencias entre la DB y el API.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
