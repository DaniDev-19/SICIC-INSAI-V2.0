# Arquitectura de Auditoría e Interfaz de Bitácora - Frontend

Este manual detalla la implementación de la interfaz de usuario para el módulo de Bitácora, optimizada para alto rendimiento y consistencia visual en el SICIC-INSAI V2.0.

---

## Características Principales

### 1. Gestión de Datos con TanStack Query
La Bitácora utiliza un hook personalizado `useBitacora` que centraliza toda la lógica de obtención de datos y caché:
- **Caché Inteligente**: Los logs se mantienen como "frescos" durante 30 segundos, eliminando peticiones redundantes.
- **Paginación Unificada**: Sigue el estándar de nombres del proyecto (`totalCount`, `totalPages`, `currentPage`).
- **Optimización de Carga**: Uso de `placeholderData` para evitar parpadeos visuales al cambiar de página o filtros.

### 2. Búsqueda Híbrida Dinámica
Para igualar la fluidez del módulo de Roles, se implementó un sistema doble:
- **Filtro Local (0ms)**: Uso de `useMemo` para filtrar instantáneamente los registros que ya están visibles en la tabla mientras el usuario escribe.
- **Debounce de 300ms**: El buscador espera un breve periodo antes de disparar la búsqueda profunda en el servidor, protegiendo el backend.

### 3. Estética Forest Slate y Consistencia
- **Sincronización Visual**: El `SearchInput` y los filtros comparten exactamente los mismos estilos de bordes (11px), sombras y desenfoques que el resto del sistema.
- **Modal de Auditoría**: El visor de detalles de logs es totalmente compatible con **Modo Claro** y **Modo Oscuro**, utilizando variables de tema (`muted`, `secondary`, `foreground`) en lugar de colores estáticos.

---

## Estructura del Código

### Hook Principal (`use-bitacora.ts`)
```typescript
const { logs, pagination, isLoading, setPage, setUsername } = useBitacora();
```
Encapsula el fetch al `bitacoraService` y el manejo de estados de filtrado.

### Servicio de API (`bitacora.service.ts`)
Estandarizado como un objeto exportado que utiliza el `apiClient` global, heredando automáticamente la seguridad JWT.

---

## Guía de Mantenimiento
- **Actualizar Límites**: Si se desea cambiar el número de registros por defecto, modificar el `useState` del `limit` en el hook `use-bitacora.ts`.
- **Nuevos Filtros**: Agregar la nueva propiedad al `queryKey` de React Query dentro del hook para que la caché se invalide automáticamente al cambiar el filtro.

---
_Para el funcionamiento interno del servidor, consulte la [Documentación de Bitácora Backend](../../backend/docs/bitacora-arquitectura-backend.md)._

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**