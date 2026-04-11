# Manual Técnico: Flujo de Datos y Seguridad (Backend V2.0)

Este documento describe el funcionamiento interno del motor de roles y permisos del servidor SICIC-INSAI, detallando la interacción entre la base de datos, el ORM y los mecanismos de integridad referencial.

## 1. Ciclo de Vida de una Petición (Roles API)
Cada petición al módulo de roles sigue una ruta crítica de validación antes de tocar la base de datos:

1.  **Capa de Ruta (`router`)**: Define el endpoint (ej. `POST /api/roles`).
2.  **Capa de Validación (`validateSchema`)**: Intercepta el `body` para asegurar que el contrato de datos sea correcto antes de procesar lógica de negocio.
3.  **Middleware `protect`**: Valida el JWT del usuario y recupera su perfil global desde la Master DB.
4.  **Middleware `checkPermission`**: Es el motor de RBAC. Compara los privilegios del rol del usuario contra la acción requerida.
5.  **Controlador (`role.controller.js`)**: Ejecuta la lógica de negocio y validaciones de integridad.
6.  **ORM (`Prisma`)**: Realiza la persistencia final en PostgreSQL.

## 2. Motor de Integridad y Borrado Masivo (`deleteManyRoles`)
Para garantizar la estabilidad del sistema, se ha implementado un motor de borrado inteligente que protege las relaciones activas.

### 2.1. Lógica de Purgado en Lote
El endpoint `POST /api/roles/bulk-delete` no realiza un borrado directo, sino un proceso de **filtrado por dependencia**:
1. **Pre-validación**: Verifica que se reciban máximo 50 IDs (techo de seguridad).
2. **Chequeo de Uso**: Consulta la tabla `usuario_instancia` para identificar qué roles de la lista están actualmente asignados a usuarios activos.
3. **Segregación**: Separa los IDs en `deletableIds` (limpios) e `inUseIds` (protegidos).
4. **Respuesta Híbrida**: 
    - Si todos se borran: Retorna `200 Success`.
    - Si hay bloqueos: Retorna `200 Warning`, detallando qué roles fueron omitidos para preservar la integridad del sistema.

## 3. Persistencia y Matriz de Permisos
El sistema utiliza una arquitectura de base de datos dividida:

- **Master Database (`insai_master`)**: Almacena los roles de forma global.
- **Campo `permisos` (JSONB)**: Almacena el grafo de privilegios. Al ser un tipo JSONB en PostgreSQL, permite consultas rápidas y una estructura flexible que el API consume como un objeto nativo.
- **Validación de Estatus**: El campo `status` actúa como un interruptor lógico (`soft-toggle`). El motor de seguridad rechaza cualquier intento de sesión con un rol inactivo.

## 4. Middleware de Filtro de Seguridad
El motor de filtrado en el backend asegura que un usuario no pueda degradar su propia seguridad. Por ejemplo:
- Se prohíbe la desactivación del rol propio.
- Se prohíbe el borrado de roles que tengan al menos una instancia de usuario vinculada, garantizando que no existan "usuarios huérfanos" en el sistema.

---
[Volver al índice de documentación](../WIKI.md)

**Arquitectura de Backend - SICIC-INSAI V2.0**
