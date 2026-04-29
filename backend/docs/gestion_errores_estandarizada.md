# Gestión de Errores Estandarizada - SICIC-INSAI V2.0

El backend implementa un sistema centralizado de captura de errores (`errorHandler`) que garantiza respuestas consistentes, seguras y descriptivas para el frontend.

---

## 1. Errores de Validación (Zod)
Cuando una petición no cumple con el esquema definido en `src/schemas/`, el sistema responde automáticamente:
- **Status HTTP:** `400 Bad Request`
- **Cuerpo:** Incluye un arreglo `errors` detallando el campo exacto y el motivo del fallo.
- **Objetivo:** Facilitar al frontend el resaltado de campos inválidos en los formularios.

---

## 2. Errores de Base de Datos (Prisma)
El sistema mapea códigos internos del ORM a estándares HTTP para una mejor semántica:

| Código Prisma | Significado | Status HTTP | Mensaje al Usuario |
| :--- | :--- | :--- | :--- |
| **P2002** | Conflicto de Unicidad | `409 Conflict` | "Ya existe un registro con ese dato único (Target)" |
| **P2003** | Violación de Integridad | `400 Bad Request` | "No se puede completar la operación por restricción de llave foránea" |
| **P2025** | Registro No Encontrado | `404 Not Found` | "El registro solicitado no fue encontrado" |
| **P2000** | Longitud Excedida | `400 Bad Request` | "El valor proporcionado es demasiado largo para el campo" |

---

## 3. Errores de Autenticación y Seguridad (JWT)
Se diferencian los fallos de acceso para mejorar la experiencia de usuario:
- **JsonWebTokenError:** Responde con `401 Unauthorized` (Token inválido).
- **TokenExpiredError:** Responde con `401 Unauthorized` avisando específicamente que la **sesión ha expirado** para que el frontend fuerce el re-login.

---

## 4. Diferenciación por Entorno (Dev vs Prod)

Para maximizar la seguridad sin perder capacidad de depuración, el `errorHandler` se comporta distinto según el `NODE_ENV`:

### En Desarrollo (`development`):
- Se muestra el `stack` completo del error.
- Se incluye el detalle técnico del error de Prisma o Zod.
- Se imprime un bloque visual en la consola del servidor con el rastro del error.

### En Producción (`production`):
- Se oculta el `stack trace` y detalles técnicos internos.
- Solo se envía un mensaje amigable y el código de estado.
- Se previene la fuga de información sensible sobre la estructura de la base de datos.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
