# Manual Técnico: Gestión de Roles y UI (Frontend)

Este documento describe la arquitectura funcional y los flujos lógicos del módulo de Roles en el frontend del sistema SICIC-INSAI.

## 1. Estructura del Componente Principal (`Roles.tsx`)

El archivo se organiza bajo un patrón de "Vista Inteligente" que coordina sub-componentes de UI con ganchos (hooks) de lógica de negocio.

### Arquitectura de Componentes
- **Dialog (Modal)**: Actúa como el contenedor principal de edición/creación. Utiliza un estado `isOpen` para montar/desmontar el formulario de forma reactiva.
- **Formulario Central**: Organizado en secciones (Identidad, Estado, Matriz). Utiliza un estado local `formData` que se sincroniza con el objeto del backend.
- **AlertDialog**: Un componente desacoplado del flujo principal que intercepta la acción de borrado para requerir confirmación explícita del usuario.

## 2. Gestión de Estados y Datos

El flujo de datos utiliza **TanStack Query (React Query)** para garantizar la consistencia entre el cliente y el servidor.

- **`useRoles()` (Hook Personalizado)**: 
    - `roles`: Sincroniza la lista global en tiempo real.
    - `createRole/updateRole`: Mutaciones asíncronas que invalidan la caché (`invalidateQueries`) tras el éxito, forzando una actualización automática de la tabla sin recargar la página.
- **`formData`**: Estado local que clona el objeto del rol al entrar en modo edición, permitiendo cambios "en sucio" que solo se persisten al pulsar "Guardar".

## 3. Lógica de la Matriz de Privilegios

La matriz es un generador dinámico basado en dos constantes: `PANTALLAS` y `ACCIONES`.

### Flujo de Marcado
1. **Detección**: Para cada celda, el componente verifica si la pantalla actual soporta la acción (`isSupported`).
2. **Estado**: Se consulta si el permiso existe dentro del JSON `formData.permisos[pantallaKey]`.
3. **Actualización**: Al pulsar un `Switch`, la función `handleTogglePermission` realiza una operación de array (añadir/quitar) sobre el JSON local, manteniendo la estructura que el backend espera recibir.

## 4. Sistema de Diseño (Design System)

La interfaz se rige por variables CSS definidas en `index.css`:
- **Tematización**: Utiliza `@theme` de Tailwind 4 para mapear variables HSL.
- **Glassmorphism**: Los modales utilizan `backdrop-filter` para generar profundidad visual sin perder el contexto de la aplicación de fondo.

---
[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
