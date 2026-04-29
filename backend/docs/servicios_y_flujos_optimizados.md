# Servicios Globales y Flujos Optimizados - SICIC-INSAI V2.0

Este documento explica el funcionamiento de los servicios transversales de **Imágenes** y **Excel**, así como el patrón de diseño implementado para la gestión eficiente de recursos con tablas puente.

---

## 1. Gestión de Imágenes (`StorageService`)

El sistema implementa un servicio de almacenamiento inteligente que abstrae la complejidad del destino de los archivos.

### Características Principales:
- **Doble Modo de Operación:** Configurable vía `.env` mediante la variable `STORAGE_MODE`.
    - `local`: Almacena en la carpeta física `/uploads` del servidor (ideal para redes cerradas).
    - `r2`: Utiliza Cloudflare R2 (compatible con S3) para despliegues en la nube.
- **Conversión Automática:** Todas las imágenes se transforman a formato **.webp** mediante la librería `sharp`, optimizando el espacio y la velocidad de carga.
- **Limpieza Física Automática:** Al actualizar o eliminar un registro, el servicio se encarga de borrar el archivo físico del disco o de la nube, evitando el almacenamiento de "archivos huérfanos".

### Flujo de Uso en Controladores:
1. El middleware `upload` captura el archivo en memoria.
2. El controlador llama a `storageService.uploadImage(buffer, nombre, carpeta)`.
3. Se guarda la URL generada en la base de datos.

---

## 2. Generación de Reportes (`ExcelService`)

Para garantizar reportes profesionales y estandarizados, se utiliza un servicio basado en `exceljs`.

### Estándares del Reporte:
- **Identidad Visual:** Aplica automáticamente colores institucionales (Verde INSAI) y fuentes legibles (Arial).
- **Dinamismo:** El título se centra automáticamente al ancho total de las columnas.
- **Totalización:** Al final de cada hoja, se añade automáticamente una fila de **"TOTAL DE REGISTROS"**.
- **Usabilidad:** Los encabezados incluyen auto-filtros nativos de Excel.

### Ejemplo de Implementación:
El endpoint `GET /export` de cualquier módulo (ej: Empleados, Clientes) recupera la información completa de la DB y la procesa a través de este servicio sin afectar la paginación de la vista principal.

---

## 3. Patrón de Controladores Optimizados (Atomic Resource Management)

Para entidades complejas con múltiples tablas puente (como **Programas**, **Empleados** o **Propiedades**), se ha implementado el patrón de **Escrituras Anidadas (Prisma Nested Writes)**.

### ¿Por qué este patrón?
En lugar de tener endpoints separados para "Vincular Plaga" o "Agregar Dirección", el controlador principal gestiona todo el recurso en una sola operación.

### Ventajas:
1. **Transaccionalidad:** Se guarda todo o no se guarda nada. Evita datos inconsistentes.
2. **Eficiencia de Red:** Una sola petición `POST` o `PUT` desde el frontend envía el recurso completo con sus relaciones.
3. **Simplicidad en el Frontend:** El desarrollador de UI no necesita manejar estados de carga para 5 peticiones diferentes.

### Ejemplo de Estructura de Datos (JSON):
```json
{
  "nombre": "Predio La Esperanza",
  "due_o_id": 1,
  "ubicacion": { "sector_id": 5, "google_maps_url": "..." },
  "cultivos": [
    { "cultivo_id": 1, "superficie": 10, "superficie_unidad_id": 2 },
    { "cultivo_id": 3, "superficie": 5, "superficie_unidad_id": 2 }
  ]
}
```

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
