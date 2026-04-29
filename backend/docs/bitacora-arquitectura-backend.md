# Arquitectura de Auditoría y Bitácora - Backend

Este manual describe el funcionamiento técnico del motor de auditoría (Bitácora) del sistema SICIC-INSAI V2.0.

---

## Descripción General

El módulo de Bitácora es el encargado de registrar de forma inmutable todas las acciones críticas realizadas por los usuarios en el sistema. Proporciona una trazabilidad completa de quién, cuándo y qué cambió en cada módulo operativo.

## Componentes Técnicos

### 1. Controlador (`BitacoraController`)
Gestiona la lógica de recuperación de logs y catálogos de módulos. Implementa:
- **Paginación Robusta**: Retorna metadatos de paginación (`total`, `page`, `pages`) compatibles con el frontend.
- **Filtrado Avanzado**: Permite filtrar por usuario, acción (CREAR, ACTUALIZAR, ELIMINAR, etc.) y módulo de origen.

### 2. Endpoints de la API
- **`GET /api/bitacora`**: Recupera el listado paginado de logs.
- **`GET /api/bitacora/modulos`**: Recupera la lista única de módulos que han generado actividad (para el filtro de la UI).

### 3. Seguridad y Permisos
El acceso a la auditoría está protegido por el middleware de RBAC:
```javascript
router.get('/', checkPermission('bitacora', 'see'), bitacoraController.getLogs);
```
Solo los roles con el permiso explícito pueden visualizar los movimientos del sistema.

---

## Estructura de Datos (Logs)

Cada registro de la bitácora contiene:
- **Identidad**: ID del usuario global y nombre de usuario.
- **Acción**: El verbo de la operación realizada.
- **Payload**: El estado anterior y posterior del objeto modificado (en formato JSON).
- **Módulo**: El componente del sistema donde ocurrió el evento.

---

## 4. Manual del Desarrollador: Cómo Registrar Eventos

Para registrar una acción en cualquier controlador, se debe importar y usar el `bitacoraService`:

```javascript
import bitacoraService from '../services/bitacora.service.js';

// Ejemplo de uso
bitacoraService.registrar({
  req,             // Objeto de la petición (para extraer usuario e IP)
  accion: 'CREAR',  // Verbo de la acción (CREAR, ACTUALIZAR, ELIMINAR, EXPORTAR)
  modulo: 'Nombre', // El módulo que genera el log
  payload_previo: objetoViejo, // (Opcional) Estado antes del cambio
  payload_nuevo: objetoNuevo   // (Opcional) Estado después del cambio
});
```


---
_Para la implementación visual de estos datos, consulte la [Documentación de Bitácora Frontend](../../frontend/docs/bitacora-arquitectura-frontend.md)._

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
