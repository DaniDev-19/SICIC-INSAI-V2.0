# Estándar de Búsqueda Multitérmino Tokenizada y Búsqueda Global - SICIC-INSAI V2.0

Este manual documenta el estándar de búsqueda multitérmino implementado en el backend para todos los controladores del sistema, así como el funcionamiento del motor de Búsqueda Global (`/api/search`).

---

## 1. Motivación y Principio Operativo

Anteriormente, las búsquedas simples por parámetro `q` comparaban únicamente una cadena completa contra una sola columna (por ejemplo, `nombre CONTAINS q`). Esto provocaba resultados limitados cuando un usuario buscaba por múltiples palabras (ejemplo: `"Juan San Juan"` o `"Finca La Esperanza RIF J-123456"`).

El **Estándar de Búsqueda Multitérmino Tokenizada** descompone la cadena de consulta en palabras o términos independientes (tokens por espacios en blanco) y construye estructuras dinámicas de filtrado en Prisma `AND` / `OR`.

---

## 2. Algoritmo de Tokenización Backend

En los controladores del backend (como `propiedades.controller.js`, `clientes.controller.js`, `solicitudes.controller.js`, `planificaciones.controller.js`, etc.), el parámetro de consulta `q` se procesa mediante los siguientes pasos:

1. **Sanitización y Split:**
   ```javascript
   const terms = q.trim().split(/\s+/).filter(Boolean);
   ```
2. **Construcción de Filtros Dinámicos (Prisma Query Builder):**
   Para cada término (token), se exige que coincida en al menos una de las columnas relevantes (o tablas vinculadas) mediante una cláusula `OR`.
3. **Combinación General (`AND`):**
   Todos los términos requeridos deben cumplirse simultáneamente mediante un arreglo `AND`.

### Ejemplo Técnico de Código:

```javascript
// Construcción de cláusula 'where' para Propiedades
let whereClause = {};

if (q) {
  const terms = q.trim().split(/\s+/).filter(Boolean);
  if (terms.length > 0) {
    whereClause.AND = terms.map((term) => ({
      OR: [
        { nombre: { contains: term, mode: 'insensitive' } },
        { codigo_insai: { contains: term, mode: 'insensitive' } },
        { rif: { contains: term, mode: 'insensitive' } },
        { punto_referencia: { contains: term, mode: 'insensitive' } },
        { clientes: { nombre: { contains: term, mode: 'insensitive' } } },
        { clientes: { cedula_rif: { contains: term, mode: 'insensitive' } } }
      ]
    }));
  }
}
```

---

## 3. Comportamiento y Coincidencia de Resultados

Gracias a esta estructura:
- Si el usuario busca `"Pedro Finca Aragua"`, la consulta garantiza que el resultado contenga el término **"Pedro"** (ej: en el cliente), **"Finca"** (ej: en el nombre de la propiedad) y **"Aragua"** (ej: en el punto de referencia).
- Es totalmente insensible a mayúsculas y minúsculas (`mode: 'insensitive'`).
- Permite buscar en entidades relacionadas (ej. buscar una Inspección por la cédula del cliente o nombre de la finca).

---

## 4. Endpoint de Búsqueda Global (`/api/search`)

El backend ofrece un punto de entrada centralizado en `search.controller.js` y `search.routes.js` que ejecuta búsquedas paralelas concurrentes sobre los módulos principales del ERP.

### Detalles del Endpoint:
- **Ruta:** `GET /api/search`
- **Parámetros HTTP:** `?q=cadena_de_busqueda`
- **Autenticación:** Requiere JWT activo y header de instancia operativa seleccionada (`x-instance-id`).

### Respuesta JSON Estandarizada:

```json
{
  "query": "Carabobo Pedro",
  "results": {
    "propiedades": [ ... ],
    "clientes": [ ... ],
    "solicitudes": [ ... ],
    "planificaciones": [ ... ],
    "inspecciones": [ ... ],
    "empleados": [ ... ]
  },
  "totalMatches": 12
}
```

---

## 5. Mapeo de Entidades Compatibles

Los siguientes módulos integran este estándar de búsqueda tokenizada:
- **Propiedades & Predios:** Búsqueda por código INSAI, nombre, RIF, punto de referencia y datos del propietario.
- **Clientes / Productores:** Búsqueda por cédula/RIF, nombre, código RUNSAI, teléfono y dirección.
- **Solicitudes:** Búsqueda por código de trámite, estatus, descripción y datos del solicitante.
- **Planificaciones:** Búsqueda por código de plan, actividad, punto de encuentro, vehículo y fiscal asignado.
- **Inspecciones & Actas de Silos:** Búsqueda por número de control, atendido por, lugar y observaciones.
- **Empleados & Personal:** Búsqueda por cédula, nombre, apellido, cargo y departamento.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
